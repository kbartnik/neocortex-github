// src/url-parser.ts
export class GitHubUrlParser {
    parseUrl(url: string) {
        // Parse URL segments
        const parsedUrl = new URL(url);

        // Check for valid protocols first - catches invalid protocols early
        if (!(parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")) {
            throw new Error("Not a valid GitHub URL");
        }

        // Check for valid domain
        if (!(parsedUrl.host === "github.com")) {
            throw new Error("Not a valid GitHub URL");
        }

        // split the pathname and filter out empty segments
        const segments = parsedUrl.pathname.split("/").filter(Boolean);
        if (segments.length < 2) {
            throw new Error("Not a valid GitHub URL");
        }

        return {
            owner: segments[0],
            repo: segments[1]
        }
    }
}