import { describe, expect, it } from "vitest"
import { gitHubUrl } from "../src/gitHubUrl";
import type {GitHubTarget} from "../src/types";

describe("gitHubUrl module", () => {
    describe("parse", () => {
        it("should parse a basic repository URL", () => {
            const url = "https://github.com/microsoft/typescript";

            const result = gitHubUrl.parse(url);

            expect(result).toEqual({ kind: "repo", owner: "microsoft", repo:"typescript"});
        });

        it("should parse an issue URL", () => {
            const url = "https://github.com/microsoft/typescript/issues/123";

            const result = gitHubUrl.parse(url);

            expect(result).toEqual({
                kind: "issue",
                owner: "microsoft",
                repo: "typescript",
                number: 123
            });
        });

        it("should handle .git suffix in repo URL", () => {
            const url = "https://github.com/microsoft/typescript.git";

            const result = gitHubUrl.parse(url);

            expect(result).toEqual({ kind: "repo", owner: "microsoft", repo: "typescript" });
        });

        it("should normalize owner name to lowercase", () => {
            const url = "https://github.com/Microsoft/TypeScript";

            const result = gitHubUrl.parse(url);

            expect(result).toEqual({ kind: "repo", owner: "microsoft", repo: "TypeScript" });
        });

        it("should throw for non-HTTPS URLs", () => {
            expect(() => gitHubUrl.parse("http://github.com/owner/repo"))
                .toThrow("HTTPS is required for GitHub URLs");
        });

        it("should throw for invalid hostname", () => {
            expect(() => gitHubUrl.parse("https://gitlab.com/owner/repo"))
                .toThrow("Unsupported host: expected github.com, got gitlab.com");
        });

        it("should throw for URLs without owner/repo", () => {
            expect(() => gitHubUrl.parse("https://github.com/"))
                .toThrow("GitHub URL must include /owner/repo");

            expect(() => gitHubUrl.parse("https://github.com/owner"))
                .toThrow("GitHub URL must include /owner/repo");
        });

        it("should throw for invalid repo names", () => {
            expect(() => gitHubUrl.parse("https://github.com/owner/invalid@repo"))
                .toThrow("Invalid repo: 1–100 chars using letters, digits, underscore, dot, or hyphen");
        });

        it("should throw for invalid owner names", () => {
            expect(() => gitHubUrl.parse("https://github.com/-invalid/repo"))
                .toThrow("Invalid owner: must be 1–39 chars, alphanumeric, may contain hyphens, and cannot start or end with a hyphen");
        });

        it("should throw for invalid issue numbers", () => {
            expect(() => gitHubUrl.parse("https://github.com/owner/repo/issues/0"))
                .toThrow("Issue number must be a positive integer");

            expect(() => gitHubUrl.parse("https://github.com/owner/repo/issues/abc"))
                .toThrow("Issue number must be a positive integer");
        });

        it("should handle complex valid repo names", () => {
            const url = "https://github.com/owner/repo_name-with.dots";

            const result = gitHubUrl.parse(url);

            expect(result).toEqual({ kind: "repo", owner: "owner", repo: "repo_name-with.dots" });
        });
    });

    describe("build", () => {
        it("should build a URL from repo target", () => {
            const target: GitHubTarget = { kind: "repo", owner: "microsoft", repo: "typescript" };

            const result = gitHubUrl.build(target);

            expect(result.toString()).toBe("https://github.com/microsoft/typescript");
        });

        it("should build a URL from issue target", () => {
            const target: GitHubTarget = { kind: "issue", owner: "microsoft", repo: "typescript", number: 123 };

            const result = gitHubUrl.build(target);

            expect(result.toString()).toBe("https://github.com/microsoft/typescript/issues/123");
        });

        it("should use custom base URL", () => {
            const target: GitHubTarget = { kind: "repo", owner: "owner", repo: "repo" };

            const result = gitHubUrl.build(target, "https://github.enterprise.com");

            expect(result.toString()).toBe("https://github.enterprise.com/owner/repo");
        });
    });

    describe("buildPath", () => {
        it("should build path for repo target", () => {
            const target: GitHubTarget = { kind: "repo", owner: "owner", repo: "repo" };

            const result = gitHubUrl.buildPath(target);

            expect(result).toBe("/owner/repo");
        });

        it("should build path for issue target", () => {
            const target: GitHubTarget = { kind: "issue", owner: "owner", repo: "repo", number: 42 };

            const result = gitHubUrl.buildPath(target);

            expect(result).toBe("/owner/repo/issues/42");
        });
    });
});