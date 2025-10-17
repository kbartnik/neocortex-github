import { describe, expect, it } from "vitest";
import type { GitHubClientError } from "./errors";

describe("GitHubClientError type", () => {
  it("allows not_found error variant", () => {
    const error: GitHubClientError = {
      type: "not_found",
      owner: "microsoft",
      repo: "typescript",
      issueNumber: 12345,
      url: "https://api.github.com/repos/microsoft/typescript/issues/12345",
    };

    expect(error.type).toBe("not_found");
    expect(error.owner).toBe("microsoft");
    expect(error.repo).toBe("typescript");
    expect(error.issueNumber).toBe(12345);
  });

  it("allows unauthorized error variant", () => {
    const error: GitHubClientError = {
      type: "unauthorized",
      message: "Invalid token",
      url: "https://api.github.com/repos/owner/repo/issues/1",
    };

    expect(error.type).toBe("unauthorized");
    expect(error.message).toBe("Invalid token");
    expect(error.url).toBeDefined();
  });

  it("allows forbidden error variant", () => {
    const error: GitHubClientError = {
      type: "forbidden",
      message: "Access denied",
      url: "https://api.github.com/repos/owner/repo/issues/1",
    };

    expect(error.type).toBe("forbidden");
    expect(error.message).toBe("Access denied");
  });

  it("allows rate_limited error variant", () => {
    const error: GitHubClientError = {
      type: "rate_limited",
      retryAfter: 3600,
      url: "https://api.github.com/repos/owner/repo/issues/1",
    };

    expect(error.type).toBe("rate_limited");
    expect(error.retryAfter).toBe(3600);
  });

  it("allows server_error variant", () => {
    const error: GitHubClientError = {
      type: "server_error",
      statusCode: 500,
      statusText: "Internal Server Error",
      url: "https://api.github.com/repos/owner/repo/issues/1",
    };

    expect(error.type).toBe("server_error");
    expect(error.statusCode).toBe(500);
    expect(error.statusText).toBe("Internal Server Error");
  });

  it("allows network_error variant", () => {
    const error: GitHubClientError = {
      type: "network_error",
      message: "Connection timeout",
      cause: new Error("ETIMEDOUT"),
    };

    expect(error.type).toBe("network_error");
    expect(error.message).toBe("Connection timeout");
    expect(error.cause).toBeInstanceOf(Error);
  });

  it("allows invalid_response variant", () => {
    const error: GitHubClientError = {
      type: "invalid_response",
      message: "JSON parse error",
      url: "https://api.github.com/repos/owner/repo/issues/1",
    };

    expect(error.type).toBe("invalid_response");
    expect(error.message).toBe("JSON parse error");
  });
});
