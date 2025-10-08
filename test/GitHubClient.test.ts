import { describe, expect, it, vi} from "vitest";
import { GitHubClient } from "../src";
import { NotFoundError } from "../src/errors/"

describe("GitHubClient", () => {
    it("should fetch an issue from GitHub API", async () => {
        // mock fetch to return a minimal issue
        const mockIssue = {
            id: 123456789,
            number: 42,
            title: "Test Issue",
            state: "open",
            body: "This is a test issue"
        };

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: true,              // Success response
            status: 200,           // Success status
            statusText: "OK",      // Success status text
            json: async () => mockIssue
        } as Response);

        const client = new GitHubClient();
        const result = await client.getIssue("microsoft", "typescript", 42);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value.number).toBe(42)
            expect(result.value.title).toBe("Test Issue");
        }
    });

    it("should return not_found error when issue doesn't exist", async () => {
        const mockResponse = {
            message: "Not Found",
            documentation_url: "https://docs.github.com/rest/reference/issues#get-an-issue"
        };

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: async () => mockResponse,
            text: async () => JSON.stringify(mockResponse)
        } as Response);

        const client = new GitHubClient();

        const result = await client.getIssue("microsoft", "nonexistent-repo", 999);

        // First level: verify the Result is Err
        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
            // Second level: verify which error variant it is
            expect(result.error.type).toBe('not_found');

            // Third level: after checking the type, TypeScript knows the variant
            if (result.error.type === 'not_found') {
                // Now TypeScript knows this is the not_found variant
                // and we can safely access its specific fields
                expect(result.error.owner).toBe('microsoft');
                expect(result.error.repo).toBe('nonexistent-repo');
                expect(result.error.issueNumber).toBe(999);
                expect(result.error.url).toBe('https://api.github.com/repos/microsoft/nonexistent-repo/issues/999');
            }
        }
    });
});