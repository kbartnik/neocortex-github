import type { GitHubTarget } from "./types/GitHubTarget";
import {
  isNonZeroDigitString,
  isValidOwnerName,
  isValidRepoName,
} from "./validation";

export const parseGitHubUrl = (url: string): GitHubTarget => {
  const parsedUrl = new URL(url);

  // Check for valid protocols first
  if (parsedUrl.protocol !== "https:") {
    throw new Error("HTTPS is required for GitHub URLs");
  }

  // Check for valid domain
  if (!(parsedUrl.hostname === "github.com")) {
    throw new Error(
      `Unsupported host: expected github.com, got ${parsedUrl.hostname}`,
    );
  }

  // split the pathname into segments and filter out empties
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("GitHub URL must include /owner/repo");
  }

  const [owner, repo, resource, id] = segments;
  // e.g. ["octocat", "hello-world", "issues", "42"]

  let repoName = repo;
  if (repoName.endsWith(".git")) {
    repoName = repoName.slice(0, -4);
  }

  if (!isValidRepoName(repo)) {
    throw new Error(
      "Invalid repo: 1–100 chars using letters, digits, underscore, dot, or hyphen",
    );
  }

  const ownerName = owner.toLowerCase();
  if (!isValidOwnerName(ownerName)) {
    throw new Error(
      "Invalid owner: must be 1–39 chars, alphanumeric, may contain hyphens, and cannot start or end with a hyphen",
    );
  }

  if (resource === "issues") {
    if (!isNonZeroDigitString(id)) {
      throw new Error("Issue number must be a positive integer");
    }
    return {
      kind: "issue",
      owner: ownerName,
      repo: repoName,
      number: Number(id),
    };
  }

  return { kind: "repo", owner: ownerName, repo: repoName };
};
