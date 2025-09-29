import type { GitHubTarget, IssueTarget, RepoTarget } from "types";
import {
  isNonZeroDigitString,
  isValidOwnerName,
  isValidRepoName,
} from "./shared/validation";

type BuildersFor<T extends { kind: PropertyKey }> = {
  [K in T["kind"]]: (t: Extract<T, { kind: K }>) => string;
};

const builders: BuildersFor<GitHubTarget> = {
  repo: (t: RepoTarget): string => `/${t.owner}/${t.repo}`,
  issue: (t: IssueTarget): string => `/${t.owner}/${t.repo}/issues/${t.number}`,
} satisfies BuildersFor<GitHubTarget>;

/**
 * Generates the path portion of a GitHub URL from a target object.
 *
 * @param t - The GitHub target object (repository or issue)
 * @returns The URL path string (e.g., "/octocat/hello-world" or "/octocat/hello-world/issues/42")
 *
 * @example
 * ```typescript
 * const repoPath = buildPath({ kind: "repo", owner: "octocat", repo: "hello-world" });
 * // Returns: "/octocat/hello-world"
 *
 * const issuePath = buildPath({ kind: "issue", owner: "octocat", repo: "hello-world", number: 42 });
 * // Returns: "/octocat/hello-world/issues/42"
 * ```
 */
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
 * @returns A `GitHubTarget` object representing either a repository or issue
 * @throws {Error} When the URL is invalid, uses non-HTTPS protocol, wrong domain, or has invalid owner/repo names
 *
 * @example
 * ```typescript
 * // Parse repository URL
 * const repoTarget = parse("https://github.com/octocat/hello-world");
 * // Returns: { kind: "repo", owner: "octocat", repo: "hello-world" }
 *
 * // Parse issue URL
 * const issueTarget = parse("https://github.com/octocat/hello-world/issues/42");
 * // Returns: { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 }
 *
 * // Handles .git suffix
 * const gitTarget = parse("https://github.com/octocat/hello-world.git");
 * // Returns: { kind: "repo", owner: "octocat", repo: "hello-world" }
 * ```
 */
const parse = (url: string): GitHubTarget => {
  const parsedUrl = new URL(url);

  // Check for valid protocols first
  if (parsedUrl.protocol !== "https:") {
    throw new Error("HTTPS is required for GitHub URLs");
  }

  // Check for valid domain
  if (parsedUrl.hostname !== "github.com") {
    throw new Error(
      `Unsupported host: expected github.com, got ${parsedUrl.hostname}`,
    );
  }

  // split the pathname into segments and filter out empties
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("GitHub URL must include /owner/repo");
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
    throw new Error(
      "Invalid repo: 1–100 chars using letters, digits, underscore, dot, or hyphen",
    );
  }

  const ownerName = ownerRaw.toLowerCase();
  if (!isValidOwnerName(ownerName)) {
    throw new Error(
      "Invalid owner: must be 1–39 chars, alphanumeric, may contain hyphens, and cannot start or end with a hyphen",
    );
  }

  if (resource === "issues") {
    if (!isNonZeroDigitString(id)) {
      throw new Error("Issue number must be a positive integer");
    }
    return {
      kind: "issue",
      owner: ownerName,
      repo: repoName,
      number: Number(id),
    };
  }

  return { kind: "repo", owner: ownerName, repo: repoName };
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
  parse: (url: string) => GitHubTarget;
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
 * // Parse a URL
 * const target = gitHubUrl.parse("https://github.com/octocat/hello-world/issues/42");
 * console.log(target); // { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 }
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
