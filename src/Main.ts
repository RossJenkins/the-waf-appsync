import {App} from "aws-cdk-lib";
import {AppSyncStack} from "./stacks/AppSyncStack";

function createCloudFormation(): void {
    const app = new App();
    new AppSyncStack(app);
}

createCloudFormation();