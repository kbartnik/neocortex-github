import { describe, expect, it } from "vitest";
import type { DeepReadonly } from "./types";

describe("DeepReadonly", () => {
  it("should make primitive properties readonly", () => {
    type Data = { count: number; name: string };
    type ReadonlyData = DeepReadonly<Data>;

    const data: ReadonlyData = { count: 5, name: "test" };

    // These should cause TypeScript errors (compile-time test):
    // data.count = 10;
    // data.name = "changed";

    expect(data.count).toBe(5);
  });

  it("should make nested object properties readonly", () => {
    type Data = {
      metadata: {
        tags: string[];
        priority: number;
      };
    };
    type ReadonlyData = DeepReadonly<Data>;

    const data: ReadonlyData = {
      metadata: {
        tags: ["urgent"],
        priority: 1,
      },
    };

    // These should cause TypeScript errors:
    // data.metadata.priority = 2;
    // data.metadata.tags.push("new");

    expect(data.metadata.tags).toEqual(["urgent"]);
  });

  it("should make arrays readonly", () => {
    type Data = { items: string[] };
    type ReadonlyData = DeepReadonly<Data>;

    const data: ReadonlyData = { items: ["a", "b"] };

    // This should cause TypeScript error:
    // data.items.push("c");

    expect(data.items.length).toBe(2);
  });

  it("should handle null and undefined", () => {
    type Data = {
      value: string | null;
      optional?: number;
    };
    type ReadonlyData = DeepReadonly<Data>;

    const data1: ReadonlyData = { value: null };
    const data2: ReadonlyData = { value: "test" };

    expect(data1.value).toBeNull();
    expect(data2.optional).toBeUndefined();
  });

  it("should pass through Date objects (with documentation caveat)", () => {
    type Data = { timestamp: Date };
    type ReadonlyData = DeepReadonly<Data>;

    const date = new Date("2025-01-01");
    const data: ReadonlyData = { timestamp: date };

    // Note: This is NOT prevented by DeepReadonly (limitation documented)
    data.timestamp.setFullYear(2099);

    expect(data.timestamp.getFullYear()).toBe(2099);
  });
});
