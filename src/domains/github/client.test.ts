// test/clients/gitHub.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GitHubClient } from "./client";

describe("GitHubClient", () => {
  describe("Octokit implementation", () => {
    let mockOctokit: {
      rest: {
        issues: {
          get: ReturnType<typeof vi.fn>;
        };
      };
    };

    vi.mock("@octokit/rest", () => {
      return {
        Octokit: vi.fn(),
      };
    });

    beforeEach(async () => {
      // Create a mock Octokit instance
      mockOctokit = {
        rest: {
          issues: {
            get: vi.fn(),
          },
        },
      };

      // Make the Octokit constructor return our mock
      const { Octokit } = await import("@octokit/rest");
      vi.mocked(Octokit).mockImplementation(
        () => mockOctokit as unknown as InstanceType<typeof Octokit>,
      );
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    describe("getIssue", () => {
      it("converts successful Octokit response to Ok Result", async () => {
        const client = new GitHubClient("test-token");

        // Mock Octokit's response structure
        // Octokit returns { data, status, url, headers }
        mockOctokit.rest.issues.get.mockResolvedValueOnce({
          data: {
            number: 123,
            title: "Test Issue",
            state: "open",
            body: "Test body",
            labels: [],
            assignees: [],
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "20256-01-01T00:00:00Z",
            html_url: "https://github.com/owner/repo/issues/123",
            user: {
              id: 1,
              avatar_url: "https://avatars.githubusercontent.com/u/1",
              html_url: "https://github.com/testuser",
            },
          },
          status: 200,
          url: "https://api.github.com/repos/owner/issues/123",
          headers: {},
        });

        const result = await client.getIssue("owner", "repo", 123);

        // Verify we called Octokit correctly
        expect(mockOctokit.rest.issues.get).toHaveBeenCalledWith({
          owner: "owner",
          repo: "repo",
          issue_number: 123,
        });

        // Verify we got an Ok result
        expect(result.isOk()).toBe(true);

        if (result.isOk()) {
          const issue = result.value;
          expect(issue.number).toBe(123);
          expect(issue.title).toBe("Test Issue");
          expect(issue.state).toBe("open");
        }
      });

      it("converts 404 response to not_found error", async () => {
        const client = new GitHubClient("test-token");

        // Octokit throws an error object with status for HTTP errors
        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          name: "HttpError",
          status: 404,
          message: "Not Found",
          request: {
            method: "GET",
            url: "https://api.github.com/repos/owner/repo/issues/999",
            headers: {},
          },
        });

        const result = await client.getIssue("owner", "repo", 999);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("not_found");

          // Type guard: now TypeScript knows it's the not_found variant
          if (error.type === "not_found") {
            expect(error.owner).toBe("owner");
            expect(error.repo).toBe("repo");
            expect(error.issueNumber).toBe(999);
            expect(error.url).toBe(
              "https://api.github.com/repos/owner/repo/issues/999",
            );
          }
        }
      });

      it("converts 401 response to unauthorized error", async () => {
        const client = new GitHubClient("invalid-token");

        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          name: "HttpError",
          status: 401,
          message: "Bad credentials",
          request: {
            method: "GET",
            url: "https://api.github.com/repos/owner/repo/issues/123",
            headers: {},
          },
        });

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("unauthorized");

          if (error.type === "unauthorized") {
            expect(error.message).toBe("Bad credentials");
            expect(error.url).toBe(
              "https://api.github.com/repos/owner/repo/issues/123",
            );
          }
        }
      });

      it("converts 403 response to forbidden error", async () => {
        const client = new GitHubClient("test-token");

        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          name: "HttpError",
          status: 403,
          message: "Resource not accessible by personal access token",
          request: {
            method: "GET",
            url: "https://api.github.com/repos/owner/repo/issues/123",
            headers: {},
          },
        });

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("forbidden");

          if (error.type === "forbidden") {
            expect(error.message).toBe(
              "Resource not accessible by personal access token",
            );
            expect(error.url).toBe(
              "https://api.github.com/repos/owner/repo/issues/123",
            );
          }
        }
      });

      it("converts 403 with rate limit headers to rate_limited error", async () => {
        const client = new GitHubClient("test-token");

        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          name: "HttpError",
          status: 403,
          message: "API rate limit exceeded",
          request: {
            method: "GET",
            url: "https://api.github.com/repos/owner/repo/issues/123",
            headers: {},
          },
          response: {
            headers: {
              "x-ratelimit-remaining": "0",
              "retry-after": "60",
            },
          },
        });

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("rate_limited");

          if (error.type === "rate_limited") {
            expect(error.retryAfter).toBe(60);
            expect(error.url).toBe(
              "https://api.github.com/repos/owner/repo/issues/123",
            );
          }
        }
      });

      it("converts 500 response to server_error", async () => {
        const client = new GitHubClient("test-token");

        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          name: "HttpError",
          status: 500,
          message: "Internal Server Error",
          request: {
            method: "GET",
            url: "https://api.github.com/repos/owner/repo/issues/123",
            headers: {},
          },
        });

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("server_error");

          if (error.type === "server_error") {
            expect(error.statusCode).toBe(500);
            expect(error.statusText).toBe("Internal Server Error");
            expect(error.url).toBe(
              "https://api.github.com/repos/owner/repo/issues/123",
            );
          }
        }
      });

      it("converts network failures to network_error", async () => {
        const client = new GitHubClient("test-token");

        const networkError = new Error("getaddrinfo ENOTFOUND api.github.com");
        mockOctokit.rest.issues.get.mockRejectedValueOnce(networkError);

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("network_error");

          if (error.type === "network_error") {
            expect(error.message).toBe("getaddrinfo ENOTFOUND api.github.com");
            expect(error.cause).toBe(networkError);
          }
        }
      });

      it("handles malformed error objects gracefully", async () => {
        const client = new GitHubClient("test-token");

        // Reject with a non-standard error object
        mockOctokit.rest.issues.get.mockRejectedValueOnce({
          weird: "unexpected error shape",
        });

        const result = await client.getIssue("owner", "repo", 123);

        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;
          expect(error.type).toBe("network_error");
        }
      });
    });
  });
});
