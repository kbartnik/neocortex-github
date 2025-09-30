import { describe, it, expect } from 'vitest';
import {validateIssueState} from '../../src/shared/gitHubValidation';

describe("validateIssueState", () => {
    it("should return `open` when state is 'open'", () => {
       const result = validateIssueState("open");
       expect (result).toBe("open");
    });

    it("should return 'closed' when state is 'closed'", () => {
        const result = validateIssueState("closed");
        expect (result).toBe("closed");
    });

    it("should throw error for invalid state without context", () => {
        expect(() => validateIssueState("banana")).toThrow(
            "Invalid issue state: 'banana'. Expected 'open' or 'closed'."
        );
    })

    it("should throw error for invalid state with context", () => {
        expect(() => validateIssueState('archived', {
            owner: "facebook",
            repo: "react",
            number: 12345
        })
        ).toThrow(
          "Invalid issue state: 'archived' for facebook/react#12345. Expected 'open' or 'closed'."
        );
    });
});