import { describe, expect, it } from "vitest";
import {
  isNonZeroDigitString,
  isValidOwnerName,
  isValidRepoName,
} from "./validation";

describe("validation module", () => {
  describe("isNonZeroDigitsString", () => {
    const validDigitStrings = ["1", "42", "1234567890"] as const;
    const invalidDigitStrings = [
      "", // empty
      "a".repeat(101), // too long
      "white space", // spaces not allowed
      "name/with/slash", // slash not allowed
      "name\\with\\backslash", // backslash not allowed
      "🔥", // non-ASCII emoji
      "semi;colon", // invalid punctuation
      "comma,name", // invalid punctuation
      "question?", // invalid punctuation
      "name*", // invalid punctuation
    ] as const;

    it("returns true for digit strings", () => {
      validDigitStrings.forEach((value) => {
        expect(isNonZeroDigitString(value)).toBe(true);
      });
    });

    it("returns false for undefined or non-digits", () => {
      invalidDigitStrings.forEach((value) => {
        expect(isNonZeroDigitString(value)).toBe(false);
      });
    });
  });

  describe("isValidRepoName", () => {
    const validRepos = [
      "simple",
      "with-hyphen",
      "with.underscore",
      "with.dot",
      "with-mix.of_all-123",
      "a".repeat(100), // max length
      "repo123",
      "my_repo",
      "my.repo",
      "combo.repo-name_123",
      ".github", // special but valid
      "dash-", // trailing dash is fine for repos
      "-leadingdash", // leading dash is fine for repos
      "12345", // numeric only
    ];
    const invalidRepos = [
      "", // empty
      "a".repeat(101), // too long
      "white space", // spaces not allowed
      "name/with/slash", // slash not allowed
      "name\\with\\backslash", // backslash not allowed
      "🔥", // non-ASCII emoji
      "semi;colon", // invalid punctuation
      "comma,name", // invalid punctuation
      "question?", // invalid punctuation
      "name*", // invalid punctuation
    ];

    it("accepts known valid repo names", () => {
      validRepos.forEach((name) => {
        expect(isValidRepoName(name)).toBe(true);
      });
    });

    it("rejects known invalid repo names", () => {
      invalidRepos.forEach((name: string) => {
        expect(isValidRepoName(name)).toBe(false);
      });
    });
  });
  describe("isValidOwnerName", () => {
    const validOwners = [
      "a",
      "abc",
      "A1",
      "octo-cat",
      "octo1cat",
      "a-b-c",
      "AAA",
      "user123",
      "hyphen-allowed",
      "MixedCase", // uppercase letters are allowed
      "a".repeat(39), // max length
      "Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z",
      `${"z".repeat(38)}9`,
    ] as const;
    const invalidOwners = [
      "", // empty
      "-bad", // leading hyphen
      "bad-", // trailing hyphen
      "-", // single hyphen
      "white space", // spaces not allowed
      "bad_name", // underscore not allowed
      "bad.name", // dot not allowed
      "🔥", // non-ASCII
      "a".repeat(40), // too long (>39)
    ] as const;

    it("accepts known valid owner names", () => {
      validOwners.forEach((name) => {
        expect(isValidOwnerName(name)).toBe(true);
      });
    });

    it("rejects known invalid owner names", () => {
      invalidOwners.forEach((name: string) => {
        expect(isValidOwnerName(name)).toBe(false);
      });
    });
  });
});
