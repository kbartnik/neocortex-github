import { uuidv7 } from "uuidv7";
import type { IRNode, GitHubIssueData, GitHubIssueNode } from "./types";
import type { Issue } from "types";
import { validateIssueState } from "../shared/gitHubValidation";
import type { TransformError } from "./errors";
import { Result } from "neverthrow";

export function transformGitHubIssue(
  githubApiResponse: Issue,
  owner: string,
  repo: string,
): Result<GitHubIssueNode, TransformError> {
  // Validate the issue state - this returns a Result
  const stateResult = validateIssueState(githubApiResponse.state, {
    owner,
    repo,
    number: githubApiResponse.number,
  });

  // Use .map() to transform the validated state into a complete GitHubIssueNode
  // If stateResult is Err, the entire chain short-circuits and returns that Err
  // If stateResult is Ok, we extract the state value and build the node
  return stateResult.map((validatedState) => ({
    id: uuidv7(),
    type: "github-issue" as const,
    sourceId: `github:${owner}/${repo}#${githubApiResponse.number}`,
    title: githubApiResponse.title,
    created_at: githubApiResponse.created_at,
    data: {
      number: githubApiResponse.number,
      body: githubApiResponse.body ?? "",
      state: validatedState, // Now this is a plain string, not a Result
      labels: githubApiResponse.labels.map((label) => label.name),
      assignees: githubApiResponse.assignees.map((assignee) => assignee.login),
    },
  }));
}
