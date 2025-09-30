import { uuidv7 } from 'uuidv7';
import type { IRNode, GitHubIssueData, GitHubIssueNode } from './types';
import type {Issue} from "types";

export function transformGitHubIssue(
    githubApiResponse: {
        id: number;
        number: number;
        title: string;
        body: string;
        state: "open" | "closed";
        created_at: string;
        labels: ({ name: string })[];
        assignees: ({ login: string })[]
    }, // GitHub API response object
    owner: string,
    repo: string
): GitHubIssueNode {
    return {
        id: uuidv7(),
        type: "github-issue",
        sourceId: `github:${owner}/${repo}#${githubApiResponse.number}`,
        title: githubApiResponse.title,
        created_at: githubApiResponse.created_at,
        data: {
            number: githubApiResponse.number,
            body: githubApiResponse.body ?? "",
            state: githubApiResponse.state,
            labels: githubApiResponse.labels.map((label: any) => label.name),
            assignees: githubApiResponse.assignees.map((assignee: any) => assignee.login)
        }
    };
}