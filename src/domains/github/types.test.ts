import { describe, expect, it } from "vitest";
import { parseGitHubIssue } from "./parser";
import type { GitHubTarget } from "./types";
import { GitHubIssueSchema, isIssueTarget, isRepoTarget } from "./types";

describe("GitHubTarget type guards", () => {
  it("should identify repo targets correctly", () => {
    const repoTarget: GitHubTarget = {
      kind: "repo",
      owner: "microsoft",
      repo: "typescript",
    };

    const result = isRepoTarget(repoTarget);

    expect(result).toBe(true);
  });

  it("should reject issue targets as repo targets", () => {
    const issueTarget: GitHubTarget = {
      kind: "issue",
      owner: "microsoft",
      repo: "typescript",
      number: 42,
    };

    const result = isRepoTarget(issueTarget);

    expect(result).toBe(false);
  });

  it("should identify issue targets correctly", () => {
    const issueTarget: GitHubTarget = {
      kind: "issue",
      owner: "microsoft",
      repo: "typescript",
      number: 42,
    };

    const result = isIssueTarget(issueTarget);
    expect(result).toBe(true);
  });

  it("should reject repo targets as issue targets", () => {
    const repoTarget: GitHubTarget = {
      kind: "repo",
      owner: "microsoft",
      repo: "typescript",
    };

    const result = isIssueTarget(repoTarget);

    expect(result).toBe(false);
  });

  it("should reject invalid repo objects", () => {
    const invalidInput = { kind: "repo" };

    const result = isRepoTarget(invalidInput);

    expect(result).toBe(false);
  });

  it("should reject invalid issue objects", () => {
    const invalidInput = { kind: "issue", owner: "microsoft" };

    const result = isIssueTarget(invalidInput);

    expect(result).toBe(false);
  });

  it("should reject issue with invalid number", () => {
    const invalidInput = {
      kind: "issue",
      owner: "microsoft",
      repo: "typescript",
      number: -1,
    };

    const result = isIssueTarget(invalidInput);

    expect(result).toBe(false);
  });
});

describe("GitHubIssue schema validation", () => {
  const validIssueBase = {
    id: 1,
    node_id: "MDU6SXNzdWUx",
    url: "https://api.github.com/repos/octocat/Hello-World/issues/1",
    repository_url: "https://api.github.com/repos/octocat/Hello-World",
    labels_url:
      "https://api.github.com/repos/octocat/Hello-World/labels{/name}",
    comments_url:
      "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
    events_url:
      "https://api.github.com/repos/octocat/Hello-World/issues/1/events",
    html_url: "https://github.com/octocat/Hello-World/issues/1",
    number: 1347,
    state: "open" as const,
    state_reason: null,
    title: "Found a bug",
    body: "I'm having a problem with this.",
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
        id: 208045946,
        node_id: "MDU6TGFiZWwyMDgwNDU5NDY=",
        url: "https://api.github.com/repos/octocat/Hello-World/labels/bug",
        name: "bug",
        color: "f29513",
        default: true,
        description: "Something isn't working",
      },
    ],
    assignee: null,
    assignees: [],
    milestone: null,
    locked: false,
    active_lock_reason: null,
    comments: 0,
    closed_at: null,
    created_at: "2011-04-22T13:33:48Z",
    updated_at: "2011-04-22T13:33:48Z",
    closed_by: null,
    author_association: "COLLABORATOR" as const,
    reactions: {
      url: "https://api.github.com/repos/octocat/Hello-World/issues/1/reactions",
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
  };

  it("should validate a complete valid GitHub issue response", () => {
    const result = GitHubIssueSchema.safeParse(validIssueBase);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.number).toBe(1347);
      expect(result.data.title).toBe("Found a bug");
      expect(result.data.state).toBe("open");
    }
  });

  it("should reject issue with invalid state", () => {
    const invalidResponse = {
      ...validIssueBase,
      state: "invalid_state",
    };

    const result = GitHubIssueSchema.safeParse(invalidResponse);

    expect(result.success).toBe(false);
    if (!result.success) {
      // Verify the error is about the state field
      const stateError = result.error.issues.find((issue) =>
        issue.path.includes("state"),
      );
      expect(stateError).toBeDefined();
      expect(stateError?.message).toContain("Invalid option");
    }
  });

  it("should reject issue with missing required fields", () => {
    const incompleteResponse = {
      id: 1,
      number: 1247,
      title: "Incomplete issue",
      // Missing manyu required fields: node_id, url, state, user, labels, etc.
    };

    const result = GitHubIssueSchema.safeParse(incompleteResponse);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);

      // Check that some expected required fields are in the errors
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("state");
      expect(paths).toContain("user");
    }
  });

  it("should accept issue with null body and assignee", () => {});
  const issueWithNulls = {
    ...validIssueBase,
    body: null,
    assignee: null,
    milestone: null,
  };

  const result = GitHubIssueSchema.safeParse(issueWithNulls);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.body).toBeNull();
    expect(result.data.assignee).toBeNull();
    expect(result.data.milestone).toBeNull();
  }
});

describe("parseGitHubIssue", () => {
  const validIssueBase = {
    id: 1,
    node_id: "MDU6SXNzdWUx",
    url: "https://api.github.com/repos/octocat/Hello-World/issues/1",
    repository_url: "https://api.github.com/repos/octocat/Hello-World",
    labels_url:
      "https://api.github.com/repos/octocat/Hello-World/labels{/name}",
    comments_url:
      "https://api.github.com/repos/octocat/Hello-World/issues/1/comments",
    events_url:
      "https://api.github.com/repos/octocat/Hello-World/issues/1/events",
    html_url: "https://github.com/octocat/Hello-World/issues/1",
    number: 1347,
    state: "open" as const,
    state_reason: null,
    title: "Found a bug",
    body: "I'm having a problem with this.",
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
        id: 208045946,
        node_id: "MDU6TGFiZWwyMDgwNDU5NDY=",
        url: "https://api.github.com/repos/octocat/Hello-World/labels/bug",
        name: "bug",
        color: "f29513",
        default: true,
        description: "Something isn't working",
      },
    ],
    assignee: null,
    assignees: [],
    milestone: null,
    locked: false,
    active_lock_reason: null,
    comments: 0,
    closed_at: null,
    created_at: "2011-04-22T13:33:48Z",
    updated_at: "2011-04-22T13:33:48Z",
    closed_by: null,
    author_association: "COLLABORATOR" as const,
    reactions: {
      url: "https://api.github.com/repos/octocat/Hello-World/issues/1/reactions",
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
  };

  it("should return Ok with valid issue data", () => {
    const result = parseGitHubIssue(validIssueBase);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.number).toBe(1347);
      expect(result.value.title).toBe("Found a bug");
    }
  });
});
