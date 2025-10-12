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
