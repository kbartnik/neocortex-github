import { Result, err, ok } from "neverthrow";
import {gitHubUrl} from "../../gitHubUrl";
import { GitHubClient } from "../../clients/GitHubClient"
import { transformGitHubIssue} from "../../ir/transforms";
import {NotFoundError, InternalError, type GitHubClientError} from "../../errors";
import type { CliError } from "../errors";
import type { GitHubIssueNode } from "../../ir/types";
import {match} from "ts-pattern";
import type {IssueTarget} from "types";

const mapGitHubErrorToCliError = (
    error: GitHubClientError,
    target: IssueTarget
): CliError => match(error)
    // GitHub not_found maps directly to CLI not_found
    .with({type: 'not_found'}, (e) => ({
        type: 'not_found' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        url: e.url
    }))
    // All other GitHub errors map to CLI fetch_failed
    // We preserve the error information in the cause field
    .with({type: 'unauthorized'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .with({type: 'forbidden'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .with({type: 'rate_limited'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .with({type: 'server_error'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .with({type: 'network_error'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .with({type: 'invalid_response'}, (e) => ({
        type: 'fetch_failed' as const,
        target: `${target.owner}/${target.repo}#${target.number}`,
        cause: e
    }))
    .exhaustive();

export const importCommand = async (args: string[]): Promise<Result<GitHubIssueNode, CliError>> => {
    if (args.length === 0) {
        return err({
            type: "missing_argument",
            command: "import",
            expected: "<github-url>"
        });
    }

    // TypeScript doesn't know args[0] is defined even though length > 0
    // So we assert it explicitly to narrow the type
    const url = args[0]
    if (url === undefined) {
        // This should never happen with process.argv, but TypeScript requires the check
        throw new InternalError(
            "args[0] is undefined despite args.length > 0",
            { argsLength: args.length, args }
        );
    }

    const parseResult = gitHubUrl.parse(url);
    if (parseResult.isErr()) {
        return err({
            type: "invalid_url",
            url,
            reason: parseResult.error
        });
    }

    const target = parseResult.value;

    if (target.kind !== "issue") {
        return err({
            type: "unsupported_resource",
            url,
            resourceType: target.kind
        });
    }

    // Now target is narrowed to IssueTarget, so we can access number, owner, repo
    const token = process.env.GIT_TOKEN;
    const client = new GitHubClient(token);

    // The entire GitHub operation is now a clean Result pipeline
    // Not try-catch, no exception handling, just composition
    return client
        .getIssue(target.owner, target.repo, target.number)
        .map((issue) => transformGitHubIssue(issue, target.owner, target.repo))
        .mapErr((error) => mapGitHubErrorToCliError(error, target));
};

