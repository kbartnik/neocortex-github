// src/ir/types.ts

/**
 * Base interface for all nodes in the intermediate representation (IR).
 *
 * The IR provides a normalized, stable structure for external data
 * (like GitHub issues) that decouples the internal data model from
 * external API schemas. This allows the API schema to change without
 * breaking internal code.
 *
 * @template T - The type-specific data payload for this node
 */
export type IRNode<T = unknown> = {
  /** Unique identifier (UUID v7) for this node */
  id: string;
  /** Node classification (e.g., "github-issue") used for type discrimination */
  type: string;
  /** Human-readable reference to the source (e.g., "github:owner/repo#123") */
  sourceId: string;
  /** Display name or title for the node */
  title: string;
  /** Type-specific content and metadata */
  data: T;
  /** ISO 8601 timestamp of when the original resource was created */
  created_at: string;
};

/**
 * Data payload for a GitHub issue node.
 *
 * Contains normalized GitHub issue data extracted from the API response.
 */
export type GitHubIssueData = {
  /** Issue number within the repository */
  number: number;
  /** Issue body/description content */
  body: string;
  /** Current state of the issue */
  state: "open" | "closed";
  /** Array of label names attached to the issue */
  labels: string[];
  /** Array of assignee usernames */
  assignees: string[];
};

/**
 * IR node representing a GitHub issue.
 *
 * Combines the base IRNode structure with GitHub-specific issue data.
 *
 * @example
 * ```typescript
 * const node: GitHubIssueNode = {
 *   id: "01932e6f-5c6f-7890-abcd-1234567890ab",
 *   type: "github-issue",
 *   sourceId: "github:microsoft/typescript#12345",
 *   title: "Add support for decorators",
 *   created_at: "2023-01-15T10:30:00Z",
 *   data: {
 *     number: 12345,
 *     body: "We should add support for...",
 *     state: "open",
 *     labels: ["enhancement", "help wanted"],
 *     assignees: ["username1", "username2"]
 *   }
 * };
 * ```
 */
export type GitHubIssueNode = IRNode<GitHubIssueData> & {
  type: "github-issue";
};
