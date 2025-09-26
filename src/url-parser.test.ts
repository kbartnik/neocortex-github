// src/url-parser.test.ts
import { describe, expect, it } from "vitest";
import { parseGitHubUrl } from "./url-parser";

describe("parseGitHubUrl", () => {
  it("should parse a basic repository URL", () => {
    const url = "https://github.com/microsoft/typescript";

    const result = parseGitHubUrl(url);
    expect(result).toEqual({
      kind: "repo",
      owner: "microsoft",
      repo: "typescript",
    });
  });

  it("should not include number for repo URLs", () => {
    const url = "https://github.com/microsoft/typescript";

    const result = parseGitHubUrl(url);

    expect("number" in result).toBe(false);
  });

  it("should strip .git suffix from repo names", () => {
    const url = "https://github.com/o/r.git";

    const result = parseGitHubUrl(url);
    expect(result).toEqual({
      kind: "repo",
      owner: "o",
      repo: "r",
    });
  });

  it("treats non-issue subpaths as repo for now", () => {
    const url = "https://github.com/o/r/tree/main";
    expect(parseGitHubUrl(url)).toEqual({
      kind: "repo",
      owner: "o",
      repo: "r",
    });
  });

  it("should parse an issue URL with number", () => {
    const url = "https://github.com/octocat/hello-world/issues/42";

    const result = parseGitHubUrl(url);

    expect(result).toEqual({
      kind: "issue",
      owner: "octocat",
      repo: "hello-world",
      number: 42,
    });
  });

  it("should parse an issue URL with trailing slash", () => {
    const url = "https://github.com/octocat/hello-world/issues/42/";

    const result = parseGitHubUrl(url);

    expect(result).toEqual({
      kind: "issue",
      owner: "octocat",
      repo: "hello-world",
      number: 42,
    });
  });

  it("should handle duplicate slashes gracefully", () => {
    const url = "https://github.com/octocat/hello-world/issues//42//";

    const result = parseGitHubUrl(url);

    expect(result).toEqual({
      kind: "issue",
      owner: "octocat",
      repo: "hello-world",
      number: 42,
    });
  });

  it("should reject issue URL without number", () => {
    const url = "https://github.com/octocat/hello-world/issues/not-a-number";

    expect(() => parseGitHubUrl(url)).toThrow(
      "Issue number must be a positive integer",
    );
  });

  it("should throw TypeError for malformed URL", () => {
    const url = "not-a-url";

    expect(() => parseGitHubUrl(url)).toThrow(TypeError);
  });

  it("should throw error for invalid protocol", () => {
    const url = "ftp://github.com/microsoft/typescript";

    expect(() => parseGitHubUrl(url)).toThrow(
      "HTTPS is required for GitHub URLs",
    );
  });

  it("rejects http (requires https)", () => {
    const url = "http://github.com/microsoft/typescript/";

    expect(() => parseGitHubUrl(url)).toThrow(
      "HTTPS is required for GitHub URLs",
    );
  });

  it("should throw specific error for non-GitHub domain", () => {
    const url = "https://gitlab.com/microsoft/typescript";

    expect(() => parseGitHubUrl(url)).toThrow(
      "Unsupported host: expected github.com, got gitlab.com",
    );
  });

  it("rejects www.github.com (strict host)", () => {
    const url = "https://www.github.com/microsoft/typescript";
    expect(() => parseGitHubUrl(url)).toThrow(
      "Unsupported host: expected github.com, got www.github.com",
    );
  });

  it("should provide specific error messages for missing repository", () => {
    const url = "https://github.com/owner";

    expect(() => parseGitHubUrl(url)).toThrow(
      "GitHub URL must include /owner/repo",
    );
  });

  it("should reject owner names starting with a hyphen", () => {
    const url = "https://github.com/-bad/r";

    expect(() => parseGitHubUrl(url)).toThrow(
      "Invalid owner: must be 1–39 chars, alphanumeric, may contain hyphens, and cannot start or end with a hyphen",
    );
  });

  it("should reject repo names containing spaces", () => {
    const url = "https://github.com/o/r with space";

    expect(() => parseGitHubUrl(url)).toThrow(
      "Invalid repo: 1–100 chars using letters, digits, underscore, dot, or hyphen",
    );
  });
});
