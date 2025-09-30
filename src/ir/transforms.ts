import { uuidv7 } from 'uuidv7';
import type { IRNode, GitHubIssueData, GitHubIssueNode } from './types';
import type {Issue} from "types";
import { validateIssueState} from "../shared/gitHubValidation";

export function transformGitHubIssue(
    githubApiResponse: Issue,
    owner: string,
    repo: string
): GitHubIssueNode {
    const validatedState = validateIssueState(githubApiResponse.state, {
        owner,
        repo,
        number: githubApiResponse.number
    });

    return {
        id: uuidv7(),
        type: "github-issue",
        sourceId: `github:${owner}/${repo}#${githubApiResponse.number}`,
        title: githubApiResponse.title,
        created_at: githubApiResponse.created_at,
        data: {
            number: githubApiResponse.number,
            body: githubApiResponse.body ?? "",
            state: validatedState,
            labels: githubApiResponse.labels.map(label => label.name),
            assignees: githubApiResponse.assignees.map(assignee => assignee.login)
        }
    };
}