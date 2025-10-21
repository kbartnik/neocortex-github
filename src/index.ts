export { GitHubClient } from "./domains/github/client";
export type { GitHubUrlAPI } from "./domains/github/parser";
export { gitHubUrl } from "./domains/github/parser";
export type { GitHubIssue } from "./domains/github/types-issue";
export type {
  GitHubIssue,
  GitHubTarget,
  IssueTarget,
  RepoTarget,
} from "./domains/github/types-target";
export { isIssueTarget, isRepoTarget } from "./domains/github/types-target";
