import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';

export class AwsDailyCostsSlackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdafunc = new lambda.Function(this, 'DailyCosts', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("../src/"),
      handler: "lambda.main",
      timeout: cdk.Duration.seconds(10),
      logRetention: 7,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          'ce:Get*',
          'ce:Describe*',
        ],
        resources: ['*'],
      })]
    });

    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0 7 * * ? *)')
    })

    rule.addTarget(new targets.LambdaFunction(lambdafunc));

  }
}
