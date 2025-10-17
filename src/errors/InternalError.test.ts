import { describe, expect, it } from "vitest";
import { InternalError } from "./InternalError";

describe("InternalError", () => {
  it("creates error with message and context", () => {
    const error = new InternalError("Impossible state detected", {
      value: 42,
      expected: "string",
    });

    expect(error.name).toBe("InternalError");
    expect(error.message).toBe("[INTERNAL] Impossible state detected");
    expect(error.context).toEqual({ value: 42, expected: "string" });
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("creates error with message only (empty context)", () => {
    const error = new InternalError("Array access violated semantics");

    expect(error.message).toBe("[INTERNAL] Array access violated semantics");
    expect(error.context).toEqual({});
  });

  it("captures timestamp close to creation time", () => {
    const before = Date.now();
    const error = new InternalError("Test error");
    const after = Date.now();

    expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(error.timestamp.getTime()).toBeLessThanOrEqual(after);
  });

  it("is an instance of Error", () => {
    const error = new InternalError("Test");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InternalError);
  });

  it("prefixes message with [INTERNAL]", () => {
    const error = new InternalError("Something went wrong");

    expect(error.message).toMatch(/^\[INTERNAL\]/);
    expect(error.message).toContain("Something went wrong");
  });

  it("preserves arbitrary context data", () => {
    const context = {
      argsLength: 5,
      args: ["a", "b", "c", "d", "e"],
      expectedIndex: 0,
      actualValue: undefined,
    };

    const error = new InternalError("Context preservation test", context);

    expect(error.context.argsLength).toBe(5);
    expect(error.context.args).toEqual(["a", "b", "c", "d", "e"]);
    expect(error.context.expectedIndex).toBe(0);
    expect(error.context.actualValue).toBeUndefined();
  });

  it("captures stack trace", () => {
    const error = new InternalError("Stack trace test");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("InternalError");
  });

  it("supports nested error context", () => {
    const originalError = new Error("Original failure");
    const error = new InternalError("Wrapper error", {
      cause: originalError,
      location: "parser.ts:142",
    });

    expect(error.context.cause).toBeInstanceOf(Error);
    expect((error.context.cause as Error).message).toBe("Original failure");
    expect(error.context.location).toBe("parser.ts:142");
  });

  it("handles context with various data types", () => {
    const error = new InternalError("Type variety test", {
      string: "text",
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
      object: { nested: "value" },
    });

    expect(error.context.string).toBe("text");
    expect(error.context.number).toBe(42);
    expect(error.context.boolean).toBe(true);
    expect(error.context.nullValue).toBeNull();
    expect(error.context.array).toEqual([1, 2, 3]);
    expect(error.context.object).toEqual({ nested: "value" });
  });
});
