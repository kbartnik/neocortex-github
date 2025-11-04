import { isValidOwnerName, isValidRepoName } from "@core/validation";

/**
 * Represents a GitHub repository target.
 *
 * Used to identify and construct URLs for GitHub repositories.
 * The owner and repo names must follow GitHub's naming conventions.
 *
 * @example
 * ```typescript
 * const target: RepoTarget = {
 *   kind: "repo",
 *   owner: "microsoft",
 *   repo: "typescript"
 * };
 * ```
 */
export type RepoTarget = {
  /** Discriminator field to identify this as a repository target */
  kind: "repo";
  /** The repository owner (username or organization name) */
  owner: string;
  /** The repository name */
  repo: string;
};

/**
 * Represents a GitHub issue target.
 *
 * Used to identify and construct URLs for GitHub issues.
 * The owner and repo names must follow GitHub's naming conventions,
 * and the issue number must be a positive integer.
 *
 * @example
 * ```typescript
 * const target: IssueTarget = {
 *   kind: "issue",
 *   owner: "microsoft",
 *   repo: "typescript",
 *   number: 12345
 * };
 * ```
 */
export type IssueTarget = {
  /** Discriminator field to identify this as an issue target */
  kind: "issue";
  /** The repository owner (username or organization name) */
  owner: string;
  /** The repository name */
  repo: string;
  /** The issue number (positive integer) */
  number: number;
};

/**
 * Union type representing any valid GitHub target.
 *
 * A GitHub target can be either a repository or an issue.
 * Use the `kind` discriminator field and type guards to determine the specific type.
 *
 * @example
 * ```typescript
 * function handleTarget(target: GitHubTarget) {
 *   if (target.kind === "repo") {
 *     console.log(`Repository: ${target.owner}/${target.repo}`);
 *   } else {
 *     console.log(`Issue #${target.number} in ${target.owner}/${target.repo}`);
 *   }
 * }
 * ```
 */
export type GitHubTarget = RepoTarget | IssueTarget;

/**
 * Type guard to check if an unknown value is a valid RepoTarget.
 *
 * Performs comprehensive validation including GitHub naming conventions
 * for owner and repository names.
 *
 * @param t - The value to check
 * @returns True if the value is a valid RepoTarget
 *
 * @example
 * ```typescript
 * const data: unknown = { kind: "repo", owner: "octocat", repo: "hello-world" };
 * if (isRepoTarget(data)) {
 *   // TypeScript now knows data is RepoTarget
 *   console.log(`Repo: ${data.owner}/${data.repo}`);
 * }
 * ```
 */
export const isRepoTarget = (t: unknown): t is RepoTarget => {
  if (typeof t !== "object" || t === null) {
    return false;
  }

  const obj = t as Record<string, unknown>;

  return (
    obj.kind === "repo" &&
    typeof obj.owner === "string" &&
    isValidOwnerName(obj.owner) &&
    typeof obj.repo === "string" &&
    isValidRepoName(obj.repo)
  );
};

/**
 * Type guard to check if an unknown value is a valid IssueTarget.
 *
 * Performs comprehensive validation including GitHub naming conventions
 * for owner and repository names, and validates that the issue number is a positive integer.
 *
 * @param t - The value to check
 * @returns True if the value is a valid IssueTarget
 *
 * @example
 * ```typescript
 * const data: unknown = { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 };
 * if (isIssueTarget(data)) {
 *   // TypeScript now knows data is IssueTarget
 *   console.log(`Issue #${data.number} in ${data.owner}/${data.repo}`);
 * }
 * ```
 */
export const isIssueTarget = (t: unknown): t is IssueTarget => {
  if (typeof t !== "object" || t === null) {
    return false;
  }

  const obj = t as Record<string, unknown>;

  return (
    obj.kind === "issue" &&
    typeof obj.owner === "string" &&
    isValidOwnerName(obj.owner) &&
    typeof obj.repo === "string" &&
    isValidRepoName(obj.repo) &&
    typeof obj.number === "number" &&
    Number.isInteger(obj.number) &&
    obj.number > 0
  );
};
