import type {
  GitHubApiError,
  GitHubApiResponse,
  GitHubRepository,
  GitHubUser,
  RepositorySort,
  SortOrder,
} from "./types/index.js";

export class GitHubClient {
  private baseUrl = "https://api.github.com";
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
  ): Promise<GitHubApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "neocortex-github/1.0.0",
    };

    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        const error: GitHubApiError = {
          message: data.message || "Unknown error",
          status: response.status,
          code: data.documentation_url ? "API_ERROR" : undefined,
        };
        throw error;
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : "Network error",
        status: 0,
      } as GitHubApiError;
    }
  }

  async getUser(username: string): Promise<GitHubUser> {
    const response = await this.makeRequest<GitHubUser>(`/users/${username}`);
    return response.data;
  }

  async getUserRepositories(
    username: string,
    sort: RepositorySort = "updated",
    order: SortOrder = "desc",
  ): Promise<GitHubRepository[]> {
    const response = await this.makeRequest<GitHubRepository[]>(
      `/users/${username}/repos?sort=${sort}&direction=${order}`,
    );
    return response.data;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.makeRequest<GitHubRepository>(
      `/repos/${owner}/${repo}`,
    );
    return response.data;
  }
}

export function formatRepoUrl(repo: GitHubRepository): string {
  return `${repo.html_url} (⭐ ${repo.stargazers_count})`;
}

export function calculateRepoAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function filterReposByLanguage(
  repos: GitHubRepository[],
  language: string,
): GitHubRepository[] {
  return repos.filter(
    (repo) => repo.language?.toLowerCase() === language.toLowerCase(),
  );
}

export * from "./types/index.js";
