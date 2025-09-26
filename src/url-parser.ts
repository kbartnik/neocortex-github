export type RepoTarget = {
    kind: "repo", owner: string, repo: string,
};

export type IssueTarget = {
    kind: "issue", owner: string, repo: string, number: number,
};

export type GitHubTarget = RepoTarget | IssueTarget;

export const isPositiveInt = (s: string | undefined): s is string => !!s && /^[1-9][0-9]*$/.test(s);

export const parseGitHubUrl = (url: string): GitHubTarget => {
    const parsedUrl = new URL(url);

    // Check for valid protocols first
    if (parsedUrl.protocol !== "https:") {
        throw new Error("HTTPS is required for GitHub URLs");
    }

    // Check for valid domain
    if (!(parsedUrl.hostname === "github.com")) {
        throw new Error(`Unsupported host: expected github.com, got ${parsedUrl.hostname}`);
    }

    // split the pathname into segments and filter out empties
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
        throw new Error("GitHub URL must include /owner/repo");
    }

    const [owner, repo, resource, id] = segments;
    // e.g. ["octocat", "hello-world", "issues", "42"]

    if (resource === "issues") {

        if (!isPositiveInt(id)) {
            throw new Error("Issue number must be a positive integer");
        }
        return {kind: "issue", owner, repo, number: Number(id)}
    }
    return {kind: "repo", owner, repo}

}
