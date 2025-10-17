export { GitHubClient } from "./domains/github/client";
export type { GitHubUrlAPI } from "./domains/github/parser";
export { gitHubUrl } from "./domains/github/parser";
export type {
  GitHubTarget,
  Issue,
  IssueTarget,
  RepoTarget,
} from "./domains/github/types";
export { isIssueTarget, isRepoTarget } from "./domains/github/types";
