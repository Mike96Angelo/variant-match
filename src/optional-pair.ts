import { Optional, toOptional, None } from "./optional";
import { Func } from "./util.types";
import { Variant, variant, VariantTypeClass } from "./variant";

type OptionalPairVariants<A, B> =
  | Variant<"First", [first: A]>
  | Variant<"Second", [second: B]>
  | Variant<"Both", [first: A, second: B]>
  | Variant<"Neither">;

type OptionalPairType<A, B> = OptionalPair<NonNullable<A>, NonNullable<B>>;

class OptionalPair<A, B> extends VariantTypeClass<OptionalPairVariants<A, B>> {
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

  combineBoth<C>(combine: Func<[first: A, second: B], C>): Optional<C> {
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

const Neither = new OptionalPair<any, any>(variant("Neither"));

const First = <A, B>(
  first: Optional<A>
): OptionalPair<NonNullable<A>, NonNullable<B>> =>
  first.match({
    Some(value) {
      return new OptionalPair<NonNullable<A>, NonNullable<B>>(
        variant("First", value)
      );
    },
    None() {
      return Neither;
    },
  });

const Second = <A, B>(
  second: Optional<B>
): OptionalPair<NonNullable<A>, NonNullable<B>> =>
  second.match({
    Some(value) {
      return new OptionalPair<NonNullable<A>, NonNullable<B>>(
        variant("Second", value)
      );
    },
    None() {
      return Neither;
    },
  });

const Both = <A, B>(
  first: Optional<A>,
  second: Optional<B>
): OptionalPair<NonNullable<A>, NonNullable<B>> =>
  first.match({
    Some(first) {
      return second.match({
        Some(second) {
          return new OptionalPair<NonNullable<A>, NonNullable<B>>(
            variant("Both", first, second)
          );
        },
        None() {
          return new OptionalPair<NonNullable<A>, NonNullable<B>>(
            variant("First", first)
          );
        },
      });
    },
    None() {
      return second.match({
        Some(second) {
          return new OptionalPair<NonNullable<A>, NonNullable<B>>(
            variant("Second", second)
          );
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

export {
  type OptionalPairType as OptionalPair,
  Neither,
  First,
  Second,
  Both,
  toOptionalPair,
};
