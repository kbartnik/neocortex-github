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

            expect(() => parser.parseUrl("ftp://github.com/microsoft/typescript")).toThrow("Not a valid GitHub URL");
        })
    });
});