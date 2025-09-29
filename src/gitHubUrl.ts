import type {GitHubTarget, IssueTarget, RepoTarget} from "types";
import {isNonZeroDigitString, isValidOwnerName, isValidRepoName} from "./shared/validation";

type BuildersFor<T extends { kind: PropertyKey }> = {
    [K in T["kind"]]: (t: Extract<T, { kind: K }>) => string;
};

const builders: BuildersFor<GitHubTarget> = {
    repo: (t: RepoTarget): string => `/${t.owner}/${t.repo}`,
    issue: (t: IssueTarget): string => `/${t.owner}/${t.repo}/issues/${t.number}`,
} satisfies BuildersFor<GitHubTarget>;

const buildPath = (t: GitHubTarget): string => {
    switch (t.kind) {
        case "repo":
            return builders.repo(t);
        case "issue":
            return builders.issue(t);
    }
};

const parse = (url: string): GitHubTarget => {
    const parsedUrl = new URL(url);

    // Check for valid protocols first
    if (parsedUrl.protocol !== "https:") {
        throw new Error("HTTPS is required for GitHub URLs");
    }

    // Check for valid domain
    if (parsedUrl.hostname !== "github.com") {
        throw new Error(
            `Unsupported host: expected github.com, got ${parsedUrl.hostname}`,
        );
    }

    // split the pathname into segments and filter out empties
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
        throw new Error("GitHub URL must include /owner/repo");
    }

    // e.g. ["octocat", "hello-world", "issues", "42"]
    const [ownerRaw, repoRaw, resource, id] = segments as [
        string,
        string,
        string?,
        string?,
    ];

    const repoName = repoRaw.endsWith(".git") ? repoRaw.slice(0, -4) : repoRaw;

    if (!isValidRepoName(repoName)) {
        throw new Error(
            "Invalid repo: 1–100 chars using letters, digits, underscore, dot, or hyphen",
        );
    }

    const ownerName = ownerRaw.toLowerCase();
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

const build = (target: GitHubTarget, baseUrl: string = "https://github.com"): URL => {
    return new URL(buildPath(target), baseUrl);
};

export const gitHubUrl = {
    buildPath,
    parse,
    build,
};