import { Func } from "./util.types";
import { InferVariant, match, variant, VariantBranch } from "./variant";

/**
 * Converts a `err`, `value` pair into a Result variant. If `err` is not nullish it
 * returns the `err` wrapped in the Err variant. Otherwise it returns `value`
 * wrapped in the Ok variant.
 *
 * @param err - A value representing the err state.
 * @param value - A value representing the ok state.
 * @returns A Result.
 */
export function Result<T, E = unknown>(err: E, value: T): Result<T, E> {
  return err != null ? Result.Err(err) : Result.Ok(value);
}

export namespace Result {
  export const Ok = <T>(value: T) => variant("Ok", value);
  export const Err = <T>(error: T) => variant("Err", error);

  /**
   * Maps a `Result<T, E>` to a `Result<M, E>`
   *
   * @param value - An `Result<T, E>`
   * @param mapper - A function that maps `T` to `M`
   * @returns An `Result<M, E>`
   */
  export const map = <T, M, E = unknown>(
    result: Result<T, E>,
    mapper: Func<[value: T], M>
  ): Result<M, E> =>
    match(result, {
      Ok(result) {
        return Ok(mapper(result));
      },
      Err(error) {
        return Err(error);
      },
    });

  /**
   * If `value` is the Ok variant it returns the value stored in it,
   * otherwise it returns the result of executing the `fallback` function.
   *
   * @param value A Result variant
   * @param fallback A function to call if `value` is the Err variant.
   * @returns The value stored in the Ok variant or the result of calling `fallback`.
   */
  export const fallback = <T, E = unknown>(
    value: Result<T, any>,
    fallback: VariantBranch<Err<E>, T>
  ) =>
    match(value, {
      Ok(value) {
        return value;
      },
      Err: fallback,
    });

  /**
   * A higher-order function that wraps a function that throws
   * into a Result variant. If the `func` throws the new function
   * returns the Err variant, otherwise it wraps the return of
   * `func` in the Ok variant.
   *
   * @param func - A function that throws.
   * @returns A new function that calls `func` wrapping its
   *          return in a Result.
   */
  export const returnResult =
    <A extends any[], T, E = unknown>(
      func: Func<A, Exclude<T, Promise<any>>>
    ): Func<A, Result<T, E>> =>
    (...args: A) => {
      try {
        return Ok(func(...args));
      } catch (e) {
        return Err(e as E);
      }
    };

  /**
   * A higher-order function that wraps a function that returns a
   * Promise that may reject into a function that returns a
   * Promise of Result. If the Promise rejects the new function returns
   * the Promise of Err variant, otherwise it wraps the resolved value in
   * the Ok variant.
   *
   * @param func - A function that throws.
   * @returns A new function that calls `func` wrapping its
   *          returned Promise into a Promise of Result.
   */
  export const returnPromiseResult =
    <A extends any[], T, E = unknown>(
      func: Func<A, Promise<T>>
    ): Func<A, Promise<Result<T, E>>> =>
    (...args: A) =>
      func(...args).then(
        (value) => Ok(value),
        (reason) => Err(reason)
      );

  /**
   * Converts a function the receives a Result into a node.js style callback function
   * @param func - A function the receives a Result.
   * @returns A node.js style callback function
   */
  export const callback =
    <R, T, E = unknown>(
      func: Func<[value: Result<T, E>], R>
    ): Func<[err: E, value: T], R> =>
    (err, value) =>
      func(Result(err, value));
}

export const Ok = Result.Ok;
export const Err = Result.Err;

export type Ok<T> = InferVariant<typeof Ok<T>>;
export type Err<E = unknown> = InferVariant<typeof Err<E>>;
export type Result<T, E = unknown> = Ok<T> | Err<E>;
export type ResultOk<T> = T extends Result<infer K, any> ? K : never;
export type ResultErr<E> = E extends Result<any, infer K> ? K : never;
