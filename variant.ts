import { Func, UnionToIntersection, Exact } from "./util.types.js";

type Variant<K extends string, V extends any[] = []> = {
  readonly kind: K;
  readonly values: Readonly<V>;
};

type VariantBranch<V, R> = V extends Variant<any, infer A> ? Func<A, R> : never;

type Matcher<V, R> = UnionToIntersection<
  V extends Variant<infer K, any> ? Record<K, VariantBranch<V, R>> : never
>;

const assertVariant = (v: any) => {
  const hasType = typeof v?.kind === "string";
  const hasValues = Array.isArray(v?.values);

  if (!hasType || !hasValues) {
    throw new TypeError(
      `Expected value is not of type Variant { kind: string, values: any[] }`
    );
  }
};

/**
 * Creates a instance of a variant with the givin kind and values.
 *
 * @param kind - A unique name, this name will be used as the named branch to
 *               execute in the match expression.
 * @param values - Any data that that will be stored in the variant, this data
 *                 will be available as arguments within the named branch of a
 *                 match expression.
 * @returns An instance of a variant.
 */
const variant = <K extends string, V extends any[]>(
  kind: Exclude<K, "_">,
  ...values: V
): Variant<Exclude<K, "_">, V> => {
  if (kind === "_") {
    throw new TypeError(`variants cannot be constructed with a kind of '_'`);
  }

  return Object.freeze({
    kind,
    values,
  });
};

/**
 * VariantTypeClass is an abstract class used to define sum type classes which contain variants.
 */
abstract class VariantTypeClass<V extends Variant<any, any[]>> {
  readonly variant: V;

  constructor(variant: V) {
    assertVariant(variant);
    this.variant = { ...variant, values: [...variant.values] };

    Object.freeze(this.variant.values);
    Object.freeze(this.variant);
    Object.freeze(this);
  }

  /**
   * Executes a named branch that matches the variant passed in.
   *
   * @param matcher - An object containing named branches for each variant kind.
   * @param catchAll - An optional catch-all branch used if you don't need to handle
   *                   all branches independently.
   * @returns The result of the named branch or catchAll that was executed.
   */
  match<R>(matcher: Exact<Matcher<V, R>, V["kind"]>): R;
  match<R>(
    matcher: Exact<
      Partial<Matcher<V, R>> & Record<"_", Func<[this], R>>,
      V["kind"] | "_"
    >
  ): R;
  match(matcher: any) {
    const func = matcher[this.variant.kind] ?? matcher._;

    if (func == null) {
      throw new TypeError(
        `Unhandled variant ${JSON.stringify(this.variant.kind)}.`
      );
    }

    return func(...this.variant.values);
  }
}

export { variant, Variant, VariantTypeClass, VariantBranch };
