import { describe, expect, it } from "vitest";
import type { GitHubIssueData, GitHubIssueNode, IRNode } from "./types";

describe("IRNode type", () => {
  it("defines base structure for all IR nodes", () => {
    const node: IRNode<{ customData: string }> = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "custom-node",
      sourceId: "custom:source#123",
      title: "Test Node",
      created_at: "2025-01-15T10:30:00Z",
      data: { customData: "test" },
    };

    expect(node.id).toBeDefined();
    expect(node.type).toBe("custom-node");
    expect(node.sourceId).toBe("custom:source#123");
    expect(node.title).toBe("Test Node");
    expect(node.created_at).toBe("2025-01-15T10:30:00Z");
    expect(node.data.customData).toBe("test");
  });

  it("supports generic data payload", () => {
    type CustomData = { value: number; labels: string[] };
    const node: IRNode<CustomData> = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "test",
      sourceId: "test:1",
      title: "Test",
      created_at: "2025-01-15T10:30:00Z",
      data: { value: 42, labels: ["a", "b"] },
    };

    expect(node.data.value).toBe(42);
    expect(node.data.labels).toEqual(["a", "b"]);
  });

  it("accepts unknown data payload by default", () => {
    const node: IRNode = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "untyped",
      sourceId: "test:1",
      title: "Test",
      created_at: "2025-01-15T10:30:00Z",
      data: { anything: "goes" },
    };

    expect(node.data).toBeDefined();
  });
});

describe("GitHubIssueData type", () => {
  it("defines GitHub-specific issue data", () => {
    const data: GitHubIssueData = {
      number: 42,
      body: "Issue description",
      state: "open",
      labels: ["bug", "enhancement"],
      assignees: ["developer1", "developer2"],
    };

    expect(data.number).toBe(42);
    expect(data.body).toBe("Issue description");
    expect(data.state).toBe("open");
    expect(data.labels).toEqual(["bug", "enhancement"]);
    expect(data.assignees).toEqual(["developer1", "developer2"]);
  });

  it("enforces state to be 'open' or 'closed'", () => {
    const openData: GitHubIssueData = {
      number: 1,
      body: "Test",
      state: "open",
      labels: [],
      assignees: [],
    };

    const closedData: GitHubIssueData = {
      number: 2,
      body: "Test",
      state: "closed",
      labels: [],
      assignees: [],
    };

    expect(openData.state).toBe("open");
    expect(closedData.state).toBe("closed");
  });

  it("allows empty arrays for labels and assignees", () => {
    const data: GitHubIssueData = {
      number: 1,
      body: "No labels or assignees",
      state: "open",
      labels: [],
      assignees: [],
    };

    expect(data.labels).toEqual([]);
    expect(data.assignees).toEqual([]);
  });
});

describe("GitHubIssueNode type", () => {
  it("combines IRNode with GitHubIssueData", () => {
    const node: GitHubIssueNode = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "github-issue",
      sourceId: "github:microsoft/typescript#12345",
      title: "Add support for decorators",
      created_at: "2023-01-15T10:30:00Z",
      data: {
        number: 12345,
        body: "We should add support for...",
        state: "open",
        labels: ["enhancement", "help wanted"],
        assignees: ["username1", "username2"],
      },
    };

    expect(node.type).toBe("github-issue");
    expect(node.sourceId).toBe("github:microsoft/typescript#12345");
    expect(node.data.number).toBe(12345);
    expect(node.data.state).toBe("open");
  });

  it("enforces type to be exactly 'github-issue'", () => {
    const node: GitHubIssueNode = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "github-issue",
      sourceId: "github:owner/repo#1",
      title: "Test Issue",
      created_at: "2025-01-15T10:30:00Z",
      data: {
        number: 1,
        body: "Body",
        state: "open",
        labels: [],
        assignees: [],
      },
    };

    // Type should be narrowed to the literal "github-issue"
    const assertType: "github-issue" = node.type;
    expect(assertType).toBe("github-issue");
  });

  it("provides complete context for GitHub issues", () => {
    const node: GitHubIssueNode = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "github-issue",
      sourceId: "github:facebook/react#27769",
      title: "Bug in useEffect",
      created_at: "2023-12-01T14:20:00Z",
      data: {
        number: 27769,
        body: "There's an issue with useEffect when...",
        state: "closed",
        labels: ["bug", "React Core Team"],
        assignees: ["reactdev"],
      },
    };

    // Should contain all information needed to reconstruct issue context
    expect(node.sourceId).toContain("facebook/react");
    expect(node.sourceId).toContain("#27769");
    expect(node.data.number).toBe(27769);
    expect(node.title).toBeDefined();
    expect(node.created_at).toBeDefined();
  });

  it("supports issues with empty bodies", () => {
    const node: GitHubIssueNode = {
      id: "01932e6f-5c6f-7890-abcd-1234567890ab",
      type: "github-issue",
      sourceId: "github:owner/repo#1",
      title: "Issue with no description",
      created_at: "2025-01-15T10:30:00Z",
      data: {
        number: 1,
        body: "",
        state: "open",
        labels: [],
        assignees: [],
      },
    };

    expect(node.data.body).toBe("");
  });
});
