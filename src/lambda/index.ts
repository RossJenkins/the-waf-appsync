import {AppSyncResolverEvent, AppSyncResolverHandler} from "aws-lambda";
import {MessageQueryFarewellMessageArgs, MessageQueryWelcomeMessageArgs} from "../generated/resolvers-types";

type QueryArgs = MessageQueryArgs;
type MessageQueryArgs = MessageQueryWelcomeMessageArgs | MessageQueryFarewellMessageArgs;

export const handler: AppSyncResolverHandler<QueryArgs, any> = async (event) => {
    switch (event.info.parentTypeName) {
        case "Query":
            return Promise.resolve({});
        case "MessageQuery":
            return resolveMessageQuery(event);
        default:
            throw `Unexpected query "${event.info.parentTypeName}" found.`
    }
};

const resolveMessageQuery = (event: AppSyncResolverEvent<MessageQueryArgs>) => {
    switch (event.info.fieldName) {
        case "welcomeMessage":
            return resolveWelcomeMessage(event);
        case "farewellMessage":
            return resolveFarewellMessage(event);
        default:
            throw `Unexpected query "${event.info.parentTypeName}.${event.info.fieldName}" found.`
    }
}

const resolveWelcomeMessage = (event: AppSyncResolverEvent<MessageQueryWelcomeMessageArgs>) => {
    return `Hello, ${event.arguments.name}!`;
}

const resolveFarewellMessage = (event: AppSyncResolverEvent<MessageQueryFarewellMessageArgs>) => {
    return `Goodbye, ${event.arguments.name}!`;
}