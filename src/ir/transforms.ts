import type { Result } from "neverthrow";
import { uuidv7 } from "uuidv7";
import { validateIssueState } from "../github/parsing/validation";
import type { Issue } from "../github/types/Issue";
import type { TransformError } from "./errors";
import type { GitHubIssueNode } from "./types";

/**
 * Transforms a GitHub API issue response into an internal IR node.
 *
 * This function serves as the boundary between external GitHub API data
 * and internal data structures. It validates the data, normalizes the
 * structure, and generates a unique identifier for tracking.
 *
 * Returns a Result to handle validation failures (like invalid issue states)
 * without throwing exceptions.
 *
 * @param githubApiResponse - Raw issue data from the GitHub API
 * @param owner - Repository owner (needed for sourceId)
 * @param repo - Repository name (needed for sourceId)
 * @returns A Result containing either the transformed IR node or a validation error
 *
 * @example
 * ```typescript
 * const apiResponse: Issue = {
 *   id: 123456,
 *   number: 42,
 *   title: "Bug in parser",
 *   state: "open",
 *   body: "There's an issue with...",
 *   created_at: "2023-01-15T10:30:00Z",
 *   labels: [{ name: "bug" }],
 *   assignees: [{ login: "developer" }]
 * };
 *
 * const result = transformGitHubIssue(apiResponse, "owner", "repo");
 * if (result.isOk()) {
 *   console.log("Transformed:", result.value.sourceId);
 *   // "github:owner/repo#42"
 * }
 * ```
 */
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
