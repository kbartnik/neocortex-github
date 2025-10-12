import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import type { TransformError } from "../ir/errors";

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
