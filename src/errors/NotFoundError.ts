/**
 * Error thrown when a GitHub resource is not found (404 response).
 *
 * Preserves essential context for ADHD developers:
 * - Original target that was attempted
 * - Full request details for debugging
 * - Timing information for context switching
 * - Raw GitHub API response for troubleshooting
 */
export class NotFoundError extends Error {
    constructor(
        public readonly target: { owner: string; repo: string; number?: number },
        public readonly requestUrl: string,
        public readonly timestamp: Date,
        public readonly statusCode: number,
        public readonly statusText: string,
        public readonly rawResponse: any,
        message: string
    ) {
        super(message);
        this.name = 'NotFoundError';
    }
}