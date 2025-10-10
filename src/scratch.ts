import { match } from "ts-pattern";
import { GitHubClient } from "./clients/GitHubClient";

const client = new GitHubClient();

// Fetch a well-known issue
// client
//   .getIssue("kbartnik", "neocortex-github", 2)
//   .then((issue) => {
//     console.log("Successfully fetched issue!");
//     console.log(`Title: ${issue.title}`);
//     console.log(`State: ${issue.state}`);
//     console.log(`ID: ${issue.id}`);
//   })
//   .catch((error) => {
//     console.error("Error fetching issue:", error.message);
//   });

// Fetch a well-known issue
// getIssue now returns ResultAsync<Issue, GitHubClientError>
client
  .getIssue("kbartnik", "neocortex-github", 2)
  // map is like `then` but it only runs if Result is Ok
  // The issue is automatically unwrapped for you inside tghe callback
  .map((issue) => {
    console.log("Successfully fetched issue!");
    console.log(`Title: ${issue.title}`);
    console.log(`State: ${issue.state}`);
    console.log(`ID: ${issue.id}`);
    return issue; // Return it so we could continue chaining if needed
  })
  // mapErr is like 'catch' but it receives the structured error type
  // instead of a generic error object, you get a GitHubClientError
  .mapErr((error) => {
    // Use ts-pattern to handle different error types exhaustively
    const _errorMessage = match(error)
      .with(
        { type: "not_found" },
        (e) => `Issue #${e.issueNumber} not found in ${e.owner}/${e.repo}`,
      )
      .with(
        { type: "unauthorized" },
        (e) => `Authentication failed: ${e.message}`,
      )
      .with({ type: "forbidden" }, (e) => `Access forbidden: ${e.message}`)
      .with({ type: "rate_limited" }, (e) =>
        e.retryAfter
          ? `Rate limited. Retry after ${e.retryAfter} seconds`
          : "Rate limited. Try again later",
      )
      .with(
        { type: "server_error" },
        (e) => `GitHub server error: ${e.statusCode} ${e.statusText}`,
      )
      .with({ type: "network_error" }, (e) => `Network error: ${e.message}`)
      .with(
        { type: "invalid_response" },
        (e) => `Invalid response from GitHub: ${e.message}`,
      )
      .exhaustive();
  });
