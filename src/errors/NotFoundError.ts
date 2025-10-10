/**
 * Error thrown when a GitHub resource is not found (404 response).
 *
 * Preserves essential context for ADHD developers:
 * - Original target that was attempted
 * - Full request details for debugging
 * - Timing information for context switching
 * - Raw GitHub API response for troubleshooting
 */

/**
 * Optional debugging context for NotFoundError.
 * All fields are optional to allow gradual enrichment of error context.
 */
export type NotFoundErrorOptions = {
  /** When the request was made - useful for correlating with logs */
  timestamp?: Date;
  /** HTTP status code (typically 404, but included for completeness) */
  statusCode?: number;
  /** HTTP status text from the response */
  statusText?: string;
  /** Raw response body from GitHub API for debugging */
  rawResponse?: string;
  /** Additional arbitrary debugging data specific to this error instance */
  data?: Record<string, unknown>;
};

export class NotFoundError extends Error {
  public readonly timestamp: Date;
  public readonly statusCode: number | undefined;
  public readonly statusText: string | undefined;
  public readonly rawResponse: string | undefined;
  public readonly data: Record<string, unknown>;

  constructor(
    public readonly target: { owner: string; repo: string; number?: number },
    public readonly requestUrl: string,
    options: NotFoundErrorOptions = {},
  ) {
    const resourceId =
      target.number !== undefined
        ? `${target.owner}/${target.repo}#${target.number}`
        : `${target.owner}/${target.repo}`;

    super(`GitHub resource not found: ${resourceId}`);

    this.name = "NotFoundError";
    this.timestamp = options.timestamp ?? new Date();
    this.statusCode = options.statusCode;
    this.statusText = options.statusText;
    this.rawResponse = options.rawResponse;
    this.data = options.data ?? {};
  }
}
