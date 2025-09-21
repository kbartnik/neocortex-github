// src/url-parser.ts
export class GitHubUrlParser {
    parseUrl(url: string) {
        // Check for valid protocols first - catches invalid protocols early
        if (!(url.startsWith("http://") || url.startsWith("https://"))) {
            throw new Error("Not a valid GitHub URL");
        }

        // Minimal implementation - just enough to make the test pass
        const parts = url.split('/');
        const owner = parts[3]; // https://github.com/OWNER/repo
        const repo = parts[4];   // https://github.com/owner/REPO

        return {
            owner,
            repo
        };
    }
}