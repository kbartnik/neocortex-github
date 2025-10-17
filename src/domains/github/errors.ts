/**
 * Discriminated union of errors that can occur during GitHub API operations.
 *
 * Each variant represents a specific failure mode with relevant context for debugging.
 * Use the `type` field to distinguish between error variants and handle them appropriately.
 *
 * @example
 * ```typescript
 * const result = await client.getIssue("owner", "repo", 123);
 * if (result.isErr()) {
 *   const error = result.error;
 *   switch (error.type) {
 *     case "not_found":
 *       console.log(`Issue ${error.issueNumber} not found in ${error.owner}/${error.repo}`);
 *       break;
 *     case "unauthorized":
 *       console.log("Invalid GitHub token");
 *       break;
 *     case "rate_limited":
 *       console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
 *       break;
 *     // ... handle other cases
 *   }
 * }
 * ```
 */
export type GitHubClientError =
  | {
      /** The requested resource was not found (HTTP 404) */
      type: "not_found";
      /** Repository owner name */
      owner: string;
      /** Repository name */
      repo: string;
      /** Issue number that was requested */
      issueNumber: number;
      /** Full API URL that was requested */
      url: string;
    }
  | {
      /** Authentication failed (HTTP 401) */
      type: "unauthorized";
      /** Human-readable error message */
      message: string;
      /** Full API URL that was requested */
      url: string;
    }
  | {
      /** Access forbidden or other 4xx error (HTTP 403) */
      type: "forbidden";
      /** Human-readable error message */
      message: string;
      /** Full API URL that was requested */
      url: string;
    }
  | {
      /** Rate limit exceeded (HTTP 403 with rate limit headers) */
      type: "rate_limited";
      /** Seconds to wait before retrying (from Retry-After header) */
      retryAfter?: number;
      /** Full API URL that was requested */
      url: string;
    }
  | {
      /** Server error (HTTP 5xx) */
      type: "server_error";
      /** HTTP status code received */
      statusCode: number;
      /** HTTP status text */
      statusText: string;
      /** Full API URL that was requested */
      url: string;
    }
  | {
      /** Network-level failure (connection failed, timeout, etc.) */
      type: "network_error";
      /** Error message describing the failure */
      message: string;
      /** Original error object that caused the failure */
      cause: unknown;
    }
  | {
      /** Response received but couldn't be parsed or validated */
      type: "invalid_response";
      /** Error message describing the parsing failure */
      message: string;
      /** Full API URL that was requested */
      url: string;
    };
