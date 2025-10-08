import { Result, err, ok } from "neverthrow";
import {gitHubUrl} from "../../gitHubUrl";
import { GitHubClient } from "../../clients/GitHubClient"
import { transformGitHubIssue} from "../../ir/transforms";
import { NotFoundError, InternalError } from "../../errors";
import type { CliError } from "../errors";
import type { GitHubIssueNode } from "../../ir/types";

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
    try {
        // Create client with optional token from environment
        const token = process.env.GITHUB_TOKEN;
        const client = new GitHubClient(token);

        // Fetch the issue from GitHub API
        const issue = await client.getIssue(target.owner, target.repo, target.number);

        // Transform the API response to an IR Node
        const node = transformGitHubIssue(issue, target.owner, target.repo);

        return ok(node);

    } catch (error) {
        // Handle known error types with specific error messages
        if (error instanceof NotFoundError) {
            return err({
                type: "not_found",
                target: `${target.owner}/${target.repo}#${target.number}`,
                url: error.requestUrl
            });
        }

        // Unknown error - capture what we can for debugging
        return err({
            type: "fetch_failed",
            target: `${target.owner}/${target.repo}#${target.number}`,
            cause: error
        });
    }
};

