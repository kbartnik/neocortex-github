import type { IssueTarget } from "./IssueTarget";
import type { RepoTarget } from "./RepoTarget";

export type GitHubTarget = RepoTarget | IssueTarget;

export const isRepoTarget = (t: GitHubTarget): t is RepoTarget =>
  t.kind === "repo";
export const isIssueTarget = (t: GitHubTarget): t is IssueTarget =>
  t.kind === "issue";
