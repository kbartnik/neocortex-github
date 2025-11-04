import type { DeepReadonly } from "@core/types";
import type { TransformError } from "@ir/errors";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { z } from "zod";

/** GitHub issue data returned by the REST API
 *
 * This type is inferred from the GitHubIssueSchema and Represents
 * the mutable shape from the API before applying immutability.
 *
 * @see https://docs.github.com/en/rest/issues/issues#get-an-issue
 */
type GitHubIssueData = z.infer<typeof GitHubIssueSchema>;

/** Immutable GitHub issue as used throughout the application
 *
 * All properties are deeply readonly. This is the primary type you should use
 * for GitHub issues. The schema validates the shape and runtime, while DeepReadonly
 * enforces immutability at compile time.
 */
export type GitHubIssue = DeepReadonly<GitHubIssueData>;

/**
 * Error type for GitHub issue parsing failures.
 *
 * Contains detailed validation issues from Zod schema parsing.
 */
export type GitHubParseError = {
  type: "PARSE_ERROR";
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>;
};

// ============================================================================
// Zod Schemas for GitHub API Data
// ============================================================================

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string(),
  gravatar_id: z.string(),
  url: z.string(),
  html_url: z.string(),
  type: z.enum(["User", "Bot", "Organization"]),
  site_admin: z.boolean(),
});

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const GitHubLabelSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  name: z.string(),
  color: z.string(),
  default: z.boolean(),
  description: z.string().nullable(),
});

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const GitHubReactionsSchema = z.object({
  url: z.string(),
  total_count: z.number(),
  "+1": z.number(),
  "-1": z.number(),
  laugh: z.number(),
  hooray: z.number(),
  confused: z.number(),
  heart: z.number(),
  rocket: z.number(),
  eyes: z.number(),
});

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const GitHubPullRequestRefSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  diff_url: z.string(),
  patch_url: z.string(),
});

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
const GitHubMilestoneSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  number: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  creator: GitHubUserSchema,
  open_issues: z.number(),
  closed_issues: z.number(),
  state: z.enum(["open", "closed"]),
  created_at: z.string(),
  updated_at: z.string(),
  due_on: z.string().nullable(),
  closed_at: z.string().nullable(),
});

// biome-ignore lint/nursery/useExplicitType: Zod schemas are self-describing
export const GitHubIssueSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  repository_url: z.string(),
  labels_url: z.string(),
  comments_url: z.string(),
  events_url: z.string(),
  html_url: z.string(),
  number: z.number(),
  state: z.enum(["open", "closed"]),
  state_reason: z.enum(["completed", "reopened", "not_planned"]).nullable(),
  title: z.string(),
  body: z.string().nullable(),
  user: GitHubUserSchema,
  labels: z.array(GitHubLabelSchema),
  assignee: GitHubUserSchema.nullable(),
  assignees: z.array(GitHubUserSchema),
  milestone: GitHubMilestoneSchema.nullable(),
  locked: z.boolean(),
  active_lock_reason: z.string().nullable(),
  comments: z.number(),
  pull_request: GitHubPullRequestRefSchema.optional(),
  closed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  closed_by: GitHubUserSchema.nullable(),
  author_association: z.enum([
    "OWNER",
    "MEMBER",
    "CONTRIBUTOR",
    "COLLABORATOR",
    "FIRST_TIME_CONTRIBUTOR",
    "FIRST_TIMER",
    "NONE",
  ]),
  reactions: GitHubReactionsSchema,
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates an issue state string against allowed values.
 *
 * @param state - The state string to validate
 * @param context - Context about the issue for error reporting
 * @returns A Result containing either the validated state or an error
 *
 * @example
 * ```typescript
 * const result = validateIssueState("open", {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   number: 42
 * });
 * ```
 */
export const validateIssueState = (
  state: string,
  context: {
    owner: string;
    repo: string;
    number: number;
  },
): Result<"open" | "closed", TransformError> => {
  if (state === "open" || state === "closed") {
    return ok(state);
  }

  return err({
    type: "invalid_issue_state",
    state,
    owner: context.owner,
    repo: context.repo,
    number: context.number,
  });
};

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Parses and validates a GitHub API issue response.
 *
 * This function validates raw data (typically from JSON responses) against the
 * GitHub issue schema, ensuring type safety and data integrity.
 *
 * @param data - Unknown data to parse (typically from API response JSON)
 * @returns A Result containing either the validated GitHubIssue or parsing errors
 *
 * @example
 * ```typescript
 * const apiResponse = await fetch('https://api.github.com/repos/owner/repo/issues/1');
 * const json = await apiResponse.json();
 * const result = parseGitHubIssue(json);
 *
 * if (result.isOk()) {
 *   console.log('Issue:', result.value.title);
 * } else {
 *   console.error('Parse errors:', result.error.issues);
 * }
 * ```
 */
export function parseGitHubIssue(
  data: unknown,
): Result<GitHubIssue, GitHubParseError> {
  const result = GitHubIssueSchema.safeParse(data);

  if (!result.success) {
    return err({
      type: "PARSE_ERROR",
      issues: result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }
  return ok(result.data as GitHubIssue);
}
