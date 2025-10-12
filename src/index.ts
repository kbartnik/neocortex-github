export { GitHubClient } from "./github/client/GitHubClient";
export type { GitHubUrlAPI } from "./github/parsing/gitHubUrl";
export { gitHubUrl } from "./github/parsing/gitHubUrl";
export { isIssueTarget, isRepoTarget } from "./github/types/GitHubTarget";
export type {
  GitHubTarget,
  Issue,
  IssueTarget,
  RepoTarget,
} from "./types/index.js";
