import { Err, Ok, Result } from "./result.js";
import { nonNullable, Func } from "./util.types.js";
import { Variant, variant, VariantTypeClass } from "./variant.js";

type OptionalVariants<T extends nonNullable> =
  | Variant<"Some", [T]>
  | Variant<"None">;

type UnwrapOptional<T> = T extends Optional<infer K>
  ? K extends Optional
    ? UnwrapOptional<K>
    : K
  : T;

class Optional<T extends nonNullable = nonNullable> extends VariantTypeClass<
  OptionalVariants<T>
> {
  /**
   * Maps an `Optional<T>` to an `Optional<M>`.
   *
   * @param mapper - A function that maps `T` to `M`
   * @returns An `Optional<M>`
   */
  map<M extends Optional>(mapper: Func<[value: T], M>): M;
  map<M extends nonNullable>(mapper: Func<[value: T], M>): Optional<M>;
  map(mapper: Func<[any], any>) {
    return this.match({
      Some(value) {
        return toOptional(mapper(value));
      },
      None() {
        return None;
      },
    });
  }

  /**
   * If `value` is the Some variant it returns the value stored in it,
   * otherwise it returns the result of executing the `fallback` function.
   *
   * @param fallback - A function to call if `value` is the None variant.
   * @returns The value stored in the Some variant or the result of calling `fallback`.
   */
  fallback(fallback: Func<[], T>): T {
    return this.match({
      Some(value) {
        return value;
      },
      None() {
        return fallback();
      },
    });
  }

  /**
   * Combines this `Optional<T>` with `Optional<B>` to make `Optional<C>`.
   *
   * @param b - An `Optional<B>`
   * @param combiner - A function that combines `T` and `B` into `C`
   * @returns `Optional<C>`
   */
  combine<B extends nonNullable, C extends Optional>(
    b: Optional<B>,
    combiner: Func<[a: T, b: B], C>
  ): C;
  combine<B extends nonNullable, C extends nonNullable>(
    b: Optional<B>,
    combiner: Func<[a: T, b: B], C>
  ): Optional<C>;
  combine(b: Optional, combiner: Func<[any, any], any>) {
    return this.map((a) => b.map((b) => combiner(a, b)));
  }

  filter(filter: Func<[value: T], boolean>) {
    return this.map((value) => (filter(value) ? value : None));
  }

  /**
   * Converts this `Optional<T>` into `Result<T, E>`
   *
   * @param error - function to compute `E` if this Optional in the None variant.
   * @returns `Result<T, E>`
   */
  toResult<E extends nonNullable>(error: () => E): Result<T, E> {
    return this.match({
      Some(value) {
        return Ok<T, E>(value!);
      },
      None() {
        return Err<T, E>(error());
      },
    });
  }
}

/**
 * Some variant representing that their is some value.
 *
 * @param value - A value to store in the Some variant.
 * @returns An Some variant
 */
function Some<T extends Optional>(value: T): T;
function Some<T extends nonNullable>(value: T): Optional<T>;
function Some(value: nonNullable) {
  if (value == null) {
    throw new TypeError(
      "Some variant of Optional cannot be constructed with null or undefined"
    );
  }

  if (value instanceof Optional) {
    return value;
  }

  return new Optional(variant("Some", value));
}

/**
 * None variant representing that their is no value.
 */
const None = new Optional<never>(variant("None"));

/**
 * Converts a nullable type into an Optional variant.
 * If the `value` is nullish it returns the None variant
 * otherwise it wraps the `value` in the Some variant.
 *
 * @param value - A nullable value.
 * @returns An Optional variant.
 */
const toOptional = <T>(value: T): Optional<NonNullable<T>> =>
  value != null ? Some(value) : None;

/**
 * Converts a func of type `(A) => B` to a func of type `(Optional<a>) => Optional<B>`
 *
 * @param mapper - A mapping function `(A) => B`
 * @returns `(Optional<A>) => Optional<B>`
 */
function OptionalMapper<A extends nonNullable, B extends Optional>(
  mapper: Func<[value: A], B>
): Func<[a: Optional<A>], B>;
function OptionalMapper<A extends nonNullable, B extends nonNullable>(
  mapper: Func<[value: A], B>
): Func<[a: Optional<A>], Optional<B>>;
function OptionalMapper(
  mapper: Func<[any], any>
): Func<[value: Optional], Optional> {
  return (a) => a.map(mapper);
}

/**
 * Converts a func of type `(A, B) => C` to a func of type `(Optional<A>, Optional<B>) => Optional<C>`
 *
 * @param combiner - A combining function `(A, B) => C`
 * @returns `(Optional<A>, Optional<B>) => Optional<C>`
 */
function OptionalCombiner<
  A extends nonNullable,
  B extends nonNullable,
  C extends Optional
>(combiner: Func<[a: A, b: B], C>): Func<[a: Optional<A>, b: Optional<B>], C>;
function OptionalCombiner<
  A extends nonNullable,
  B extends nonNullable,
  C extends nonNullable
>(
  combiner: Func<[a: A, b: B], C>
): Func<[a: Optional<A>, b: Optional<B>], Optional<C>>;
function OptionalCombiner(
  combiner: Func<[any, any], any>
): Func<[a: Optional, b: Optional], Optional> {
  return (a, b) => a.combine(b, combiner);
}

export {
  type Optional,
  type UnwrapOptional,
  Some,
  None,
  toOptional,
  OptionalMapper,
  OptionalCombiner,
};
