import { describe, expect, it } from "vitest";
import { transformGitHubIssue } from "./transforms";

describe("IR Node Transformation", () => {
  it("should return Ok with transformed IRNode for valid GitHub Issue", () => {
    const githubApiResponse = {
      id: 123456789,
      number: 42,
      title: "Fix the bug in user authentication",
      body: "When users try to log in with special characters...",
      state: "open" as const,
      created_at: "2025-01-15T10:30:00Z",
      labels: [{ name: "bug" }, { name: "high-priority" }],
      assignees: [{ login: "jane-dev" }, { login: "john-dev" }],
    };

    const result = transformGitHubIssue(
      githubApiResponse,
      "microsoft",
      "typescript",
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const node = result.value;
      expect(node.type).toBe("github-issue");
      expect(node.sourceId).toBe("github:microsoft/typescript#42");
      expect(node.title).toBe("Fix the bug in user authentication");
      expect(node.created_at).toBe("2025-01-15T10:30:00Z");
      expect(node.data.number).toBe(42);
      expect(node.data.body).toBe(
        "When users try to log in with special characters...",
      );
      expect(node.data.state).toBe("open");
      expect(node.data.labels).toEqual(["bug", "high-priority"]);
      expect(node.data.assignees).toEqual(["jane-dev", "john-dev"]);
      // ID should be a valid UUID7 format
      expect(node.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
  });
});
