import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from "aws-cdk-lib/aws-appsync";
import {readFileSync} from "fs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {CfnWebACL, CfnWebACLAssociation} from "aws-cdk-lib/aws-wafv2";
import {Effect, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class AppSyncStack extends Stack {
    // Add AppSync GraphQL API, generate an API key for use and a schema
    private readonly api = new CfnGraphQLApi(this, "graphql-api-id", {
        name: "graphql-api-name",
        authenticationType: "API_KEY",
    });

    private readonly apiKey = new CfnApiKey(this, "graphql-api-key", {
        apiId: this.api.attrApiId,
    });

    private readonly schema = new CfnGraphQLSchema(this, "graphql-api-schema", {
        apiId: this.api.attrApiId,
        definition: readFileSync("./src/graphql/schema.graphql").toString(),
    });

    // Add lambda, plus the required datasource and resolver, as well as the lambda:InvokeFunction IAM Role
    private readonly invokeLambdaRole = new Role(this, "Role", {
        assumedBy: new ServicePrincipal("appsync.amazonaws.com"),
    });

    private readonly lambda = new NodejsFunction(this, "lambda-id", {
        entry: "./src/lambda/index.ts",
        handler: "handler",
        functionName: "lambda-function-name",
        runtime: Runtime.NODEJS_14_X,
    });

    private readonly lambdaDataSource = new CfnDataSource(this, "welcomeMessage-datasource", {
        apiId: this.api.attrApiId,
        // Note: property 'name' cannot include hyphens
        name: "WelcomeMessageDataSource",
        type: "AWS_LAMBDA",
        lambdaConfig: {
            lambdaFunctionArn: this.lambda.functionArn
        },
        serviceRoleArn: this.invokeLambdaRole.roleArn
    });

    private readonly lambdaResolver = new CfnResolver(this, "welcomeMessage-resolver", {
        apiId: this.api.attrApiId,
        typeName: "Query",
        fieldName: "welcomeMessage",
        dataSourceName: this.lambdaDataSource.name,
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
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION
            }
        });

        // Ensure that the lambda resolver is created after the schema.
        this.lambdaResolver.addDependsOn(this.schema);

        // Ensure that AppSync is able to invoke lambdas
        this.invokeLambdaRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [this.lambda.functionArn],
            actions: ["lambda:InvokeFunction"]
        }))
    }
}