# AWS WAF Demo #

This repo has a template for setting up an AWS WAF in front of a basic AWS application using CDK v2. 

Including applying both a Managed Ruleset, and an example of a custom rule: geo-restricting access to the content, so the sneaky Russians cannot access it.

For this example, we'll be deploying the WAF in front of an AWS AppSync GraphQL API, serving requests to a dummy API via AWS Lambda, since we like to serverless all the things! 

Also, there's already a [CDK Pattern](https://github.com/cdk-patterns/serverless/tree/main/the-waf-apigateway) existing for deploying WAF with API Gateway + Lambda, so I thought it might be useful to do one with AppSync.

If you wish to deploy this to your own account as a starting point, first make sure that you have logged into AWS SSO & set your default profile correctly in `~/.aws/credentials` before running `yarn bootstrap` if you have not yet bootstrapped your account in the region you wish to deploy.