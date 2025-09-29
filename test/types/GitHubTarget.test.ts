import { describe, expect, it } from "vitest";
import {isIssueTarget, isRepoTarget} from "../../src";
import type {GitHubTarget} from "../../src";

describe("GitHubTarget type guards", () => {
    it("should identify repo targets correctly", () => {
        const repoTarget: GitHubTarget = { kind: "repo", owner: "microsoft", repo: "typescript" };

        const result = isRepoTarget(repoTarget);

        expect(result).toBe(true);
    });

    it("should reject issue targets as repo targets", () => {
        const issueTarget: GitHubTarget = { kind: "issue", owner: "microsoft", repo: "typescript", number: 42 };

        const result = isRepoTarget(issueTarget);

        expect(result).toBe(false);
    })

    it("should identify issue targets correctly", () => {
        const issueTarget: GitHubTarget = { kind: "issue", owner: "microsoft", repo: "typescript", number: 42 };

        const result = isIssueTarget(issueTarget);
        expect(result).toBe(true);
    })

    it("should reject repo targets as issue targets", () => {
        const repoTarget: GitHubTarget = { kind: "repo", owner: "microsoft", repo: "typescript" };

        const result = isIssueTarget(repoTarget);

        expect(result).toBe(false);
    });

    it("should reject invalid repo objects", () => {
        const invalidInput = { kind: "repo" };

        const result = isRepoTarget(invalidInput);

        expect(result).toBe(false);
    });

    it ("should reject invalid issue objects", () => {
        const invalidInput = { kind: "issue", "owner": "microsoft" };

        const result = isIssueTarget(invalidInput);

        expect(result).toBe(false);
    });

    it("should reject issue with invalid number", () => {
        const invalidInput = { kind: "issue", owner: "microsoft", repo: "typescript", number: -1 };

        const result = isIssueTarget(invalidInput);

        expect(result).toBe(false);
    })
})