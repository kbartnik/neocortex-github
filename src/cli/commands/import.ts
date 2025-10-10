import { Result, err, ok } from "neverthrow";
import { gitHubUrl } from "../../gitHubUrl";
import { GitHubClient } from "../../clients/GitHubClient";
import { transformGitHubIssue } from "../../ir/transforms";
import {
    NotFoundError,
    InternalError,
    type GitHubClientError,
} from "../../errors";
import type { CliError } from "../errors";
import type { GitHubIssueNode } from "../../ir/types";
import { match } from "ts-pattern";
import type { IssueTarget } from "types";
import type { TransformError } from "../../ir/errors";

const mapGitHubErrorToCliError = (
    error: GitHubClientError,
    target: IssueTarget,
): CliError =>
    match(error)
        .with({ type: "not_found" }, (e) => ({
            type: "not_found" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            url: e.url,
        }))
        .with({ type: "unauthorized" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .with({ type: "forbidden" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .with({ type: "rate_limited" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .with({ type: "server_error" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .with({ type: "network_error" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .with({ type: "invalid_response" }, (e) => ({
            type: "fetch_failed" as const,
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: e,
        }))
        .exhaustive();

// New mapper for transform errors
const mapTransformErrorToCliError = (
    error: TransformError,
    target: IssueTarget,
): CliError =>
    match(error)
        .with({ type: "invalid_issue_state" }, (e) => ({
            type: "invalid_data" as const,
            message: `Issue ${target.owner}/${target.repo}#${target.number} has invalid state: '${e.state}'. Expected 'open' or 'closed'.`,
            details: e,
        }))
        .exhaustive();

export const importCommand = async (
    args: string[],
): Promise<Result<GitHubIssueNode, CliError>> => {
    if (args.length === 0) {
        return err({
            type: "missing_argument",
            command: "import",
            expected: "<github-url>",
        });
    }

    const url = args[0];
    if (url === undefined) {
        throw new InternalError("args[0] is undefined despite args.length > 0", {
            argsLength: args.length,
            args,
        });
    }

    const parseResult = gitHubUrl.parse(url);
    if (parseResult.isErr()) {
        return err({
            type: "invalid_url",
            url,
            reason: parseResult.error,
        });
    }

    const target = parseResult.value;

    if (target.kind !== "issue") {
        return err({
            type: "unsupported_resource",
            url,
            resourceType: target.kind,
        });
    }

    const token = process.env.GIT_TOKEN;
    const client = new GitHubClient(token);

    // Changed .map to .andThen since transformGitHubIssue now returns a Result
    // This flattens the nested Results into a single Result
    return client
        .getIssue(target.owner, target.repo, target.number)
        .andThen((issue) => transformGitHubIssue(issue, target.owner, target.repo))
        .mapErr((error) => {
            // The error here could be either GitHubClientError or TransformError
            // We need to check which one it is and map accordingly
            if ("state" in error && error.type === "invalid_issue_state") {
                // It's a TransformError
                return mapTransformErrorToCliError(error as TransformError, target);
            } else {
                // It's a GitHubClientError
                return mapGitHubErrorToCliError(error as GitHubClientError, target);
            }
        });
};