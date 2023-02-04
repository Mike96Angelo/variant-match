import { Optional, toOptional, None as OptionalNone } from "./optional";
import { Func } from "./util.types";
import { Variant, variant, SumTypeClass } from "./variant";

type OptionalPairVariants<A, B> =
  | Variant<"First", [first: A]>
  | Variant<"Second", [second: B]>
  | Variant<"Both", [first: A, second: B]>
  | Variant<"None">;

class OptionalPair<A, B> extends SumTypeClass<OptionalPairVariants<A, B>> {
  first(): Optional<A> {
    return this.match({
      First(first) {
        return toOptional(first);
      },
      Both(first) {
        return toOptional(first);
      },
      _() {
        return OptionalNone;
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
        return OptionalNone;
      },
    });
  }

  both(): Optional<[first: A, second: B]> {
    return this.match({
      Both(first, second) {
        return toOptional([first, second]);
      },
      _() {
        return OptionalNone;
      },
    });
  }

  combineBoth<C>(combine: Func<[first: A, second: B], C>): Optional<C> {
    return this.match({
      Both(first, second) {
        return toOptional(combine(first, second));
      },
      _() {
        return OptionalNone;
      },
    });
  }
}

const None = new OptionalPair<any, any>(variant("None"));

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
      return None;
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
      return None;
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
          return None;
        },
      });
    },
  });

const toOptionalPair = <A, B>(
  first: A,
  second: B
): OptionalPair<NonNullable<A>, NonNullable<B>> =>
  Both(toOptional(first), toOptional(second));

export { type OptionalPair, None, First, Second, Both, toOptionalPair };
