import { beforeAll, describe, expect, it } from "vitest";
import { GitHubClient } from "./index.js";

describe("GitHub API Integration Tests", () => {
  let client: GitHubClient;

  beforeAll(() => {
    client = new GitHubClient();
  });

  describe("Public API endpoints (no auth required)", () => {
    it("should fetch public user data", async () => {
      const user = await client.getUser("octocat");

      expect(user).toMatchObject({
        id: expect.any(Number),
        login: "octocat",
        avatar_url: expect.stringMatching(/^https?:\/\//),
        html_url: "https://github.com/octocat",
        public_repos: expect.any(Number),
        followers: expect.any(Number),
        following: expect.any(Number),
        created_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        ),
      });
    });

    it("should fetch user repositories", async () => {
      const repos = await client.getUserRepositories("octocat");

      expect(Array.isArray(repos)).toBe(true);
      if (repos.length > 0) {
        const repo = repos[0];
        expect(repo).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          full_name: expect.stringMatching(/^octocat\//),
          html_url: expect.stringMatching(/^https:\/\/github\.com\/octocat\//),
          clone_url: expect.stringMatching(
            /^https:\/\/github\.com\/octocat\/.*\.git$/,
          ),
          ssh_url: expect.stringMatching(/^git@github\.com:octocat\/.*\.git$/),
          stargazers_count: expect.any(Number),
          forks_count: expect.any(Number),
          created_at: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
          ),
          updated_at: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
          ),
          private: expect.any(Boolean),
        });
      }
    });

    it("should fetch specific repository", async () => {
      const repo = await client.getRepository("octocat", "Hello-World");

      expect(repo).toMatchObject({
        id: expect.any(Number),
        name: "Hello-World",
        full_name: "octocat/Hello-World",
        html_url: "https://github.com/octocat/Hello-World",
        clone_url: "https://github.com/octocat/Hello-World.git",
        ssh_url: "git@github.com:octocat/Hello-World.git",
        stargazers_count: expect.any(Number),
        forks_count: expect.any(Number),
        created_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        ),
        updated_at: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        ),
        private: false,
      });
    });

    it("should handle non-existent user", async () => {
      await expect(
        client.getUser("this-user-definitely-does-not-exist-12345"),
      ).rejects.toMatchObject({
        message: "Not Found",
        status: 404,
      });
    });

    it("should handle non-existent repository", async () => {
      await expect(
        client.getRepository("octocat", "non-existent-repo-12345"),
      ).rejects.toMatchObject({
        message: "Not Found",
        status: 404,
      });
    });
  });

  describe("Repository sorting and filtering", () => {
    it("should fetch repositories with different sort orders", async () => {
      const reposByCreated = await client.getUserRepositories(
        "octocat",
        "created",
        "asc",
      );
      const reposByUpdated = await client.getUserRepositories(
        "octocat",
        "updated",
        "desc",
      );

      expect(Array.isArray(reposByCreated)).toBe(true);
      expect(Array.isArray(reposByUpdated)).toBe(true);

      if (reposByCreated.length > 1) {
        const first = new Date(reposByCreated[0].created_at);
        const second = new Date(reposByCreated[1].created_at);
        expect(first.getTime()).toBeLessThanOrEqual(second.getTime());
      }
    });
  });

  describe("Rate limiting and error handling", () => {
    it("should handle rate limiting gracefully", async () => {
      const requests = Array.from({ length: 5 }, () =>
        client.getUser("octocat").catch((error) => error),
      );

      const results = await Promise.all(requests);

      results.forEach((result) => {
        if (result && typeof result === "object" && "status" in result) {
          expect([200, 403, 429]).toContain(result.status);
        } else {
          expect(result).toMatchObject({
            id: expect.any(Number),
            login: "octocat",
          });
        }
      });
    });
  });
});
