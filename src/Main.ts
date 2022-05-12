import {App} from "aws-cdk-lib";
import {AppSyncStack} from "./stacks/AppSyncStack";
import {WafStack} from "./stacks/WafStack";

function createCloudFormation(): void {
    const app = new App();

    const appSyncStack = new AppSyncStack(app);

    new WafStack(app, {
        apiArn: appSyncStack.api.attrArn
    });
}

createCloudFormation();