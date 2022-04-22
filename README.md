# AWS WAF Demo #

This repo has a template for setting up an AWS WAF in front of your application using CDK, applying both a Managed Ruleset and some custom rules (inc. geo-restricting the content, so the sneaky Russians cannot access it).

For this example, we'll be deploying the WAF in front of an AWS AppSync GraphQL API, serving requests to a dummy API via AWS Lambda, since we like to serverless all the things! 

Also, there's already a [CDK Pattern](https://github.com/cdk-patterns/serverless/tree/main/the-waf-apigateway) existing for deploying WAF with API Gateway + Lambda, so I thought it might be useful to do one with AppSync.