import { z } from "zod";

/**
 * Zod schemas for validating Octokit error structures.
 * These allow declarative validation instead of manual type guards.
 */

/** Schema for extracting request URL from Octokit errors */
// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const OctokitRequestSchema = z.object({
  url: z.string(),
});

/** Schema for Octokit HTTP errors with status codes */
// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const OctokitHttpErrorSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  request: OctokitRequestSchema.optional(),
});

/** Schema for rate limit headers in Octokit responses */
// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const RateLimitHeadersSchema = z.object({
  "x-ratelimit-remaining": z.string().optional(),
  "retry-after": z.string().optional(),
});

/** Schema for Octokit errors with response headers (used for rate limiting) */
// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const OctokitHttpErrorWithHeadersSchema = OctokitHttpErrorSchema.extend({
  response: z
    .object({
      headers: RateLimitHeadersSchema,
    })
    .optional(),
});

/** Type-safe parsers for Octokit error shapes */
export const OctokitErrorParsers = {
  /** Parse as HTTP error with status code */
  asHttpError: (error: unknown) => OctokitHttpErrorSchema.safeParse(error),

  /** Parse as HTTP error with headers (for rate limit detection) */
  asHttpErrorWithHeaders: (error: unknown) =>
    OctokitHttpErrorWithHeadersSchema.safeParse(error),

  /** Extract URL from error request, with fallback */
  extractUrl: (error: unknown, fallback: string): string => {
    const result = z.object({ request: OctokitRequestSchema }).safeParse(error);
    return result.success ? result.data.request.url : fallback;
  },

  /** Extract retry-after seconds from rate limit headers */
  extractRetryAfter: (error: unknown): number | undefined => {
    const result = z
      .object({ response: z.object({ headers: RateLimitHeadersSchema }) })
      .safeParse(error);

    if (!result.success) return undefined;

    const headers = result.data.response.headers;

    // Try retry-after header first
    if (headers["retry-after"]) {
      const retryAfter = Number.parseInt(headers["retry-after"], 10);
      if (!Number.isNaN(retryAfter)) return retryAfter;
    }

    // If x-ratelimit-remaining is 0, we're rate limited (but no retry time given)
    if (headers["x-ratelimit-remaining"] === "0") {
      return undefined;
    }

    return undefined;
  },

  /** Check if error has rate limit indicators */
  hasRateLimitHeaders: (error: unknown): boolean => {
    const result = z
      .object({ response: z.object({ headers: RateLimitHeadersSchema }) })
      .safeParse(error);

    if (!result.success) return false;

    const headers = result.data.response.headers;
    return !!(
      headers["retry-after"] || headers["x-ratelimit-remaining"] === "0"
    );
  },
} as const;

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
