import type { GitHubUrlParseError} from "../gitHubUrl";

/**
 * Errors that can occur during CLI operations.
 * Discriminated union allows type-safe error handling.
 */

export type CliError =
    | { type: "invalid_url", url: string, reason: GitHubUrlParseError }
    | { type: "unsupported_resource", url: string, resourceType: string }
    | { type: "fetch_failed", target: string, cause: unknown}
    | { type: "not_found", target: string, url: string }
    | { type: "missing_argument", command: string, expected: string };

/**
 * Formats a GitHubUrlParseError into a human-readable message.
 * Extracts the specific validation failure and relevant context.
 */
const formatGitHubUrlParseError = (error: GitHubUrlParseError): string => {
    switch (error.type) {
        case 'invalid_protocol':
            return `HTTPS is required for GitHub URLs (got ${error.protocol})`;
        case 'invalid_hostname':
            return `Expected github.com but got ${error.hostname}`;
        case 'missing_path_segments':
            return `URL must include /owner/repo path`;
        case 'invalid_repo_name':
            return `Invalid repository name: "${error.repo}" (must be 1-100 chars using letters, digits, underscore, dot, or hyphen)`;
        case 'invalid_owner_name':
            return `Invalid owner name: "${error.owner}" (must be 1-39 alphanumeric chars, may contain hyphens, cannot start or end with hyphen)`;
        case 'invalid_issue_number':
            return `Invalid issue number: "${error.value}" (must be a positive integer)`;
        case 'invalid_url':
            return `Malformed URL: ${error.message}`;
    }
};

/**
 * Formats a CLI error for display to the user.
 * Provides context-rich messages for debugging.
 */
export const formatCliError = (error: CliError): string => {
    switch (error.type) {
        case 'invalid_url':
            return `Invalid GitHub URL: ${error.url}\n  Reason: ${error.reason}\n  Expected format: https://github.com/owner/repo/issues/NUMBER`;
        case 'unsupported_resource':
            return `Unsupported resource type: ${error.resourceType}\n  URL: ${error.url}\n  Currently only GitHub issues are supported`;
        case 'fetch_failed':
            return `Failed to fetch resource: ${error.target}\n  ${error.cause}`;
        case 'not_found':
            return `Resource not found: ${error.target}\n  URL: ${error.url}`;
        case 'missing_argument':
            return `Missing required argument for ${error.command}\n  Expected: ${error.expected}`;
    }
}