import { ResultAsync, ok, err } from 'neverthrow';
import type { Issue } from "types";
import { HTTP_STATUS } from "../shared/HttpStatusCodes";
import type { GitHubClientError } from "../errors";

export class GitHubClient {
    constructor(private readonly token?: string) {}

    getIssue(owner: string, repo: string, issueNumber: number): ResultAsync<Issue, GitHubClientError> {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'neocortex-github/1.0.0'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Wrap the entire async operation in ResultAsync.fromPromise
        // This catches any thrown exceptions and converts them to Results
        return ResultAsync.fromPromise(
            // The promise we're wrapping
            (async () => {
                // First, attempt the fetch call
                // If this throws (network error), it gets caught by fromPromise
                const response = await fetch(url, { headers });

                // Check if the response is ok (status 200-299)
                if (!response.ok) {
                    // Map different HTTP error statuses to specific error variants
                    switch (response.status) {
                        case HTTP_STATUS.NOT_FOUND:
                            // Return a value that will be converted to err by our error mapper
                            throw {
                                type: 'not_found' as const,
                                owner,
                                repo,
                                issueNumber,
                                url
                            };

                        case HTTP_STATUS.UNAUTHORIZED:
                            throw {
                                type: 'unauthorized' as const,
                                message: 'Invalid or missing GitHub token'
                            };

                        case HTTP_STATUS.FORBIDDEN:
                            // Check if this is a rate limit error
                            const retryAfter = response.headers.get('retry-after');
                            throw {
                                type: 'rate_limited' as const,
                                retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
                                url
                            };

                        default:
                            // Any other non-ok status becomes a server_error
                            if (response.status >= 500) {
                                throw {
                                    type: 'server_error' as const,
                                    statusCode: response.status,
                                    statusText: response.statusText,
                                    url
                                };
                            }
                            // For other 4xx errors we don't recognize
                            throw {
                                type: 'forbidden' as const,
                                message: `HTTP ${response.status}: ${response.statusText}`,
                                url
                            };
                    }
                }

                // Try to parse the JSON response
                // If this throws, it gets caught by fromPromise
                const issue = await response.json();
                return issue;
            })(),

            // Error mapper function: converts thrown errors to GitHubClientError
            (error): GitHubClientError => {
                // If the error is one of our structured error objects (from the switch above)
                // it's already in the right format, just return it
                if (typeof error === 'object' && error !== null && 'type' in error) {
                    return error as GitHubClientError;
                }

                // Otherwise, it's an unexpected error (network failure, JSON parse error, etc.)
                const message = error instanceof Error ? error.message : String(error);
                return {
                    type: 'network_error',
                    message,
                    cause: error
                };
            }
        );
    }
}