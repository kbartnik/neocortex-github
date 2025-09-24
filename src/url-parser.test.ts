// src/url-parser.test.ts
import { describe, expect, it } from "vitest";
import { GitHubUrlParser } from "./url-parser";

describe("GitHubUrlParser", () => {
    describe("parseUrl", () => {
        it("should parse a basic repository URL", () => {
            const parser = new GitHubUrlParser();
            const url = "https://github.com/microsoft/typescript";

            const result = parser.parseUrl(url);

            expect(result.owner).toBe("microsoft");
            expect(result.repo).toBe("typescript");
        });

        it("should throw error for invalid protocols", () => {
            const parser = new GitHubUrlParser();

            expect(() => parser.parseUrl("ftp://github.com/microsoft/typescript"))
                .toThrow("Not a valid GitHub URL");
        })

        it("should throw TypeError for malformed URLs", () => {
            const parser = new GitHubUrlParser();

            expect(() => parser.parseUrl("not-a-url"))
                .toThrow(TypeError);
        })

        it("should provide specific error message for missing repository", () => {
            const parser = new GitHubUrlParser();

            expect(() => parser.parseUrl("https://github.com/owner"))
                .toThrow("GitHub URL must include both owner and repository (github.com/owner/repo)");
        })

        it("should provide specific error messages for non-GitHub domains", () => {
            const parser = new GitHubUrlParser();

            expect(() => parser.parseUrl("https://gitlab.com/owner/repo"))
                .toThrow('URL must be from github.com domain, got: gitlab.com')
        })
    });
});