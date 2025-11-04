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
// URL utilities
export type { GitHubUrlAPI, GitHubUrlParseError } from "./parser";
export { gitHubUrl } from "./parser";
// Issue types and parsing
export type { GitHubIssue, GitHubParseError } from "./types-issue";
export { parseGitHubIssue, validateIssueState } from "./types-issue";
// Target types
export type {
  GitHubTarget,
  IssueTarget,
  RepoTarget,
} from "./types-target";
export { isIssueTarget, isRepoTarget } from "./types-target";
