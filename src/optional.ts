import { Func } from "./util.types";
import { InferVariant, match, variant, VariantBranch } from "./variant";

/**
 * Converts a nullable type into an Optional variant.
 * If the `value` is nullish it returns the None variant
 * otherwise it wraps the `value` in the Some variant.
 *
 * @param value - A nullable value.
 * @returns An Optional variant.
 */
export function Optional<T>(value: T): Optional<NonNullable<T>> {
  return value != null ? Optional.Some(value) : Optional.None;
}

export namespace Optional {
  export const Some = <T>(value: T) => variant("Some", value);
  export const None = variant("None");

  /**
   * Maps an `Optional<T>` to an `Optional<M>`.
   *
   * @param value - An `Optional<T>`
   * @param mapper - A function that maps T to M
   * @returns An `Optional<M>`
   */
  export const map = <T, M>(
    value: Optional<T>,
    mapper: (value: T) => M
  ): Optional<M> =>
    match(value, {
      Some(value) {
        return Some(mapper(value));
      },
      None() {
        return None;
      },
    });

  /**
   * If `value` is the Some variant it returns the value stored in it,
   * otherwise it returns the result of executing the `fallback` function.
   *
   * @param value - An Optional variant
   * @param fallback - A function to call if `value` is the None variant.
   * @returns The value stored in the Some variant or the result of calling `fallback`.
   */
  export const fallback = <T>(
    value: Optional<T>,
    fallback: VariantBranch<None, T>
  ): T =>
    match(value, {
      Some(value) {
        return value;
      },
      None: fallback,
    });

  /**
   * A higher-order function that wraps a function with
   * a nullable return signature and converts it to a
   * Optional return signature.
   *
   * @param func - A function with a nullable return signature
   * @returns A new function that calls `func` wrapping its
   *          return in an Optional.
   */
  export const returnOptional =
    <Args extends any[], R>(
      func: Func<Args, R>
    ): Func<Args, Optional<NonNullable<R>>> =>
    (...args) =>
      Optional(func(...args));
}

export const Some = Optional.Some;
export const None = Optional.None;
export type Some<T> = InferVariant<typeof Optional.Some<T>>;
export type None = InferVariant<typeof Optional.None>;
export type Optional<T> = Some<T> | None;
export type OptionalType<T> = T extends Optional<infer K> ? K : never;
