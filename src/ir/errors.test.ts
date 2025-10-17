import { describe, expect, it } from "vitest";
import type { TransformError } from "./errors";

describe("TransformError type", () => {
  it("allows invalid_issue_state error variant", () => {
    const error: TransformError = {
      type: "invalid_issue_state",
      state: "pending",
      owner: "microsoft",
      repo: "typescript",
      number: 12345,
    };

    expect(error.type).toBe("invalid_issue_state");
    expect(error.state).toBe("pending");
    expect(error.owner).toBe("microsoft");
    expect(error.repo).toBe("typescript");
    expect(error.number).toBe(12345);
  });

  it("provides context for debugging invalid states", () => {
    const error: TransformError = {
      type: "invalid_issue_state",
      state: "archived",
      owner: "facebook",
      repo: "react",
      number: 99999,
    };

    // Error should contain enough context to identify the problematic issue
    expect(error).toHaveProperty("owner");
    expect(error).toHaveProperty("repo");
    expect(error).toHaveProperty("number");
    expect(error).toHaveProperty("state");
  });

  it("represents operational failures not bugs", () => {
    // TransformError indicates bad data from external systems,
    // not bugs in our code. This is different from InternalError.
    const error: TransformError = {
      type: "invalid_issue_state",
      state: "unknown_state_from_api",
      owner: "test",
      repo: "repo",
      number: 1,
    };

    // The error type should be a discriminated union for type-safe handling
    expect(error.type).toBe("invalid_issue_state");
  });

  it("supports pattern matching with type narrowing", () => {
    const error: TransformError = {
      type: "invalid_issue_state",
      state: "wontfix",
      owner: "org",
      repo: "project",
      number: 42,
    };

    // TypeScript should narrow the type based on the discriminant
    if (error.type === "invalid_issue_state") {
      // These properties should be accessible after narrowing
      expect(error.state).toBeDefined();
      expect(error.owner).toBeDefined();
      expect(error.repo).toBeDefined();
      expect(error.number).toBeDefined();
    }
  });
});
