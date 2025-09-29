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
