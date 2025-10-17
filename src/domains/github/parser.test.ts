import { describe, expect, it } from "vitest";
import { gitHubUrl, parsePositiveInteger, validateIssueState } from "./parser";
import type { GitHubTarget } from "./types";

describe("gitHubUrl module", () => {
  describe("parse", () => {
    it("should parse a basic repository URL", () => {
      const url = "https://github.com/microsoft/typescript";

      const result = gitHubUrl.parse(url);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          kind: "repo",
          owner: "microsoft",
          repo: "typescript",
        });
      }
    });

    it("should parse an issue URL", () => {
      const url = "https://github.com/microsoft/typescript/issues/123";

      const result = gitHubUrl.parse(url);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          kind: "issue",
          owner: "microsoft",
          repo: "typescript",
          number: 123,
        });
      }
    });

    it("should handle .git suffix in repo URL", () => {
      const url = "https://github.com/microsoft/typescript.git";

      const result = gitHubUrl.parse(url);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          kind: "repo",
          owner: "microsoft",
          repo: "typescript",
        });
      }
    });

    it("should normalize owner name to lowercase", () => {
      const url = "https://github.com/Microsoft/TypeScript";

      const result = gitHubUrl.parse(url);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          kind: "repo",
          owner: "microsoft",
          repo: "TypeScript",
        });
      }
    });

    it("should return Err for non-HTTPS URLs", () => {
      const result = gitHubUrl.parse("http://github.com/owner/repo");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("invalid_protocol");
        if (result.error.type === "invalid_protocol") {
          expect(result.error.protocol).toBe("http:");
        }
      }
    });

    it("should return Err for invalid hostname", () => {
      const result = gitHubUrl.parse("https://gitlab.com/owner/repo");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("invalid_hostname");
        if (result.error.type === "invalid_hostname") {
          expect(result.error.hostname).toBe("gitlab.com");
        }
      }
    });

    it("should return Err for URLs without owner/repo", () => {
      const missingRepoResult = gitHubUrl.parse("https://github.com/");

      expect(missingRepoResult.isErr()).toBe(true);
      if (missingRepoResult.isErr()) {
        expect(missingRepoResult.error.type).toBe("missing_path_segments");
        if (missingRepoResult.error.type === "missing_path_segments") {
          expect(missingRepoResult.error.url).toBe("https://github.com/");
        }
      }

      const missingOwnerResult = gitHubUrl.parse("https://github.com/owner");

      expect(missingOwnerResult.isErr()).toBe(true);
      if (missingOwnerResult.isErr()) {
        expect(missingOwnerResult.error.type).toBe("missing_path_segments");
        if (missingOwnerResult.error.type === "missing_path_segments") {
          expect(missingOwnerResult.error.url).toBe("https://github.com/owner");
        }
      }
    });

    it("should return Err for invalid repo names", () => {
      const result = gitHubUrl.parse("https://github.com/owner/invalid@repo");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("invalid_repo_name");
        if (result.error.type === "invalid_repo_name") {
          expect(result.error.repo).toBe("invalid@repo");
        }
      }
    });

    it("should return Err for invalid owner names", () => {
      const result = gitHubUrl.parse("https://github.com/-invalid/repo");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("invalid_owner_name");
        if (result.error.type === "invalid_owner_name") {
          expect(result.error.owner).toBe("-invalid");
        }
      }
    });

    it("should return Err for issue number 0", () => {
      const zeroIssueNumberResult = gitHubUrl.parse(
        "https://github.com/owner/repo/issues/0",
      );

      expect(zeroIssueNumberResult.isErr()).toBe(true);
      if (zeroIssueNumberResult.isErr()) {
        expect(zeroIssueNumberResult.error.type).toBe("invalid_issue_number");
        if (zeroIssueNumberResult.error.type === "invalid_issue_number") {
          expect(zeroIssueNumberResult.error.value).toBe("0");
        }
      }
    });

    it("should return Err for non-numeric issue numbers", () => {
      const nonNumericIssueNumberResult = gitHubUrl.parse(
        "https://github.com/owner/repo/issues/abc",
      );

      expect(nonNumericIssueNumberResult.isErr()).toBe(true);
      if (nonNumericIssueNumberResult.isErr()) {
        expect(nonNumericIssueNumberResult.error.type).toBe(
          "invalid_issue_number",
        );
        if (nonNumericIssueNumberResult.error.type === "invalid_issue_number") {
          expect(nonNumericIssueNumberResult.error.value).toBe("abc");
        }
      }
    });

    it("should handle complex valid repo names", () => {
      const url = "https://github.com/owner/repo_name-with.dots";

      const result = gitHubUrl.parse(url);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          kind: "repo",
          owner: "owner",
          repo: "repo_name-with.dots",
        });
      }
    });
  });

  describe("build", () => {
    it("should build a URL from repo target", () => {
      const target: GitHubTarget = {
        kind: "repo",
        owner: "microsoft",
        repo: "typescript",
      };

      const result = gitHubUrl.build(target);

      expect(result.toString()).toBe("https://github.com/microsoft/typescript");
    });

    it("should build a URL from issue target", () => {
      const target: GitHubTarget = {
        kind: "issue",
        owner: "microsoft",
        repo: "typescript",
        number: 123,
      };

      const result = gitHubUrl.build(target);

      expect(result.toString()).toBe(
        "https://github.com/microsoft/typescript/issues/123",
      );
    });

    it("should use custom base URL", () => {
      const target: GitHubTarget = {
        kind: "repo",
        owner: "owner",
        repo: "repo",
      };

      const result = gitHubUrl.build(target, "https://github.enterprise.com");

      expect(result.toString()).toBe(
        "https://github.enterprise.com/owner/repo",
      );
    });
  });

  describe("buildPath", () => {
    it("should build path for repo target", () => {
      const target: GitHubTarget = {
        kind: "repo",
        owner: "owner",
        repo: "repo",
      };

      const result = gitHubUrl.buildPath(target);

      expect(result).toBe("/owner/repo");
    });

    it("should build path for issue target", () => {
      const target: GitHubTarget = {
        kind: "issue",
        owner: "owner",
        repo: "repo",
        number: 42,
      };

      const result = gitHubUrl.buildPath(target);

      expect(result).toBe("/owner/repo/issues/42");
    });
  });
});

