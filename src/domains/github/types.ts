import type { DeepReadonly } from "@core/types";
import { isValidOwnerName, isValidRepoName } from "@core/validation";
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
 * Represents a GitHub repository target.
 *
 * Used to identify and construct URLs for GitHub repositories.
 * The owner and repo names must follow GitHub's naming conventions.
 *
 * @example
 * ```typescript
 * const target: RepoTarget = {
 *   kind: "repo",
 *   owner: "microsoft",
 *   repo: "typescript"
 * };
 * ```
 */
export type RepoTarget = {
  /** Discriminator field to identify this as a repository target */
  kind: "repo";
  /** The repository owner (username or organization name) */
  owner: string;
  /** The repository name */
  repo: string;
};

/**
 * Represents a GitHub issue target.
 *
 * Used to identify and construct URLs for GitHub issues.
 * The owner and repo names must follow GitHub's naming conventions,
 * and the issue number must be a positive integer.
 *
 * @example
 * ```typescript
 * const target: IssueTarget = {
 *   kind: "issue",
 *   owner: "microsoft",
 *   repo: "typescript",
 *   number: 12345
 * };
 * ```
 */
export type IssueTarget = {
  /** Discriminator field to identify this as an issue target */
  kind: "issue";
  /** The repository owner (username or organization name) */
  owner: string;
  /** The repository name */
  repo: string;
  /** The issue number (positive integer) */
  number: number;
};

/**
 * Union type representing any valid GitHub target.
 *
 * A GitHub target can be either a repository or an issue.
 * Use the `kind` discriminator field and type guards to determine the specific type.
 *
 * @example
 * ```typescript
 * function handleTarget(target: GitHubTarget) {
 *   if (target.kind === "repo") {
 *     console.log(`Repository: ${target.owner}/${target.repo}`);
 *   } else {
 *     console.log(`Issue #${target.number} in ${target.owner}/${target.repo}`);
 *   }
 * }
 * ```
 */
export type GitHubTarget = RepoTarget | IssueTarget;

/**
 * Type guard to check if an unknown value is a valid RepoTarget.
 *
 * Performs comprehensive validation including GitHub naming conventions
 * for owner and repository names.
 *
 * @param t - The value to check
 * @returns True if the value is a valid RepoTarget
 *
 * @example
 * ```typescript
 * const data: unknown = { kind: "repo", owner: "octocat", repo: "hello-world" };
 * if (isRepoTarget(data)) {
 *   // TypeScript now knows data is RepoTarget
 *   console.log(`Repo: ${data.owner}/${data.repo}`);
 * }
 * ```
 */
export const isRepoTarget = (t: unknown): t is RepoTarget => {
  if (typeof t !== "object" || t === null) {
    return false;
  }

  const obj = t as Record<string, unknown>;

  return (
    obj.kind === "repo" &&
    typeof obj.owner === "string" &&
    isValidOwnerName(obj.owner) &&
    typeof obj.repo === "string" &&
    isValidRepoName(obj.repo)
  );
};

/**
 * Type guard to check if an unknown value is a valid IssueTarget.
 *
 * Performs comprehensive validation including GitHub naming conventions
 * for owner and repository names, and validates that the issue number is a positive integer.
 *
 * @param t - The value to check
 * @returns True if the value is a valid IssueTarget
 *
 * @example
 * ```typescript
 * const data: unknown = { kind: "issue", owner: "octocat", repo: "hello-world", number: 42 };
 * if (isIssueTarget(data)) {
 *   // TypeScript now knows data is IssueTarget
 *   console.log(`Issue #${data.number} in ${data.owner}/${data.repo}`);
 * }
 * ```
 */
export const isIssueTarget = (t: unknown): t is IssueTarget => {
  if (typeof t !== "object" || t === null) {
    return false;
  }

  const obj = t as Record<string, unknown>;

  return (
    obj.kind === "issue" &&
    typeof obj.owner === "string" &&
    isValidOwnerName(obj.owner) &&
    typeof obj.repo === "string" &&
    isValidRepoName(obj.repo) &&
    typeof obj.number === "number" &&
    Number.isInteger(obj.number) &&
    obj.number > 0
  );
};

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

const GitHubLabelSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  url: z.string(),
  name: z.string(),
  color: z.string(),
  default: z.boolean(),
  description: z.string().nullable(),
});

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

const GitHubPullRequestRefSchema = z.object({
  url: z.string(),
  html_url: z.string(),
  diff_url: z.string(),
  patch_url: z.string(),
});

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

export type GitHubParseError = {
  type: "PARSE_ERROR";
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>;
};
