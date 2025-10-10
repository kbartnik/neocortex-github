// src/ir/types.ts
export interface IRNode<T = unknown> {
  id: string; // UUID7
  type: string; // Node classification
  sourceId: string; // Human-readable reference
  title: string; // Display name
  data: T; // Type-specific content
  created_at: string; // Creation timestamp
}

export interface GitHubIssueData {
  number: number;
  body: string;
  state: "open" | "closed";
  labels: string[];
  assignees: string[];
}

export type GitHubIssueNode = IRNode<GitHubIssueData> & {
  type: "github-issue";
};
