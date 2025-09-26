// src/validation.ts
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_RE = /^[A-Za-z0-9_.-]{1,100}$/;

export const isValidOwnerName = (s: string): boolean => OWNER_RE.test(s);

export const isValidRepoName = (s: string): boolean => REPO_RE.test(s);

export const isNonZeroDigitString = (s: string | undefined): s is string =>
  !!s && /^[1-9][0-9]*$/.test(s);
