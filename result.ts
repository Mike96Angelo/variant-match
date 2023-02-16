import { None, Optional, toOptional } from "./optional.js";
import {
  First,
  OptionalPair,
  Second,
  toOptionalPair,
} from "./optional-pair.js";
import { Func } from "./util.types.js";
import { Variant, variant, VariantTypeClass } from "./variant.js";

type ResultVariants<T, E> = Variant<"Ok", [T]> | Variant<"Err", [E]>;
type ResultOk<T> = T extends Result<infer K, any> ? K : never;
type ResultErr<T> = T extends Result<any, infer K> ? K : never;

type ResultType<T, E> = Result<NonNullable<T>, NonNullable<E>>;

const combineErrsAsArray = <A, B>(errs: OptionalPair<A, B>) =>
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

class Result<T, E> extends VariantTypeClass<ResultVariants<T, E>> {
  /**
   * Maps a `Result<T, E>` to a `Result<M, ME>`
   *
   * @param mapOk - A function that maps `T` to `M`
   * @param mapErr - A function that maps `E` to `ME`
   * @returns An `Result<M, E>`
   */
  map<M>(mapOk: Func<[value: T], M>): ResultType<M, E>;
  map<M, ME>(
    mapOk: Func<[value: T], M>,
    mapErr: Func<[value: E], ME>
  ): ResultType<M, ME>;
  map(
    mapOk: Func<[value: T], any>,
    mapErr?: Func<[value: E], any>
  ): ResultType<any, any> {
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
  combine<B, BE, C>(
    b: Result<B, BE>,
    combineOk: Func<[a: T, b: B], C>
  ): ResultType<C, (E | BE)[]>;
  combine<B, BE, C, CE>(
    b: Result<B, BE>,
    combineOk: Func<[a: T, b: B], C>,
    combineErr: Func<[errors: OptionalPair<E, BE>], CE>
  ): ResultType<C, CE>;
  combine(
    b: Result<any, any>,
    combineOk: Func<[a: T, b: any], any>,
    combineErr: Func<[errors: OptionalPair<any, any>], any> = combineErrsAsArray
  ): ResultType<any, any> {
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

  filter<E>(
    filter: Func<[value: T], boolean>,
    error: Func<[], NonNullable<E>>
  ): ResultType<T, E> {
    return this.match({
      Ok(value) {
        return filter(value) ? Ok(value!) : Err(error());
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
  toOptional(): Optional<NonNullable<T>> {
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
function Ok<T, E>(value: NonNullable<T>) {
  if (value == null) {
    throw new TypeError(
      "Ok variant of Result cannot be constructed with null or undefined"
    );
  }

  return new Result<NonNullable<T>, NonNullable<E>>(variant("Ok", value));
}

/**
 * Err variant representing the result was an error.
 *
 * @param error - A error to store in the Err variant.
 * @returns An Err variant
 */
function Err<T, E>(error: NonNullable<E>) {
  if (error == null) {
    throw new TypeError(
      "Err variant of Result cannot be constructed with null or undefined"
    );
  }

  return new Result<NonNullable<T>, NonNullable<E>>(variant("Err", error));
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
function toResult<T, E>(err: E, value: T): ResultType<T, E>;
function toResult<T, E>(err: E, value: T): ResultType<T, E>;
function toResult(err: any, value: any): ResultType<any, any> {
  if (err != null) {
    return Err(err);
  }

  return Ok(value);
}

export { type ResultType as Result, ResultOk, ResultErr, toResult, Ok, Err };