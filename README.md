# The WAF AppSync (CDK v2) #

This repo contains a demo AWS CDK v2 project, used to deploy an AWS AppSync API behind AWS WAF.

It includes the CDK code, as well as the Lambda code used as a resolver, and the GraphQL schema used to a this simple API. This can be used as a starting point for building your own AppSync API using TypeScript!

Additionally, the WAF stack included here can be altered and used as a template for deploying any other web application resource supported by WAF, by simply passing your desired resource's ARN to the stack's constructor.

The Web ACL created as part of the WAF stack is used to apply an AWS Managed Ruleset to protect against the most common web exploits, and can easily be extended to include other managed rulesets as well as custom rules. 

## Deployment ##

If you wish to deploy this application to your own account as a starting point, and it is your first time using AWS CDK, then I'd recommend first checking out [getting started with the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html). 
This should give you some steps to follow in order to install the relevant packages, and some context on bootstrapping your environment.
After installing the AWS CLI, you should run the following steps:

* First, run `aws configure` to ensure that your AWS credentials have been set in the CLI. 
* Next, if your account has not been bootstrapped for your desired deployment region, run `yarn bootstrap`.
* Then simply run `yarn deploy --all` to start the deployment.