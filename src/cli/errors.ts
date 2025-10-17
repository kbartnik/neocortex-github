import type { GitHubUrlParseError } from "@domains/github/parser";

/**
 * Errors that can occur during CLI operations.
 * Discriminated union allows type-safe error handling.
 */

export type CliError =
  | { type: "invalid_url"; url: string; reason: GitHubUrlParseError }
  | { type: "unsupported_resource"; url: string; resourceType: string }
  | { type: "fetch_failed"; target: string; cause: unknown }
  | { type: "not_found"; target: string; url: string }
  | { type: "missing_argument"; command: string; expected: string }
  | { type: "invalid_data"; message: string; details: unknown };

/**
 * Formats a CLI error for display to the user.
 * Provides context-rich messages for debugging.
 */
export const formatCliError = (error: CliError): string => {
  switch (error.type) {
    case "invalid_url":
      return `Invalid GitHub URL: ${error.url}\n  Reason: ${error.reason}\n  Expected format: https://github.com/owner/repo/issues/NUMBER`;
    case "unsupported_resource":
      return `Unsupported resource type: ${error.resourceType}\n  URL: ${error.url}\n  Currently only GitHub issues are supported`;
    case "fetch_failed":
      return `Failed to fetch resource: ${error.target}\n  ${error.cause}`;
    case "not_found":
      return `Resource not found: ${error.target}\n  URL: ${error.url}`;
    case "missing_argument":
      return `Missing required argument for ${error.command}\n  Expected: ${error.expected}`;
    case "invalid_data":
      return `Invalid data received: ${error.message}`;
  }
};
