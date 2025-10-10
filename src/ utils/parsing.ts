import { Result, ok, err } from "neverthrow";

export const parsePositiveInteger = (input: string): Result<number, string> => {
  const num = parseInt(input, 10);

  if (isNaN(num)) {
    return err("Not a valid number");
  }

  if (num < 0) {
    return err("Must be positive");
  }

  return ok(num);
};
