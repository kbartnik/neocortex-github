export type GitHubClientError =
  | {
      type: "not_found";
      owner: string;
      repo: string;
      issueNumber: number;
      url: string;
    }
  | { type: "unauthorized"; message: string; url: string }
  | { type: "forbidden"; message: string; url: string }
  | { type: "rate_limited"; retryAfter?: number; url: string }
  | {
      type: "server_error";
      statusCode: number;
      statusText: string;
      url: string;
    }
  | { type: "network_error"; message: string; cause: unknown }
  | { type: "invalid_response"; message: string; url: string };
