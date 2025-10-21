import { describe, expect, it } from "vitest";
import { transformGitHubIssue } from "./transforms";

describe("IR Node Transformation", () => {
  it("should return Ok with transformed IRNode for valid GitHub Issue", () => {
    const githubApiResponse = {
      id: 123456789,
      node_id: "MDU6SXNzdWUxMjM0NTY3ODk=",
      url: "https://api.github.com/repos/microsoft/typescript/issues/42",
      repository_url: "https://api.github.com/repos/microsoft/typescript",
      labels_url: "https://api.github.com/repos/microsoft/typescript/labels{/name}",
      comments_url: "https://api.github.com/repos/microsoft/typescript/issues/42/comments",
      events_url: "https://api.github.com/repos/microsoft/typescript/issues/42/events",
      html_url: "https://github.com/microsoft/typescript/issues/42",
      number: 42,
      state: "open" as const,
      state_reason: null,
      title: "Fix the bug in user authentication",
      body: "When users try to log in with special characters...",
      user: {
        login: "octocat",
        id: 1,
        node_id: "MDQ6VXNlcjE=",
        avatar_url: "https://github.com/images/error/octocat_happy.gif",
        gravatar_id: "",
        url: "https://api.github.com/users/octocat",
        html_url: "https://github.com/octocat",
        type: "User" as const,
        site_admin: false,
      },
      labels: [
        {
          id: 1,
          node_id: "MDU6TGFiZWwx",
          url: "https://api.github.com/repos/microsoft/typescript/labels/bug",
          name: "bug",
          color: "f29513",
          default: true,
          description: "Something isn't working",
        },
        {
          id: 2,
          node_id: "MDU6TGFiZWwy",
          url: "https://api.github.com/repos/microsoft/typescript/labels/high-priority",
          name: "high-priority",
          color: "d73a4a",
          default: false,
          description: "High priority issue",
        },
      ],
      assignee: null,
      assignees: [
        {
          login: "jane-dev",
          id: 2,
          node_id: "MDQ6VXNlcjI=",
          avatar_url: "https://github.com/images/error/jane.gif",
          gravatar_id: "",
          url: "https://api.github.com/users/jane-dev",
          html_url: "https://github.com/jane-dev",
          type: "User" as const,
          site_admin: false,
        },
        {
          login: "john-dev",
          id: 3,
          node_id: "MDQ6VXNlcjM=",
          avatar_url: "https://github.com/images/error/john.gif",
          gravatar_id: "",
          url: "https://api.github.com/users/john-dev",
          html_url: "https://github.com/john-dev",
          type: "User" as const,
          site_admin: false,
        },
      ],
      milestone: null,
      locked: false,
      active_lock_reason: null,
      comments: 0,
      closed_at: null,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z",
      closed_by: null,
      author_association: "CONTRIBUTOR" as const,
      reactions: {
        url: "https://api.github.com/repos/microsoft/typescript/issues/42/reactions",
        total_count: 0,
        "+1": 0,
        "-1": 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
    } as const;

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
