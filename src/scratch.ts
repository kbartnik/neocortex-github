import { GitHubClient } from "./GitHubClient";

const client = new GitHubClient();

// Fetch a well-known issue
client.getIssue("kbartnik", "neocortex-github", 2)
    .then(issue => {
        console.log("Successfully fetched issue!");
        console.log(`Title: ${issue.title}`);
        console.log(`State: ${issue.state}`);
        console.log(`ID: ${issue.id}`);
    })
    .catch(error => {
        console.error("Error fetching issue:", error.message);
    });