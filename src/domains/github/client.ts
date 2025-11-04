import { Octokit } from "@octokit/rest";
import { ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import type { GitHubClientError } from "./errors";
import { OctokitErrorParsers } from "./errors";
import type { GitHubIssue } from "./types-issue";

/**
 * Client for interacting with the GitHub REST API.
 *
 * Handles authentication, error handling, and response parsing.
 * All methods return Results for type-safe error handling.
 *
 * @example
 * ```typescript
 * const client = new GitHubClient(process.env.GITHUB_TOKEN);
 * const result = await client.getIssue("microsoft", "typescript", 12345);
 *
 * if (result.isOk()) {
 *   console.log("Issue:", result.value.title);
 * } else {
 *   console.error("Error:", result.error.type);
 * }
 * ```
 */
export class GitHubClient {
  private readonly octokit: Octokit;
  /**
   * Creates a new GitHub API client.
   *
   * @param token - Optional GitHub personal access token for authentication.
   *                If not provided, requests will be made without authentication,
   *                which has lower rate limits.
   */
  constructor(readonly token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Fetches a single issue from a GitHub repository.
   *
   * Returns a Result containing either the issue data or a detailed error.
   * The error type provides information about what went wrong (not found,
   * unauthorized, rate limited, etc.).
   *
   * @param owner - The repository owner (username or organization)
   * @param repo - The repository name
   * @param issueNumber - The issue number to fetch
   * @returns A ResultAsync containing either the Issue or a GitHubClientError
   *
   * @example
   * ```typescript
   * const client = new GitHubClient(token);
   * const result = await client.getIssue("facebook", "react", 27769);
   *
   * result.match(
   *   (issue) => console.log(`${issue.title} is ${issue.state}`),
   *   (error) => console.error(`Failed: ${error.type}`)
   * );
   * ```
   */
  getIssue(
    owner: string,
    repo: string,
    issueNumber: number,
  ): ResultAsync<GitHubIssue, GitHubClientError> {
    const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

    return ResultAsync.fromPromise(
      this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      }),
      (error): GitHubClientError => {
        // Parse error shape with Zod
        const httpError = OctokitErrorParsers.asHttpError(error);

        // Not an HTTP error - treat as network failure
        if (!httpError.success) {
          return {
            type: "network_error",
            message: error instanceof Error ? error.message : String(error),
            cause: error,
          };
        }

        const { status, message } = httpError.data;
        const url = OctokitErrorParsers.extractUrl(error, fallbackUrl);

        // Use pattern matching on validated HTTP status codes
        return match(status)
          .with(404, () => ({
            type: "not_found" as const,
            owner,
            repo,
            issueNumber,
            url,
          }))
          .with(401, () => ({
            type: "unauthorized" as const,
            message: message ?? "Unauthorized",
            url,
          }))
          .with(403, () => {
            // Check for rate limit indicators
            if (OctokitErrorParsers.hasRateLimitHeaders(error)) {
              return {
                type: "rate_limited" as const,
                retryAfter: OctokitErrorParsers.extractRetryAfter(error),
                url,
              };
            }

            // Otherwise it's a forbidden error
            return {
              type: "forbidden" as const,
              message: message ?? "Forbidden",
              url,
            };
          })
          .when(
            (s) => s >= 500 && s < 600,
            (s) => ({
              type: "server_error" as const,
              statusCode: s,
              statusText: message ?? "Internal Server Error",
              url,
            }),
          )
          .otherwise(() => ({
            type: "network_error" as const,
            message: message ?? String(error),
            cause: error,
          }));
      },
    ).map((response) => response.data as GitHubIssue);
  }
}
