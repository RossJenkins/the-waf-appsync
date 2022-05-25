import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from "aws-cdk-lib/aws-appsync";
import {readFileSync} from "fs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {Effect, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

// Creates AppSync API, with schema, and Lambda resolver as datasource.
export class AppSyncStack extends Stack {

    // Add AppSync GraphQL API, generate an API key for use and a schema
    readonly api = new CfnGraphQLApi(this, "graphql-api-id", {
        name: "graphql-api-name",
        authenticationType: "API_KEY",
        xrayEnabled: true
    });

    private readonly schema = new CfnGraphQLSchema(this, "graphql-api-schema", {
        apiId: this.api.attrApiId,
        definition: readFileSync("./src/graphql/schema.graphql").toString(),
    });

    // Add lambda, plus the required datasource and resolvers, as well as create an invoke lambda role for AppSync
    private readonly invokeLambdaRole = new Role(this, "AppSync-InvokeLambdaRole", {
        assumedBy: new ServicePrincipal("appsync.amazonaws.com"),
    });

    private readonly messagesLambdaFunction = new NodejsFunction(this, "messages-lambda-id", {
        entry: "./src/lambda/index.ts",
        handler: "handler",
        functionName: "lambda-function-name",
        runtime: Runtime.NODEJS_14_X,
    });

    private readonly messagesDataSource = new CfnDataSource(this, "messages-datasource", {
        apiId: this.api.attrApiId,
        // Note: property 'name' cannot include hyphens
        name: "MessagesDataSource",
        type: "AWS_LAMBDA",
        lambdaConfig: {
            lambdaFunctionArn: this.messagesLambdaFunction.functionArn
        },
        serviceRoleArn: this.invokeLambdaRole.roleArn
    });

    private readonly messagesResolver = new CfnResolver(this, "messages-resolver", {
        apiId: this.api.attrApiId,
        typeName: "Query",
        fieldName: "messages",
        dataSourceName: this.messagesDataSource.name,
    });

    private readonly welcomeMessageResolver = new CfnResolver(this, "welcomeMessage-resolver", {
        apiId: this.api.attrApiId,
        typeName: "MessageQuery",
        fieldName: "welcomeMessage",
        dataSourceName: this.messagesDataSource.name,
    });

    private readonly farewellMessageResolver = new CfnResolver(this, "farewellMessage-resolver", {
        apiId: this.api.attrApiId,
        typeName: "MessageQuery",
        fieldName: "farewellMessage",
        dataSourceName: this.messagesDataSource.name,
    });

    constructor(scope: Construct) {
        super(scope, "AppSyncStack", {
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION
            }
        });

        new CfnApiKey(this, "graphql-api-key", {
            apiId: this.api.attrApiId,
        });

        // Ensures that the resolvers are created after the schema.
        this.messagesResolver.addDependsOn(this.schema);
        this.welcomeMessageResolver.addDependsOn(this.schema);
        this.farewellMessageResolver.addDependsOn(this.schema);

        // Ensures that AppSync is able to invoke the lambda function.
        this.invokeLambdaRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [this.messagesLambdaFunction.functionArn],
            actions: ["lambda:InvokeFunction"]
        }));
    }

}