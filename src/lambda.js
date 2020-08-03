const AWS = require('aws-sdk');
const moment = require('moment');
const https = require('https');
const appconfig = require('./appconfig.json');

// Init cost explorer
var costexplorer = new AWS.CostExplorer(appconfig.aws);

// Define start and end dates
// I am computing daily costs so start is yesterday, and end is today
// This will compute yesterday's cost
var date = new Date();
var StartDate = moment(date).add(-1, 'd').format('YYYY-MM-DD');
var EndDate = moment(date).format('YYYY-MM-DD');
var StartDateReadable = moment(date).add(-1, 'd').format('MMMM Do, YYYY');

// Main will be triggered by the AWS lambda service.
exports.main = function(event, context) {
    Object.entries(appconfig.values).forEach( ([_,value]) => {

        // create list of account IDs, which is used in the API call towards cost explorer
        accountList = []
        Object.entries(value.accounts).forEach( ([_, value]) => {
            accountList.push(value)
        })

        // config used in the getCostAndUsage API call
        apiConfig = {
            TimePeriod: {
                End: EndDate,
                Start: StartDate
            },
            Granularity: 'DAILY',
            Metrics: ['UNBLENDED_COST'],
            Filter: {
                "Dimensions": {
                    "Key": "LINKED_ACCOUNT",
                    "Values": accountList,
                }
            },
            GroupBy: [
                { 
                    "Key": "LINKED_ACCOUNT",
                    "Type": "DIMENSION"
                }
            ]
        }
        sendCostToSlack(apiConfig, value.accounts, value.slack.webhook)

    })
}

function sendCostToSlack(apiConfig, awsAccounts, webhook) {

    costexplorer.getCostAndUsage(apiConfig, function(err, data) {
        if (err) {
            console.log("Failed to get data from cost explorer");
            console.log(err);
        } else {

            // usually the first 2 or 3 days of the month, AWS will not update the cost.
            // So we capture the response, and if it is empty or undefined, send a warning.

            if (data.ResultsByTime[0].Groups === undefined || data.ResultsByTime[0].Groups == 0) {
                sendSlackMessage([{"title": "WARN", "value": "Cost not updated yet"}], webhook) 
            } else {
                // compute the slack message fields
                let slackFields = data.ResultsByTime[0].Groups.map( (value) => {
                    // value.Keys[0] has the account ID and value.Metrics.UnblendedCost.Amount has the cost associated
                    return prepareSlackMessage(awsAccounts, value.Keys[0], Math.ceil(value.Metrics.UnblendedCost.Amount))
                })
                sendSlackMessage(slackFields, webhook)
            }

        }
    });

}

// This will create an object which is used as slack "fields"
function prepareSlackMessage(awsAccounts, acc, cost) {
    
    var fieldsObject = {};

    // Here we pass accountNumber, so we get an upper cased account name as response
    let accountNameVisibleInSlack = getKey(awsAccounts, acc)
    
    fieldsObject['title'] = accountNameVisibleInSlack
    fieldsObject['value'] = `$${cost}`
    fieldsObject['short'] = true

    return fieldsObject;
}

function getKey(object, value) {
    accountName = Object.keys(object).find(key => object[key] === value)
    return accountName.toUpperCase()
}

// Sending slack message
function sendSlackMessage(fields, webhook) {

    const messageBody = {
        "username": "AWS Bills", // This will appear as user name who posts the message
        "text": `Total daily estimate for *${StartDateReadable}*.`, // text
        "attachments": [{ // this defines the attachment block, allows for better layout usage
            "color": "#000066", // color of the side bar
            "fields": fields,
        }]
    };

    return new Promise( (resolve, reject) => {
        const requestOptions = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            }
        }

        const req = https.request(webhook, requestOptions, (res) => {
            let response = '';

            res.on('data', (d) => {
                response += d;
            });

            res.on('end', () => {
                resolve(response);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(JSON.stringify(messageBody));
        req.end();
    })
}
