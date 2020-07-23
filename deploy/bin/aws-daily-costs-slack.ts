#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDailyCostsSlackStack } from '../lib/aws-daily-costs-slack-stack';

const app = new cdk.App();
new AwsDailyCostsSlackStack(app, 'AwsDailyCostsInSlackStack', {
    env: {
        region: 'eu-west-1',
        account: 'XXXXXXXXXXX'
    }
});
