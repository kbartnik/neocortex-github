// src/url-parser.test.ts
import {describe, expect, it} from "vitest";
import {parseGitHubUrl} from "./url-parser";

describe("parseGithubUrl", () => {
    it("should parse a basic repository URL", () => {
        const url = "https://github.com/microsoft/typescript";

        const result = parseGitHubUrl(url);

        expect(result.owner).toBe("microsoft");
        expect(result.repo).toBe("typescript");
    });

    it("should throw TypeError for malformed URL", () => {
        const url = "not-a-url";

        expect(() => parseGitHubUrl(url))
            .toThrow(TypeError);
    });

    it("should throw error for invalid protocol", () => {
        const url = "ftp://github.com/microsoft/typescript";

        expect(() => parseGitHubUrl(url))
            .toThrow("Not a valid GitHub URL");
    })

    it("should throw specific error for non-GitHub domain", () => {
        const url = "https://gitlab.com/microsoft/typescript";

        expect(() => parseGitHubUrl(url))
            .toThrow('URL must be from github.com domain, got: gitlab.com')
    })

    it("should provide specific error messages for missing repository", () => {
        const url = "https://github.com/owner";

        expect(() => parseGitHubUrl(url))
            .toThrow("GitHub URL must include both owner and repository (github.com/owner/repo)");
    })
});
