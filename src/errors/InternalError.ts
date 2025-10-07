/**
 * Represents a violation of internal invariants - an impossible state
 * that indicates a bug in the program logic, not an operational failure.
 *
 * Following Rust's panic model: InternalError is for bugs and impossible
 * states that should crash immediately with diagnostic information.
 * Use Result types for expected operational failures that should be
 * handled gracefully.
 *
 * InternalError automatically captures:
 * - Timestamp (useful for correlating with logs after context switches)
 * - Stack trace (points to the actual throw site)
 * - Arbitrary context data for debugging
 *
 * These errors should never be caught and handled - they indicate the
 * program state is undefined and cannot safely continue.
 *
 * @example
 * ```typescript
 * // After checking array length, accessing index 0 cannot return undefined
 * if (args.length === 0) {
 *     return err({ type: "missing_argument", ... });
 * }
 * const url = args[0];
 * if (url === undefined) {
 *     // This violates JavaScript array semantics - crash with diagnostics
 *     throw new InternalError(
 *         "args[0] is undefined despite args.length > 0",
 *         { argsLength: args.length, args }
 *     );
 * }
 * ```
 */
export class InternalError extends Error {
    public readonly timestamp: Date;
    public readonly context: Record<string, unknown>;

    constructor(
        message: string,
        context: Record<string, unknown> = {}
    ) {
        super(`[INTERNAL] ${message}`);
        this.name = 'InternalError';
        this.timestamp = new Date();
        this.context = context;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InternalError);
        }
    }
}