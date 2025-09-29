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

        expect(result.number).toBe(42);
        expect(result.title).toBe("Test Issue");
    });

    it("should throw NotFoundError with context when issue doesn't exist", async () => {
        const mockResponse = {
            message: "Not Found",
            documentation_url: "https://docs.github.com/rest/reference/issues#get-an-issue"
        };

        vi.spyOn(global, "fetch").mockResolvedValue({
            ok: false,          // This is crucial - tells the client it's an error response
            status: 404,
            statusText: "Not Found",
            json: async () => mockResponse
        } as Response);

        const client = new GitHubClient();

        try {
            await client.getIssue("microsoft", "nonexistent-repo", 999);
            expect.fail("Expected NotFoundError to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
            if (error instanceof NotFoundError) {
                expect(error.target).toEqual({
                    owner: "microsoft",
                    repo: "nonexistent-repo",
                    number: 999
                });
                expect(error.requestUrl).toBe("https://api.github.com/repos/microsoft/nonexistent-repo/issues/999");
                expect(error.statusCode).toBe(404);
                expect(error.statusText).toBe("Not Found");
                expect(error.rawResponse).toEqual(mockResponse);
                expect(error.timestamp).toBeInstanceOf(Date);
            }
        }
    });
});