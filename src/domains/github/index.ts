/**
 * GitHub domain public API.
 *
 * This module provides functionality for interacting with GitHub's API
 * and parsing GitHub URLs.
 */

// Client
export { GitHubClient } from "./client";
// Errors
export type { GitHubClientError } from "./errors";

// Parser/URL utilities
export type { GitHubUrlAPI, GitHubUrlParseError } from "./parser";
export { gitHubUrl, parsePositiveInteger, validateIssueState } from "./parser";
// Types
export type {
  GitHubTarget,
  Issue,
  IssueTarget,
  RepoTarget,
} from "./types";
export { isIssueTarget, isRepoTarget } from "./types";
