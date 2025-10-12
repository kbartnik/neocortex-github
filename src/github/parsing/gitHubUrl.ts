import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import type { GitHubTarget, IssueTarget, RepoTarget } from "types";
import {
  isNonZeroDigitString,
  isValidOwnerName,
  isValidRepoName,
} from "../../shared/validation";

export type GitHubUrlParseError =
  | { type: "invalid_protocol"; protocol: string }
  | { type: "invalid_hostname"; hostname: string }
  | { type: "missing_path_segments"; url: string }
  | { type: "invalid_repo_name"; repo: string }
  | { type: "invalid_owner_name"; owner: string }
  | { type: "invalid_issue_number"; value: string }
  | { type: "invalid_url"; message: string };

type BuildersFor<T extends { kind: PropertyKey }> = {
  [K in T["kind"]]: (t: Extract<T, { kind: K }>) => string;
};

const builders: BuildersFor<GitHubTarget> = {
  repo: (t: RepoTarget): string => `/${t.owner}/${t.repo}`,
  issue: (t: IssueTarget): string => `/${t.owner}/${t.repo}/issues/${t.number}`,
} satisfies BuildersFor<GitHubTarget>;

const buildPath = (t: GitHubTarget): string => {
  switch (t.kind) {
    case "repo":
      return builders.repo(t);
    case "issue":
      return builders.issue(t);
  }
};

/**
 * Parses a GitHub URL string into a typed target object.
 *
 * @param url - The GitHub URL to parse (must be HTTPS and from github.com)
 * @returns A Result containing either the parsed GitHubTarget or a parsing error
 *
 * @example
 * ```typescript
 * // Parse repository URL
 * const result = parse("https://github.com/octocat/hello-world");
 * if (result.isOk()) {
 *   console.log(result.value); // { kind: "repo", owner: "octocat", repo: "hello-world" }
 * }
 *
 * // Parse issue URL
 * const result = parse("https://github.com/octocat/hello-world/issues/42");
 * if (result.isOk()) {
 *   console.log(result.value); // { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 }
 * }
 * ```
 */
export const parse = (
  url: string,
): Result<GitHubTarget, GitHubUrlParseError> => {
  // First, try to parse as a URL at all - catch invalid URL strings
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err({ type: "invalid_url", message });
  }

  // Check for valid protocol
  if (parsedUrl.protocol !== "https:") {
    return err({ type: "invalid_protocol", protocol: parsedUrl.protocol });
  }

  // Check for valid domain
  if (parsedUrl.hostname !== "github.com") {
    return err({ type: "invalid_hostname", hostname: parsedUrl.hostname });
  }

  // Split the pathname into segments and filter out empties
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    return err({ type: "missing_path_segments", url });
  }

  // e.g. ["octocat", "hello-world", "issues", "42"]
  const [ownerRaw, repoRaw, resource, id] = segments as [
    string,
    string,
    string?,
    string?,
  ];

  const repoName = repoRaw.endsWith(".git") ? repoRaw.slice(0, -4) : repoRaw;

  if (!isValidRepoName(repoName)) {
    return err({ type: "invalid_repo_name", repo: repoName });
  }

  const ownerName = ownerRaw.toLowerCase();
  if (!isValidOwnerName(ownerName)) {
    return err({ type: "invalid_owner_name", owner: ownerName });
  }

  if (resource === "issues") {
    if (!isNonZeroDigitString(id)) {
      return err({ type: "invalid_issue_number", value: id ?? "" });
    }
    return ok({
      kind: "issue",
      owner: ownerName,
      repo: repoName,
      number: Number(id),
    });
  }

  return ok({ kind: "repo", owner: ownerName, repo: repoName });
};

/**
 * Constructs a complete GitHub URL from a target object.
 *
 * @param target - The GitHub target object (repository or issue)
 * @param baseUrl - The base URL to use (defaults to "https://github.com")
 * @returns A complete URL object pointing to the GitHub resource
 *
 * @example
 * ```typescript
 * // Build repository URL
 * const repoUrl = build({ kind: "repo", owner: "octocat", repo: "hello-world" });
 * // Returns: URL object for "https://github.com/octocat/hello-world"
 *
 * // Build issue URL
 * const issueUrl = build({ kind: "issue", owner: "octocat", repo: "hello-world", number: 42 });
 * // Returns: URL object for "https://github.com/octocat/hello-world/issues/42"
 *
 * // Use custom base URL
 * const enterpriseUrl = build(target, "https://github.company.com");
 * ```
 */
const build = (
  target: GitHubTarget,
  baseUrl: string = "https://github.com",
): URL => {
  return new URL(buildPath(target), baseUrl);
};

/**
 * Type definition for the GitHub URL API.
 */
type GitHubUrlAPI = {
  /** Generates the path portion of a GitHub URL from a target object */
  buildPath: (target: GitHubTarget) => string;
  /** Parses a GitHub URL string into a typed target object */
  parse: (url: string) => Result<GitHubTarget, GitHubUrlParseError>;
  /** Constructs a complete GitHub URL from a target object */
  build: (target: GitHubTarget, baseUrl?: string) => URL;
};

/**
 * Main API object for working with GitHub URLs.
 *
 * Provides methods to parse GitHub URLs into typed objects, build URLs from target objects,
 * and generate URL paths. Supports both repository and issue URLs with comprehensive validation.
 *
 * @example
 * ```typescript
 * import { gitHubUrl } from 'neocortex-github';
 *
 * // Parse a URL (returns a Result)
 * const result = gitHubUrl.parse("https://github.com/octocat/hello-world/issues/42");
 * if (result.isOk()) {
 *   console.log(result.value); // { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 }
 * }
 *
 * // Build a URL
 * const url = gitHubUrl.build({ kind: "repo", owner: "octocat", repo: "hello-world" });
 * console.log(url.href); // "https://github.com/octocat/hello-world"
 *
 * // Get just the path
 * const path = gitHubUrl.buildPath({ kind: "issue", owner: "octocat", repo: "hello-world", number: 42 });
 * console.log(path); // "/octocat/hello-world/issues/42"
 * ```
 */
export const gitHubUrl: GitHubUrlAPI = {
  buildPath,
  parse,
  build,
};

export type { GitHubUrlAPI };
