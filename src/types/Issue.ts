/**
 * Represents a GitHub issue as returned by the GitHub API.
 *
 * Contains the essential properties of a GitHub issue including
 * identification, metadata, and content.
 *
 * @example
 * ```typescript
 * const issue: Issue = {
 *   id: 1234567890,
 *   number: 42,
 *   title: "Fix TypeScript compilation error",
 *   state: "open",
 *   body: "There is a compilation error in src/index.ts"
 * };
 * ```
 */
export type Issue = {
  /** Unique identifier for the issue (GitHub's internal ID) */
  id: number;
  /** Issue number within the repository (user-visible number) */
  number: number;
  /** The issue title */
  title: string;
  /** Current state of the issue */
  state: "open" | "closed";
  /** The issue body/description (can be null for issues without content) */
  body: string | null;
  /** ISO 8601 timestamp of when the issue was created */
  created_at: string;
  /** Array of labels attached to the issue */
  labels: Array<{ name: string }>;
  /** Array of users assigned to the issue */
  assignees: Array<{ login: string }>;
};
