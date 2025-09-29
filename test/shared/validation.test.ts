import { describe, expect, it } from 'vitest';
import { isValidOwnerName } from "../../src/shared/validation";

describe("validation module", () => {
    it ("should validate a correct owner name", () => {
        const validOwner = "microsoft";

        const result = isValidOwnerName(validOwner);

        expect(result).toBe(true);
    });
});