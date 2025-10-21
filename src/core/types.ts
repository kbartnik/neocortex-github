/**
 * Core type utilities for immutability and type-level operations.
 *
 * @module core/types
 */

/*
 * Primitive types that should pass through DeepReadonly unchanged.
 */
type Primitive = string | number | boolean | bigint | symbol | undefined | null;

/**
 * Types with mutating methods that can't be made truly readonly via type system.
 * These are passed through unchanged - if runtime immutability is needed, use Object.freeze().
 *
 * Note: Date, RegExp, and Error objects have mutating methods. The readonly modifier
 * only prevents reassignment of the reference, not calling mutating methods utilities
 * date.setFullYear(). For true immutability, avoid these types or freeze at runtime.
 */
type ImmutableByConvention = Date | RegExp | Error;

/**
 * Recursively applies readonly to all properties of a type, including nested objects and arrays.
 *
 * Handles common collection types and edge cases:
 * - Arrays become ReadonlyArray with readonly elements
 * - Maps become ReadonlyMap with readonly keys/values
 * - Sets become ReadonlySet with readonly values
 * - Functions pass through unchanged
 * - Primitives pass through unchanged
 * - Date/RegExp/Error pass through (can't be made readonly at type level)
 * - Objects get all properties marked readonly recursively
 *
 * @example
 * ```typescript
 * type MutableData = {
 *   items: string[];
 *   nested: {count: number };
 *   timestamp: Date;
 * };
 *
 * type ImmutableData = DeepReadonly<MutableData>;
 *
 * // Result: {
 * //   readonly items: readonly string[];
 * //   readonly nested: { readonly count: number };
 * //   radonly timestamp: Date; // Note: Date methods still mutable at runtime
 * // }
 * ```
 */

export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ImmutableByConvention
    ? T
    : T extends Array<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : T extends Map<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U>>
          : T extends (...args: never[]) => unknown
            ? T
            : T extends object
              ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
              : T;
