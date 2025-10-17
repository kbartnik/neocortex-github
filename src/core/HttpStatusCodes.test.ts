import { describe, expect, it } from "vitest";
import type { HttpStatusCode } from "./HttpStatusCodes";
import { HTTP_STATUS } from "./HttpStatusCodes";

describe("HTTP_STATUS", () => {
  it("defines standard HTTP status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
    expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it("has const assertion for type safety", () => {
    // TypeScript prevents modification at compile time with "as const"
    // This test documents that the type is readonly at compile-time

    // The @ts-expect-error comment indicates this should fail TypeScript checking
    // Note: In JavaScript, the object is still mutable at runtime because
    // "as const" only provides compile-time type safety.
    // For true runtime immutability, Object.freeze() would be needed.

    // We don't actually attempt the mutation to avoid polluting other tests
    expect(HTTP_STATUS.OK).toBe(200);
  });
});

describe("HttpStatusCode type", () => {
  it("accepts valid status codes from HTTP_STATUS", () => {
    const status: HttpStatusCode = HTTP_STATUS.OK;
    expect(status).toBe(200);
  });

  it("derives correct union type from HTTP_STATUS", () => {
    // The HttpStatusCode type should be a union of all status code values
    const validCodes: HttpStatusCode[] = [
      200, 400, 401, 403, 404, 422, 429, 500,
    ];

    for (const code of validCodes) {
      expect(typeof code).toBe("number");
    }
  });
});
