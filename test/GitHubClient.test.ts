import { describe, expect, it, vi} from "vitest";
import { GitHubClient } from "../src";

describe("GitHubClient", () => {
    it("should fetch an issue from GitHub API", async () => {
        // mock fetch to return a mimimal issue
        const mockIssue = {
            id: 123456789,
            number: 42,
            title: "Test Issue",
            state: "open",
            body: "This is a test issue"
        };

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: async () => mockIssue
        } as Response);

        const client = new GitHubClient();
        const result = await client.getIssue("microsoft", "typescript", 42);

        expect(result.number).toBe(42);
        expect(result.title).toBe("Test Issue");
    });
});