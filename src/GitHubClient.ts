import type { Issue } from "types"

class GitHubClient {
    private baseUrl = "https://api.github.com";
    private headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "neocortex-github/1.0.0",
    };

    async getIssue(owner: string, repo: string, number: number): Promise<Issue> {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${number}`;
        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}

export { GitHubClient };