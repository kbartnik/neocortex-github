export class GitHubClient {
  baseUrl = "https://api.github.com";
  token;
  constructor(token) {
    this.token = token;
  }
  async makeRequest(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
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
        const error = {
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
      };
    }
  }
  async getUser(username) {
    const response = await this.makeRequest(`/users/${username}`);
    return response.data;
  }
  async getUserRepositories(username, sort = "updated", order = "desc") {
    const response = await this.makeRequest(
      `/users/${username}/repos?sort=${sort}&direction=${order}`,
    );
    return response.data;
  }
  async getRepository(owner, repo) {
    const response = await this.makeRequest(`/repos/${owner}/${repo}`);
    return response.data;
  }
}
export function formatRepoUrl(repo) {
  return `${repo.html_url} (⭐ ${repo.stargazers_count})`;
}
export function calculateRepoAge(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
export function filterReposByLanguage(repos, language) {
  return repos.filter(
    (repo) => repo.language?.toLowerCase() === language.toLowerCase(),
  );
}
export * from "./types/index.js";
