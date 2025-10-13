// src/validation.ts

/** Regular expression for validating GitHub owner names (usernames/organizations) */
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

/** Regular expression for validating GitHub repository names */
const REPO_RE = /^[A-Za-z0-9_.-]{1,100}$/;

/**
 * Validates a GitHub owner name (username or organization).
 *
 * GitHub owner names must:
 * - Be 1-39 characters long
 * - Start and end with alphanumeric characters
 * - May contain hyphens in the middle
 * - Be case-insensitive (but this function expects lowercase input)
 *
 * @param s - The owner name to validate
 * @returns True if the name follows GitHub's owner naming rules
 *
 * @example
 * ```typescript
 * isValidOwnerName("octocat"); // true
 * isValidOwnerName("my-org"); // true
 * isValidOwnerName("-invalid"); // false (starts with hyphen)
 * isValidOwnerName(""); // false (empty)
 * ```
 */
export const isValidOwnerName = (s: string): boolean => OWNER_RE.test(s);

/**
 * Validates a GitHub repository name.
 *
 * GitHub repository names must:
 * - Be 1-100 characters long
 * - Contain only letters, numbers, underscores, dots, and hyphens
 * - Be case-sensitive
 *
 * @param s - The repository name to validate
 * @returns True if the name follows GitHub's repository naming rules
 *
 * @example
 * ```typescript
 * isValidRepoName("hello-world"); // true
 * isValidRepoName("my_repo.js"); // true
 * isValidRepoName(""); // false (empty)
 * isValidRepoName("repo with spaces"); // false (contains spaces)
 * ```
 */
export const isValidRepoName = (s: string): boolean => REPO_RE.test(s);

/**
 * Type guard to check if a value is a non-zero positive integer string.
 *
 * Used primarily for validating GitHub issue numbers, which must be positive integers.
 * Returns false for undefined, empty strings, zero, negative numbers, or non-numeric strings.
 *
 * @param s - The value to check (may be undefined)
 * @returns True if the value is a string representing a positive integer
 *
 * @example
 * ```typescript
 * isNonZeroDigitString("42"); // true
 * isNonZeroDigitString("0"); // false (zero)
 * isNonZeroDigitString("-5"); // false (negative)
 * isNonZeroDigitString("abc"); // false (not numeric)
 * isNonZeroDigitString(undefined); // false
 * ```
 */
export const isNonZeroDigitString = (s: string | undefined): s is string =>
  !!s && /^[1-9][0-9]*$/.test(s);
