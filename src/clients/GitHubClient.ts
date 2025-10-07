import type {Issue} from "types";
import {HTTP_STATUS} from "../shared/HttpStatusCodes";
import {NotFoundError} from "../errors";

export class GitHubClient {
    constructor(private readonly token?: string) {}

    async getIssue(owner: string, repo: string, issueNumber: number): Promise<Issue> {
        const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'neocortex-github/1.0.0'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === HTTP_STATUS.NOT_FOUND) {
                // Capture the raw response body for debugging context
                const rawResponse = await response.text();

                throw new NotFoundError(
                    { owner, repo, number: issueNumber },
                    url,
                    {
                        timestamp: new Date(),
                        statusCode: response.status,
                        statusText: response.statusText,
                        rawResponse
                    }
                );
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return response.json();
    }}