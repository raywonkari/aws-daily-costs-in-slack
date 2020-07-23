#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDailyCostsInSlackStack } from '../lib/aws-daily-costs-in-slack-stack';

const app = new cdk.App();
new AwsDailyCostsInSlackStack(app, 'AwsDailyCostsInSlackStack', {
    env: {
        region: 'eu-west-1',
        account: 'XXXXXXXXXX'
    }
});
