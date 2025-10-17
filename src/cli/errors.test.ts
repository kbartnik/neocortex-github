import { describe, expect, it } from "vitest";
import type { CliError } from "./errors";
import { formatCliError } from "./errors";

describe("formatCliError", () => {
  describe("invalid_url errors", () => {
    it("formats invalid_url error with protocol issue", () => {
      const error: CliError = {
        type: "invalid_url",
        url: "http://github.com/owner/repo/issues/123",
        reason: { type: "invalid_protocol", protocol: "http:" },
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Invalid GitHub URL");
      expect(formatted).toContain("http://github.com/owner/repo/issues/123");
      expect(formatted).toContain(
        "Expected format: https://github.com/owner/repo/issues/NUMBER",
      );
    });

    it("formats invalid_url error with hostname issue", () => {
      const error: CliError = {
        type: "invalid_url",
        url: "https://gitlab.com/owner/repo",
        reason: { type: "invalid_hostname", hostname: "gitlab.com" },
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Invalid GitHub URL");
      expect(formatted).toContain("https://gitlab.com/owner/repo");
    });
  });

  describe("unsupported_resource errors", () => {
    it("formats unsupported_resource error for repo URLs", () => {
      const error: CliError = {
        type: "unsupported_resource",
        url: "https://github.com/microsoft/typescript",
        resourceType: "repo",
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Unsupported resource type: repo");
      expect(formatted).toContain("https://github.com/microsoft/typescript");
      expect(formatted).toContain("Currently only GitHub issues are supported");
    });
  });

  describe("fetch_failed errors", () => {
    it("formats fetch_failed error with cause information", () => {
      const error: CliError = {
        type: "fetch_failed",
        target: "microsoft/typescript#12345",
        cause: { type: "network_error", message: "Connection timeout" },
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Failed to fetch resource");
      expect(formatted).toContain("microsoft/typescript#12345");
    });
  });

  describe("not_found errors", () => {
    it("formats not_found error with target and URL", () => {
      const error: CliError = {
        type: "not_found",
        target: "microsoft/typescript#99999",
        url: "https://api.github.com/repos/microsoft/typescript/issues/99999",
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Resource not found");
      expect(formatted).toContain("microsoft/typescript#99999");
      expect(formatted).toContain(
        "https://api.github.com/repos/microsoft/typescript/issues/99999",
      );
    });
  });

  describe("missing_argument errors", () => {
    it("formats missing_argument error with command context", () => {
      const error: CliError = {
        type: "missing_argument",
        command: "import",
        expected: "<github-url>",
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Missing required argument for import");
      expect(formatted).toContain("Expected: <github-url>");
    });
  });

  describe("invalid_data errors", () => {
    it("formats invalid_data error with message", () => {
      const error: CliError = {
        type: "invalid_data",
        message: "Issue state must be 'open' or 'closed'",
        details: { state: "pending", owner: "test", repo: "repo", number: 1 },
      };

      const formatted = formatCliError(error);

      expect(formatted).toContain("Invalid data received");
      expect(formatted).toContain("Issue state must be 'open' or 'closed'");
    });
  });
});
