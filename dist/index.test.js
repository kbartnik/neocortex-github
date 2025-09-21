import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateRepoAge,
  filterReposByLanguage,
  formatRepoUrl,
  GitHubClient,
} from "./index.js";
// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;
describe("GitHubClient", () => {
  let client;
  beforeEach(() => {
    client = new GitHubClient();
    mockFetch.mockReset();
  });
  describe("constructor", () => {
    it("should create client without token", () => {
      const client = new GitHubClient();
      expect(client).toBeInstanceOf(GitHubClient);
    });
    it("should create client with token", () => {
      const client = new GitHubClient("test-token");
      expect(client).toBeInstanceOf(GitHubClient);
    });
  });
  describe("getUser", () => {
    it("should fetch user data successfully", async () => {
      const mockUser = {
        id: 1,
        login: "testuser",
        name: "Test User",
        avatar_url: "https://example.com/avatar.jpg",
        html_url: "https://github.com/testuser",
        public_repos: 10,
        followers: 5,
        following: 3,
        created_at: "2020-01-01T00:00:00Z",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser),
      });
      const result = await client.getUser("testuser");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser",
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "neocortex-github/1.0.0",
          }),
        }),
      );
      expect(result).toEqual(mockUser);
    });
    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: "Not Found" }),
      });
      await expect(client.getUser("nonexistent")).rejects.toEqual({
        message: "Not Found",
        status: 404,
        code: undefined,
      });
    });
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(client.getUser("testuser")).rejects.toEqual({
        message: "Network error",
        status: 0,
      });
    });
  });
  describe("getUserRepositories", () => {
    it("should fetch user repositories with default parameters", async () => {
      const mockRepos = [
        {
          id: 1,
          name: "test-repo",
          full_name: "testuser/test-repo",
          html_url: "https://github.com/testuser/test-repo",
          clone_url: "https://github.com/testuser/test-repo.git",
          ssh_url: "git@github.com:testuser/test-repo.git",
          stargazers_count: 5,
          forks_count: 2,
          language: "TypeScript",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-06-01T00:00:00Z",
          private: false,
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRepos),
      });
      const result = await client.getUserRepositories("testuser");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser/repos?sort=updated&direction=desc",
        expect.any(Object),
      );
      expect(result).toEqual(mockRepos);
    });
    it("should fetch repositories with custom sort parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
      await client.getUserRepositories("testuser", "created", "asc");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser/repos?sort=created&direction=asc",
        expect.any(Object),
      );
    });
  });
  describe("getRepository", () => {
    it("should fetch repository data", async () => {
      const mockRepo = {
        id: 1,
        name: "test-repo",
        full_name: "testuser/test-repo",
        description: "A test repository",
        html_url: "https://github.com/testuser/test-repo",
        clone_url: "https://github.com/testuser/test-repo.git",
        ssh_url: "git@github.com:testuser/test-repo.git",
        stargazers_count: 10,
        forks_count: 3,
        language: "JavaScript",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
        private: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRepo),
      });
      const result = await client.getRepository("testuser", "test-repo");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/testuser/test-repo",
        expect.any(Object),
      );
      expect(result).toEqual(mockRepo);
    });
  });
  describe("authentication", () => {
    it("should include authorization header when token is provided", async () => {
      const clientWithToken = new GitHubClient("test-token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
      await clientWithToken.getUser("testuser");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "token test-token",
          }),
        }),
      );
    });
  });
});
describe("Utility Functions", () => {
  describe("formatRepoUrl", () => {
    it("should format repository URL with star count", () => {
      const repo = {
        id: 1,
        name: "test-repo",
        full_name: "testuser/test-repo",
        html_url: "https://github.com/testuser/test-repo",
        clone_url: "https://github.com/testuser/test-repo.git",
        ssh_url: "git@github.com:testuser/test-repo.git",
        stargazers_count: 42,
        forks_count: 10,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
        private: false,
      };
      const result = formatRepoUrl(repo);
      expect(result).toBe("https://github.com/testuser/test-repo (⭐ 42)");
    });
  });
  describe("calculateRepoAge", () => {
    it("should calculate repository age in days", () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const age = calculateRepoAge(oneDayAgo.toISOString());
      expect(age).toBe(1);
    });
    it("should handle future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const age = calculateRepoAge(tomorrow.toISOString());
      expect(age).toBe(1);
    });
  });
  describe("filterReposByLanguage", () => {
    const mockRepos = [
      {
        id: 1,
        name: "js-repo",
        full_name: "user/js-repo",
        html_url: "https://github.com/user/js-repo",
        clone_url: "https://github.com/user/js-repo.git",
        ssh_url: "git@github.com:user/js-repo.git",
        stargazers_count: 5,
        forks_count: 2,
        language: "JavaScript",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
        private: false,
      },
      {
        id: 2,
        name: "ts-repo",
        full_name: "user/ts-repo",
        html_url: "https://github.com/user/ts-repo",
        clone_url: "https://github.com/user/ts-repo.git",
        ssh_url: "git@github.com:user/ts-repo.git",
        stargazers_count: 3,
        forks_count: 1,
        language: "TypeScript",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
        private: false,
      },
      {
        id: 3,
        name: "no-lang-repo",
        full_name: "user/no-lang-repo",
        html_url: "https://github.com/user/no-lang-repo",
        clone_url: "https://github.com/user/no-lang-repo.git",
        ssh_url: "git@github.com:user/no-lang-repo.git",
        stargazers_count: 1,
        forks_count: 0,
        language: undefined,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-06-01T00:00:00Z",
        private: false,
      },
    ];
    it("should filter repositories by language (case insensitive)", () => {
      const jsRepos = filterReposByLanguage(mockRepos, "javascript");
      expect(jsRepos).toHaveLength(1);
      expect(jsRepos[0].name).toBe("js-repo");
      const tsRepos = filterReposByLanguage(mockRepos, "TypeScript");
      expect(tsRepos).toHaveLength(1);
      expect(tsRepos[0].name).toBe("ts-repo");
    });
    it("should return empty array for non-existent language", () => {
      const pythonRepos = filterReposByLanguage(mockRepos, "Python");
      expect(pythonRepos).toHaveLength(0);
    });
    it("should handle repositories without language", () => {
      const undefinedRepos = filterReposByLanguage(mockRepos, "undefined");
      expect(undefinedRepos).toHaveLength(0);
    });
  });
});
