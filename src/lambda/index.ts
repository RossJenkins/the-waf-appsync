import {AppSyncResolverHandler} from "aws-lambda";
import {MessagesQueryWelcomeMessageArgs} from "../generated/resolvers-types";

export const handler: AppSyncResolverHandler<MessagesQueryWelcomeMessageArgs, string> = async (event) => {
    return `Hello, ${event.arguments.name}!`;
};