describe("parsePositiveInteger", () => {
  it("should parse valid positive integers", () => {
    const result = parsePositiveInteger("42");

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(42);
  });

  it("should reject negative numbers", () => {
    const result = parsePositiveInteger("-5");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe("Must be positive");
  });

  it("should reject non-numeric string", () => {
    const result = parsePositiveInteger("foo");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe("Not a valid number");
  });
});

describe("validateIssueState", () => {
  it("should return Ok('open') when state is 'open'", () => {
    const result = validateIssueState("open", {
      owner: "facebook",
      repo: "react",
      number: 123,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe("open");
    }
  });

  it("should return Ok('closed') when state is 'closed'", () => {
    const result = validateIssueState("closed", {
      owner: "facebook",
      repo: "react",
      number: 123,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe("closed");
    }
  });

  it("should return Err for invalid state without context", () => {
    const result = validateIssueState("banana", {
      owner: "facebook",
      repo: "react",
      number: 123,
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({
        type: "invalid_issue_state",
        state: "banana",
        owner: "facebook",
        repo: "react",
        number: 123,
      });
    }
  });

  it("should return Err for empty state with context", () => {
    const result = validateIssueState("", {
      owner: "facebook",
      repo: "react",
      number: 123,
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({
        type: "invalid_issue_state",
        state: "",
        owner: "facebook",
        repo: "react",
        number: 123,
      });
    }
  });
});
