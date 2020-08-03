# aws-daily-costs-in-slack

## Overview
* This project will send daily AWS cost estimates of AWS accounts in an Organization. Ideally it should be deployed as a lambda function and configured with a daily cron job. The source code is in `src/` directory.
* The lambda function needs to be deployed in the master account, with necessary IAM permissions to access cost explorer APIs.
* This project uses slack's incoming webhook URL, to send the cost info. Refer slack's [doc](https://api.slack.com/messaging/webhooks) for more info.
* Each Cost Explorer API request costs $0.01.

## Prerequisites

### Config:
* Update `src/appconfig.json` with your AWS account IDs and slack channel's incoming webhook URL. You can either specify one group of accounts and one slack webhook, or multiple group of accounts and slack webhooks. WHY THIS GROUPING: This is helpful if we have multiple teams and multiple AWS accounts for each team, so we could send a set of accounts cost to a team's slack channel and so on.. If we do not need to send it to more than one channel, we simply have only one group.
* Update `deploy/bin/aws-daily-costs-in-slack.ts` with your master account ID and the region you wish to deploy.

#### Example Configurations:

```
# One group
{
    "aws": {
        "apiVersion": "2017-10-25",
        "region": "us-east-1"
    },
    "values": [
        {
            "accounts": {
                "account-name-one": "000000000000",
                "account-name-two": "111111111111"
            },
            "slack": {
                "webhook": "https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYY"
            }
        }
    ]
}

# Two groups
{
    "aws": {
        "apiVersion": "2017-10-25",
        "region": "us-east-1"
    },
    "values": [
        {
            "accounts": {
                "account-name-one": "000000000000",
                "account-name-two": "111111111111"
            },
            "slack": {
                "webhook": "https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYY"
            }
        },
        {
            "accounts": {
                "account-name-three": "000000000000",
                "account-name-four": "111111111111"
            },
            "slack": {
                "webhook": "https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYYYYYYYYYYYYYYYYYYYY"
            }
        }
    ]
}

# and so on
```

## Directory Structure

```
.
├── README.md
├── deploy
│   ├── bin
│   │   └── aws-daily-costs-in-slack.ts
│   ├── cdk.json
│   ├── lib
│   │   └── aws-daily-costs-in-slack-stack.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
└── src
    ├── appconfig.json
    ├── lambda.js
    ├── package-lock.json
    └── package.json
```

* `src` consists of the source code of this project. 
* `deploy` consists of the deployment source code, using AWS CDK.

## Deploy
* I am using AWS CDK, to the deploy the code as a lambda function and configure it with cron settings.
* If you would like to use CDK as well, then:

```shell
git clone https://github.com/raywonkari/aws-daily-costs-in-slack.git
cd aws-daily-costs-in-slack/
# update the config. See Prerequisites section.

cd src/
npm install

cd ../deploy/
npm install
tsc
cdk deploy
```

* See `deploy/` directory for some more info on the deployment.
* Alternately, you could use any deployment method, just make sure to install dependencies in `./src/` by running `npm install` & deploy the `./src/` directory in the master account, ideally as a lambda function.

## TODO
1. Dollar is used as default currency. See `line 89` in `./src/lambda.js`. Make it dynamic, so we don't need to hard code the currency.
2. We are computing `UNBLENDED` costs, and it is hard coded. If possible make it dynamic, so we could set the cost type in the appconfig, so that the filter and further processing is done automatically.

## Blog

* This project is used as a reference to my blog post here: https://raywontalks.com/aws-costs-in-slack/
