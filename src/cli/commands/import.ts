import type { Result } from "neverthrow";
import { err } from "neverthrow";
import { match } from "ts-pattern";
import type { IssueTarget } from "types";
import { GitHubClient } from "../../github/client/GitHubClient";
import type { GitHubClientError } from "../../errors";
import { InternalError } from "../../errors";
import { gitHubUrl } from "../../github/parsing/gitHubUrl";
import type { TransformError } from "../../ir/errors";
import { transformGitHubIssue } from "../../ir/transforms";
import type { GitHubIssueNode } from "../../ir/types";
import type { CliError } from "../errors";

/**
 * Maps GitHub API errors to CLI-specific error types.
 *
 * Converts detailed GitHub client errors into user-facing CLI errors
 * with appropriate context for command-line display.
 *
 * @param error - The GitHub API error to map
 * @param target - The issue target that was being accessed
 * @returns A CLI-specific error with user-friendly information
 */
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

/**
 * Maps IR transformation errors to CLI-specific error types.
 *
 * Converts data validation errors that occur during IR transformation
 * into user-facing CLI errors with appropriate context.
 *
 * @param error - The transformation error to map
 * @param target - The issue target that was being transformed
 * @returns A CLI-specific error with user-friendly information
 */
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

/**
 * Imports a GitHub issue from a URL and transforms it into an IR node.
 *
 * This command:
 * 1. Validates and parses the GitHub URL
 * 2. Fetches the issue data from the GitHub API
 * 3. Transforms the API response into an internal IR node
 * 4. Returns a Result for type-safe error handling
 *
 * The GitHub token is read from the GIT_TOKEN environment variable.
 * If not set, API requests will be unauthenticated with lower rate limits.
 *
 * @param args - Command-line arguments (expects a GitHub URL as first argument)
 * @returns A Result containing either the imported IR node or a CLI error
 *
 * @example
 * ```typescript
 * const result = await importCommand(["https://github.com/microsoft/typescript/issues/12345"]);
 * if (result.isOk()) {
 *   console.log("Imported issue:", result.value.title);
 * } else {
 *   console.error("Import failed:", result.error.type);
 * }
 * ```
 */
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
