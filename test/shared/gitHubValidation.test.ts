import { describe, it, expect } from 'vitest';
import { validateIssueState } from '../../src/shared/gitHubValidation';

describe("validateIssueState (Result-returning)", () => {

    it("should return Ok('open') when state is 'open'", () => {
    const result = validateIssueState('open', {
      owner: "facebook",
      repo: "react",
      number: 123
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe("open");
    }
  });

    it("should return Ok('closed') when state is 'closed'", () => {
       const result = validateIssueState('closed', {
       owner: "facebook",
       repo: "react",
       number: 123
       });

       expect(result.isOk()).toBe(true);
       if (result.isOk()) {
           expect(result.value).toBe("closed");
       }
    });

    it("should return Err for invalid state without context", () => {
      const result = validateIssueState("banana", {
        owner: "facebook",
        repo: "react",
        number: 123
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual({
          type: "invalid_issue_state",
          state: "banana",
          owner: "facebook",
          repo: "react",
          number: 123
        });
      }
  })

    it("should return Err for empty state with context", () => {
        const result = validateIssueState("", {
            owner: "facebook",
            repo: "react",
            number: 123
        });

        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error).toEqual({
                type: "invalid_issue_state",
                state: "",
                owner: "facebook",
                repo: "react",
                number: 123
            });
        }
    });
});
