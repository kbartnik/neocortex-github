// test/IRNode.test.ts (new file)
import { describe, expect, it } from "vitest";
import {transformGitHubIssue} from "../src/ir/transforms";
// We'll need these imports once we create them:
// import { transformGitHubIssue } from "../src/ir/transform";
// import type { IRNode, GitHubIssueData } from "../src/ir/types";

describe("IR Node Transformation", () => {
    it("should transform GitHub Issue API response to IRNode", () => {
        const githubApiResponse = {
            id: 123456789,
            number: 42,
            title: "Fix the bug in user authentication",
            body: "When users try to log in with special characters...",
            state: "open",
            created_at: "2025-01-15T10:30:00Z",
            labels: [
                { name: "bug" },
                { name: "high-priority" }
            ],
            assignees: [
                { login: "jane-dev" },
                { login: "john-dev" }
            ]
        };

        const result = transformGitHubIssue(githubApiResponse, "microsoft", "typescript");

        expect(result.type).toBe("github-issue");
        expect(result.sourceId).toBe("github:microsoft/typescript#42");
        expect(result.title).toBe("Fix the bug in user authentication");
        expect(result.created_at).toBe("2025-01-15T10:30:00Z");
        expect(result.data.number).toBe(42);
        expect(result.data.body).toBe("When users try to log in with special characters...");
        expect(result.data.state).toBe("open");
        expect(result.data.labels).toEqual(["bug", "high-priority"]);
        expect(result.data.assignees).toEqual(["jane-dev", "john-dev"]);
        // ID should be a valid UUID7 format
        expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
});