import { Func } from "./util.types";
import { InferVariant, match, variant, VariantBranch } from "./variant";

export const Some = <T>(value: T) => variant("Some", value);
export const None = variant("None");
export type Some<T> = InferVariant<typeof Some<T>>;
export type None = InferVariant<typeof None>;
export type Optional<T> = Some<T> | None;
export type OptionalType<T> = T extends Optional<infer K> ? K : never;

export const Optional = <T>(value: T): Optional<NonNullable<T>> =>
  value != null ? Some(value) : None;

export const toOptional =
  <Args extends any[], R>(
    func: Func<Args, R>
  ): Func<Args, Optional<NonNullable<R>>> =>
  (...args) =>
    Optional(func(...args));

export const unwrap = <T>(value: Optional<T>) =>
  match(value, {
    Some(value) {
      return value;
    },
    None() {
      throw new TypeError("Cannot unwrap variant None");
    },
  });

export const unwrapExpect = <T, E>(value: Optional<T>, error: E) =>
  match(value, {
    Some(value) {
      return value;
    },
    None() {
      throw error;
    },
  });

export const unwrapOr = <T>(value: Optional<T>, None: VariantBranch<None, T>) =>
  match(value, {
    Some(value) {
      return value;
    },
    None,
  });
