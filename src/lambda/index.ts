import {AppSyncResolverHandler} from "aws-lambda";
import {QueryWelcomeMessageArgs} from "../generated/resolvers-types";

export const handler: AppSyncResolverHandler<QueryWelcomeMessageArgs, string> = async (event) => {
    return `Hello, ${event.arguments.name}!`;
};
