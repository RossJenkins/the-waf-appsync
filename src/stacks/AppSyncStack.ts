import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from "aws-cdk-lib/aws-appsync";
import {readFileSync} from "fs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {CfnWebACL, CfnWebACLAssociation} from "aws-cdk-lib/aws-wafv2";

export class AppSyncStack extends Stack {
    // Add AppSync GraphQL API, generate an API key for use and a schema
    private readonly api = new CfnGraphQLApi(this, "graphql-api-id", {
        name: "graphql-api-name",
        authenticationType: "API_KEY"
    });

    private readonly apiKey = new CfnApiKey(this, "graphql-api-key", {
        apiId: this.api.attrApiId,
    });

    private readonly schema = new CfnGraphQLSchema(this, "graphql-api-schema", {
        apiId: this.api.attrApiId,
        definition: readFileSync("../graphql/schema.graphql").toString()
    });

    // Add lambda, plus the required datasource and resolver
    private readonly lambda = new NodejsFunction(this, "lambda-id", {
        entry: "../lambda/index.ts",
        handler: "handler",
        functionName: "lambda-function-name",
        runtime: Runtime.NODEJS_14_X,
    });

    private readonly lambdaDataSource = new CfnDataSource(this, "graphql-api-datasource", {
        apiId: this.api.attrApiId,
        name: "graphql-api-datasource-name",
        type: "AWS_LAMBDA",
        lambdaConfig: {
            lambdaFunctionArn: this.lambda.functionArn
        },
    });

    private readonly lambdaResolver = new CfnResolver(this, "lambda-resolver", {
        apiId: this.api.attrApiId,
        typeName: "Query",
        fieldName: "welcomeMessage",
        dataSourceName: this.lambdaDataSource.name
    });

    // Add all the waf stuff
    private readonly webAcl = new CfnWebACL(this, "web-acl", {
        defaultAction: {
            allow: {}
        },
        scope: "REGIONAL",
        visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "webACL",
            sampledRequestsEnabled: true
        },
        rules: [
            {
                name: "AWS-AWSManagedRulesCommonRuleSet",
                priority: 1,
                overrideAction: {none: {}},
                statement: {
                    managedRuleGroupStatement: {
                        name: "AWSManagedRulesCommonRuleSet",
                        vendorName: "AWS",
                        excludedRules: [{name: "SizeRestrictions_BODY"}]
                    }
                },
                visibilityConfig: {
                    cloudWatchMetricsEnabled: true,
                    metricName: "awsCommonRules",
                    sampledRequestsEnabled: true
                }
            },
        ]
    });

    private readonly wafGatewayAssociation = new CfnWebACLAssociation(this, "web-acl-association", {
        webAclArn: this.webAcl.attrArn,
        resourceArn: this.api.attrArn
    })

    constructor(scope: Construct) {
        super(scope, "AppSyncStack", {
            env: {
                region: "eu-west-1"
            }
        });
    }
}