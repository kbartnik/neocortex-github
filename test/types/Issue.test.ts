import { describe, expect, it } from "vitest";
import type { Issue } from "../../src/types";

describe("Issue type", () => {
    it("should allow valid issue objects", () => {
        const issue: Issue = {
            id: 123456789,
            number: 42,
            title: "Test Issue",
            state: "open",
            body: "This is a test",
        };

        expect(issue.number).toBe(42);
        expect(issue.state).toBe("open");
    });
});