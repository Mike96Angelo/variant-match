import { None, Optional, toOptional } from "./optional.js";
import {
  First,
  OptionalPair,
  Second,
  toOptionalPair,
} from "./optional-pair.js";
import { nonNullable, Func } from "./util.types.js";
import { Variant, variant, VariantTypeClass } from "./variant.js";

type ResultVariants<T extends nonNullable, E extends nonNullable> =
  | Variant<"Ok", [T]>
  | Variant<"Err", [E]>;
type ResultOk<T> = T extends Result<infer K, nonNullable> ? K : never;
type ResultErr<T> = T extends Result<nonNullable, infer K> ? K : never;

const combineErrsAsArray = <A extends nonNullable, B extends nonNullable>(
  errs: OptionalPair<A, B>
) =>
  errs.match({
    First(a) {
      return [a];
    },
    Second(a) {
      return [a];
    },
    Both(a, b) {
      return [a, b];
    },
    Neither() {
      return [];
    },
  });

class Result<
  T extends nonNullable = nonNullable,
  E extends nonNullable = nonNullable
> extends VariantTypeClass<ResultVariants<T, E>> {
  /**
   * Maps a `Result<T, E>` to a `Result<M, ME>`
   *
   * @param mapOk - A function that maps `T` to `M`
   * @param mapErr - A function that maps `E` to `ME`
   * @returns An `Result<M, E>`
   */
  map<M extends nonNullable>(mapOk: Func<[value: T], M>): Result<M, E>;
  map<M extends nonNullable, ME extends nonNullable>(
    mapOk: Func<[value: T], M>,
    mapErr: Func<[value: E], ME>
  ): Result<M, ME>;
  map(mapOk: Func<[value: T], any>, mapErr?: Func<[value: E], any>) {
    return this.match({
      Ok(value) {
        const result = mapOk(value);
        if (result instanceof Result) {
          return result;
        }

        return Ok(result);
      },
      Err(error) {
        return Err(mapErr ? mapErr(error) : error);
      },
    });
  }

  /**
   * If `value` is the Ok variant it returns the value stored in it,
   * otherwise it returns the result of executing the `fallback` function.
   *
   * @param fallback A function to call if `this` is the Err variant.
   * @returns The value stored in the Ok variant or the result of calling `fallback`.
   */
  fallback(fallback: Func<[error: E], T>): T {
    return this.match({
      Ok(value) {
        return value;
      },
      Err: fallback,
    });
  }

  /**
   * Combines this `Result<T, E>` with `Result<B, E>` to make `Result<C, CE>`.
   *
   * @param b - A `Result<B, BE>`
   * @param combineOk - A function that combines `T` and `B` into `C`
   * @param combineErr - A function that combines `E` and `BE` into `CE`
   * @returns `Result<C, CE>`
   */
  combine<B extends nonNullable, BE extends nonNullable, C extends nonNullable>(
    b: Result<B, BE>,
    combineOk: Func<[a: T, b: B], C>
  ): Result<C, (E | BE)[]>;
  combine<
    B extends nonNullable,
    BE extends nonNullable,
    C extends nonNullable,
    CE extends nonNullable
  >(
    b: Result<B, BE>,
    combineOk: Func<[a: T, b: B], C>,
    combineErr: Func<[errors: OptionalPair<E, BE>], CE>
  ): Result<C, CE>;
  combine(
    b: Result,
    combineOk: Func<[a: T, b: any], any>,
    combineErr: Func<[errors: OptionalPair<any, any>], any> = combineErrsAsArray
  ) {
    return this.match({
      Ok(a) {
        return b.match({
          Ok(b) {
            return Ok(combineOk(a, b));
          },
          Err(be) {
            return Err(combineErr(Second(toOptional(be))));
          },
        });
      },
      Err(ae) {
        return b.match({
          Ok() {
            return Err(combineErr(First(toOptional(ae))));
          },
          Err(be) {
            return Err(combineErr(toOptionalPair(ae, be)));
          },
        });
      },
    });
  }

  /**
   * Converts Ok variants to Err variants if the `filter` predicate results in false.
   *
   * If this variant is Err or the `filter` predicate results in false a new Err variant
   * will be constructed with the result of calling `error`. Otherwise the Ok variant is
   * returned.
   *
   * @param filter - A predicate to determine whether or not to return the Ok variant or
   *                 Err variant.
   * @param error - Used to create the Err variant.
   * @returns A new Result
   */
  filter<E extends nonNullable>(
    filter: Func<[value: T], boolean>,
    error: Func<[], E>
  ): Result<T, E> {
    return this.match({
      Ok(value) {
        return filter(value) ? Ok(value) : Err(error());
      },
      Err() {
        return Err(error());
      },
    });
  }

  /**
   * Converts this `Result<T, E>` into `Optional<T>`
   *
   * @returns `Optional<T>`
   */
  toOptional(): Optional<T> {
    return this.match({
      Ok(value) {
        return toOptional(value);
      },
      Err() {
        return None;
      },
    });
  }
}

/**
 * Ok variant representing the result was ok.
 *
 * @param value - A value to store in the Ok variant.
 * @returns An Ok variant
 */
function Ok<T extends nonNullable, E extends nonNullable>(value: T) {
  if (value == null) {
    throw new TypeError(
      "Ok variant of Result cannot be constructed with null or undefined"
    );
  }

  return new Result<T, E>(variant("Ok", value));
}

/**
 * Err variant representing the result was an error.
 *
 * @param error - A error to store in the Err variant.
 * @returns An Err variant
 */
function Err<T extends nonNullable, E extends nonNullable>(error: E) {
  if (error == null) {
    throw new TypeError(
      "Err variant of Result cannot be constructed with null or undefined"
    );
  }

  return new Result<T, E>(variant("Err", error));
}

/**
 * Converts a `err`, `value` pair into a Result variant. If `err` is not nullish it
 * returns the `err` wrapped in the Err variant. Otherwise it returns `value`
 * wrapped in the Ok variant.
 *
 * @param err - A value representing the err state.
 * @param value - A value representing the ok state.
 * @returns A Result.
 */
function toResult<T, E>(
  err: E,
  value: T
): Result<NonNullable<T>, NonNullable<E>>;
function toResult<T, E>(
  err: E,
  value: T
): Result<NonNullable<T>, NonNullable<E>>;
function toResult(err: any, value: any) {
  if (err != null) {
    return Err(err);
  }

  return Ok(value);
}

export { type Result, type ResultOk, type ResultErr, toResult, Ok, Err };
