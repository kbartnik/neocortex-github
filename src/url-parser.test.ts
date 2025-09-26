// src/url-parser.test.ts
import {describe, expect, it} from "vitest";
import {parseGitHubUrl, isPositiveInt   } from "./url-parser";

describe("parseGitHubUrl", () => {
    it("should parse a basic repository URL", () => {
        const url = "https://github.com/microsoft/typescript";

        const result = parseGitHubUrl(url);
        expect(result).toEqual({
            kind: "repo",
            owner: "microsoft",
            repo: "typescript"
        })
    });

    it("should throw TypeError for malformed URL", () => {
        const url = "not-a-url";

        expect(() => parseGitHubUrl(url))
            .toThrow(TypeError);
    });

    it("should throw error for invalid protocol", () => {
        const url = "ftp://github.com/microsoft/typescript";

        expect(() => parseGitHubUrl(url))
            .toThrow("HTTPS is required for GitHub URLs");
    })

    it("rejects http (requires https)", () => {
        const url = "http://github.com/microsoft/typescript";

        expect(() => parseGitHubUrl(url))
            .toThrow("HTTPS is required for GitHub URLs");
    });

    it("should throw specific error for non-GitHub domain", () => {
        const url = "https://gitlab.com/microsoft/typescript";

        expect(() => parseGitHubUrl(url))
            .toThrow('Unsupported host: expected github.com, got gitlab.com');
    })

    it("should provide specific error messages for missing repository", () => {
        const url = "https://github.com/owner";

        expect(() => parseGitHubUrl(url))
            .toThrow("GitHub URL must include /owner/repo");
    })

    it("should parse an issue URL with number", () => {
        const url = "https://github.com/octocat/hello-world/issues/42";

        const result = parseGitHubUrl(url);

        expect(result).toEqual({
            kind: "issue",
            owner: "octocat",
            repo: "hello-world",
            number: 42
        });
    })

    it("treats non-issue subpaths as repo for now", () => {
        const url = "https://github.com/o/r/tree/main";
        expect(parseGitHubUrl(url))
            .toEqual({ kind: "repo", owner: "o", repo: "r" });
    });

    it("should parse an issue URL with trailing slash", () => {
        const url = "https://github.com/octocat/hello-world/issues/42/";

        const result = parseGitHubUrl(url);

        expect(result).toEqual({
            kind: "issue",
            owner: "octocat",
            repo: "hello-world",
            number: 42
        });
    })

    it("should reject issue URL without number", () => {
        const url = "https://github.com/octocat/hello-world/issues/not-a-number";

        expect(() => parseGitHubUrl(url))
            .toThrow("Issue number must be a positive integer");
    })

    it("should not include number for repo URLs", () => {
        const url = "https://github.com/microsoft/typescript";

        const result = parseGitHubUrl(url);

        expect("number" in result).toBe(false);
    })

});

describe("isPositiveInt", () => {
    it("returns true for digit strings", () => {
        expect(isPositiveInt("42")).toBe(true);
    });

    it("returns false for undefined or non-digits", () => {
        expect(isPositiveInt(undefined)).toBe(false);
        expect(isPositiveInt("")).toBe(false);
        expect(isPositiveInt("42abc")).toBe(false);
        expect(isPositiveInt("-1")).toBe(false);
        expect(isPositiveInt("0")).toBe(false);
    });
});
