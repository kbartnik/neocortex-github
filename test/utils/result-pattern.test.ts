import { describe, it, expect } from 'vitest';
import { Result } from 'neverthrow';
import { parsePositiveInteger } from '../../src/github/parsing/utils';

describe("Result pattern basics", () => {
  it("should parse valid positive integers", () => {
    const result = parsePositiveInteger('42');

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(42);
  });

  it("should reject negative numbers", () => {
    const result = parsePositiveInteger("-5");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe("Must be positive");
  });

  it("should reject non-numeric string", () => {
    const result = parsePositiveInteger("foo");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe("Not a valid number");
  });
});
