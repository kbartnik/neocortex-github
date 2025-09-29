import type { IssueTarget } from "./IssueTarget";
import type { RepoTarget } from "./RepoTarget";
import {isValidOwnerName, isValidRepoName} from "../shared/validation";

type GitHubTarget = RepoTarget | IssueTarget;

const isRepoTarget = (t: unknown): t is RepoTarget => {
    if (typeof t !== "object" || t === null) {
        return false;
    }

    const obj = t as any;

    return obj.kind === "repo"
        && typeof obj.owner === "string" && isValidOwnerName(obj.owner)
        && typeof obj.repo === "string" && isValidRepoName(obj.repo);
}
const isIssueTarget = (t: unknown): t is IssueTarget => {
  if (typeof t !== "object" || t === null) {
      return false;
  }

    const obj = t as any;

    return obj.kind === "issue"
        && typeof obj.owner === "string" && isValidOwnerName(obj.owner)
        && typeof obj.repo === "string" && isValidRepoName(obj.repo)
        && typeof obj.number === "number" && Number.isInteger(obj.number) && obj.number > 0;
}

export type {GitHubTarget};
export {isRepoTarget, isIssueTarget};