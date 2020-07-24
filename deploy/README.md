## Overview

* I am using AWS CDK, to deploy this project.

```
├── bin
│   └── aws-daily-costs-in-slack.ts
├── cdk.json
├── lib
│   └── aws-daily-costs-in-slack-stack.ts
├── package-lock.json
├── package.json
└── tsconfig.json
```

### lib/

* Here is where, our actual infrastructure as code is defined.
* We are basically creating a lambda function by fetching the code from `../src/` directory, and configuring it with an inline IAM policy which has Get and Describe permissions, and also configuring a cronjob, which would execute the lambda function everyday at 7.00 AM UTC.

### bin/

* Here, we call the lib, and execute it.
* We also added a configuration, i.e., adding the region as well as which account to deploy to.