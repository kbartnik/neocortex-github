/**
 * Errors that can occur during IR transformation operations.
 *
 * These represent data validation failures while converting external
 * API responses into our internal IR format. These are operational
 * failures (bad data from external systems) not bugs in our code.
 */
export type TransformError = {
  type: "invalid_issue_state";
  state: string;
  owner: string;
  repo: string;
  number: number;
};
