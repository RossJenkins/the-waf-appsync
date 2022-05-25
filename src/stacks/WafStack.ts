import {Stack} from "aws-cdk-lib";
import {CfnWebACL, CfnWebACLAssociation} from "aws-cdk-lib/aws-wafv2";
import {Construct} from "constructs";

interface Props {
    apiArn: string;
}

// Creates AWS WAF, with Web ACL and rules.
export class WafStack extends Stack {

    // Add Web ACL and rules
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

    constructor(scope: Construct, private props: Props) {
        super(scope, "WafStack", {
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION
            }
        });

        new CfnWebACLAssociation(this, "web-acl-association", {
            webAclArn: this.webAcl.attrArn,
            resourceArn: this.props.apiArn
        });
    }

}