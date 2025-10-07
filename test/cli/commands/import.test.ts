// test/cli/commands/import.test.ts

import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { importCommand } from '../../../src/cli/commands/import';
import {GitHubClient} from "../../../src";

describe('importCommand', () => {
    let mockGetIssue: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Mock the GitHubClient.getIssue method before each test.
        mockGetIssue = vi.fn();
        GitHubClient.prototype.getIssue = mockGetIssue;
    });

    afterEach(() => {
        // Restore all mocks for argument validation, invalid URLs, and unsupported resources.
        vi.restoreAllMocks();
    })

    describe('argument validation', () => {
        it('returns error when no URL provided', async () => {
            const result = await importCommand([]);

            if (result.isErr()) {
                const error = result.error;

                // Assert the discriminant first
                expect(error.type).toBe("missing_argument");

                // Now narrow the type and check the variant-specific fields
                if (error.type === 'missing_argument') {
                    expect(error.command).toBe("import");
                    expect(error.expected).toBe("<github-url>");
                }
            }
        });

        it("returns error when URL is invalid format", async () => {
            const result = await importCommand(['not-a-url']);

            if (result.isErr()) {
                const error = result.error;

                expect(error.type).toBe("invalid_url");

                if (error.type === "invalid_url") {
                    expect(error.url).toBe("not-a-url");
                    expect(error.reason).toBeDefined();
                }
            }
        });

        it("returns error when resource type is not supported", async () => {
            const result = await(importCommand(["https://github.com/microsoft/TypeScript"]));

            expect(result.isErr()).toBe(true);

            if (result.isErr()) {
                const error = result.error;
                expect(error.type).toBe("unsupported_resource");

                if (error.type === "unsupported_resource") {
                    expect(error.url).toBe("https://github.com/microsoft/TypeScript");
                    expect(error.resourceType).toBe("repo");
                }
            }
        });
    });

    describe("successful import", () => {
        it("returns IR node when issue is fetched successfully", async () => {
            // Mock a successful API response with realistic GitHub issue data
            mockGetIssue.mockResolvedValue({
                number: 123,
                title: "Test Issue Title",
                state: "open",
                body: "This is the issue body content",
                labels: [{ name: "bug"}, {name: "enhancement" }],
                assignees: [{ login: "dev1" }, { login: "dev2" }],
                created_at: "2025-01-15T12:00:00Z"
            });

            const result = await importCommand([
                "https://github.com/microsoft/typescript/issues/123"
            ]);

            if (result.isOk()) {
                const node = result.value;

                // verify the node has the correct type and structure
                expect(node.type).toBe("github-issue");
                expect(node.title).toBe("Test Issue Title");

                // verify the data field contains the issue-specific information
                expect(node.data.number).toBe(123);
                expect(node.data.state).toBe("open");
                expect(node.data.body).toBe("This is the issue body content");
                expect(node.data.labels).toEqual(["bug", "enhancement"]);
                expect(node.data.assignees).toEqual(["dev1", "dev2"]);

                // verify the node has a UUIDv7 identifier
                expect(node.id).toBeDefined();
                expect(typeof node.id).toBe("string");

                // verify created_at was preserved
                expect(node.created_at).toBe("2025-01-15T12:00:00Z");

                // verify the GitHub client was called with correct parameters
                expect(mockGetIssue).toHaveBeenCalledWith("microsoft", "typescript", 123);
                expect(mockGetIssue).toHaveBeenCalledTimes(1);
            }
        })
    })
});