export const parseGitHubUrl = (url: string)=>  {
    const parsedUrl = new URL(url);

    // Check for valid protocols first
    if (!(parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")) {
        throw new Error("Not a valid GitHub URL");
    }

    // Check for valid domain
    if (!(parsedUrl.host === "github.com")) {
        throw new Error(`URL must be from github.com domain, got: ${parsedUrl.host}`);
    }

    // split the pathname into segments and filter out empties
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
        throw new Error("GitHub URL must include both owner and repository (github.com/owner/repo)");
    }

    return {
        owner: segments[0],
        repo: segments[1]
    }
}