import { Optional, toOptional, None } from "./optional.js";
import { Func, nonNullable } from "./util.types.js";
import { Variant, variant, VariantTypeClass } from "./variant.js";

type OptionalPairVariants<A extends nonNullable, B extends nonNullable> =
  | Variant<"First", [first: A]>
  | Variant<"Second", [second: B]>
  | Variant<"Both", [first: A, second: B]>
  | Variant<"Neither">;

class OptionalPair<
  A extends nonNullable,
  B extends nonNullable
> extends VariantTypeClass<OptionalPairVariants<A, B>> {
  first(): Optional<A> {
    return this.match({
      First(first) {
        return toOptional(first);
      },
      Both(first) {
        return toOptional(first);
      },
      _() {
        return None;
      },
    });
  }

  second(): Optional<B> {
    return this.match({
      Second(value) {
        return toOptional(value);
      },
      Both(_, second) {
        return toOptional(second);
      },
      _() {
        return None;
      },
    });
  }

  both(): Optional<[first: A, second: B]> {
    return this.match({
      Both(first, second) {
        return toOptional([first, second]);
      },
      _() {
        return None;
      },
    });
  }

  combineBoth<C extends nonNullable>(
    combine: Func<[first: A, second: B], C>
  ): Optional<C> {
    return this.match({
      Both(first, second) {
        return toOptional(combine(first, second));
      },
      _() {
        return None;
      },
    });
  }
}

const Neither = new OptionalPair<never, never>(variant("Neither"));

const First = <A extends nonNullable, B extends nonNullable>(
  first: Optional<A>
): OptionalPair<A, B> =>
  first.match({
    Some(value) {
      return new OptionalPair<A, B>(variant("First", value));
    },
    None() {
      return Neither;
    },
  });

const Second = <A extends nonNullable, B extends nonNullable>(
  second: Optional<B>
): OptionalPair<A, B> =>
  second.match({
    Some(value) {
      return new OptionalPair<A, B>(variant("Second", value));
    },
    None() {
      return Neither;
    },
  });

const Both = <A extends nonNullable, B extends nonNullable>(
  first: Optional<A>,
  second: Optional<B>
): OptionalPair<A, B> =>
  first.match({
    Some(first) {
      return second.match({
        Some(second) {
          return new OptionalPair<A, B>(variant("Both", first, second));
        },
        None() {
          return new OptionalPair<A, B>(variant("First", first));
        },
      });
    },
    None() {
      return second.match({
        Some(second) {
          return new OptionalPair<A, B>(variant("Second", second));
        },
        None() {
          return Neither;
        },
      });
    },
  });

const toOptionalPair = <A, B>(
  first: A,
  second: B
): OptionalPair<NonNullable<A>, NonNullable<B>> =>
  Both(toOptional(first), toOptional(second));

export { type OptionalPair, Neither, First, Second, Both, toOptionalPair };
