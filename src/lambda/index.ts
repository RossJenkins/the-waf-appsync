import {AppSyncResolverEvent, AppSyncResolverHandler} from "aws-lambda";
import {MessageQueryFarewellMessageArgs, MessageQueryWelcomeMessageArgs} from "../generated/resolvers-types";

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
    switch (event.info.parentTypeName) {
        case "Query":
            return Promise.resolve({});
        case "MessageQuery":
            return resolveMessageQuery(event);
    }
};

const resolveMessageQuery = (event: AppSyncResolverEvent<any>) => {
    switch (event.info.fieldName) {
        case "welcomeMessage":
            return resolveWelcomeMessage(event);
        case "farewellMessage":
            return resolveFarewellMessage(event);
    }
}

const resolveWelcomeMessage = (event: AppSyncResolverEvent<MessageQueryWelcomeMessageArgs>) => {
    return `Hello, ${event.arguments.name}!`;
}

const resolveFarewellMessage = (event: AppSyncResolverEvent<MessageQueryFarewellMessageArgs>) => {
    return `Goodbye, ${event.arguments.name}!`;
}