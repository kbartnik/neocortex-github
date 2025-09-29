import type { Issue } from "types";

/**
 * Client for interacting with the GitHub REST API.
 *
 * Provides methods to fetch GitHub resources like issues, with built-in error handling
 * and proper API headers. Uses GitHub API v3 with JSON format.
 *
 * @example
 * ```typescript
 * import { GitHubClient } from 'neocortex-github';
 *
 * const client = new GitHubClient();
 * const issue = await client.getIssue('octocat', 'hello-world', 42);
 * console.log(issue.title);
 * ```
 */
class GitHubClient {
  private baseUrl = "https://api.github.com";
  private headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "neocortex-github/1.0.0",
  };

  /**
   * Fetches a GitHub issue by repository and issue number.
   *
   * @param owner - The repository owner (username or organization)
   * @param repo - The repository name
   * @param number - The issue number (must be a positive integer)
   * @returns A Promise that resolves to the Issue object
   * @throws {Error} When the API request fails (network error, not found, rate limited, etc.)
   *
   * @example
   * ```typescript
   * const client = new GitHubClient();
   *
   * try {
   *   const issue = await client.getIssue('microsoft', 'typescript', 1234);
   *   console.log(`Issue: ${issue.title}`);
   *   console.log(`State: ${issue.state}`);
   * } catch (error) {
   *   console.error('Failed to fetch issue:', error.message);
   * }
   * ```
   */
  async getIssue(owner: string, repo: string, number: number): Promise<Issue> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${number}`;
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}

export { GitHubClient };
