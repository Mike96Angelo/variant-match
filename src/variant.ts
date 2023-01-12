import { Func, UnionToIntersection, Exact } from "./util.types";

const kind_symbol = Symbol.for("[[variant::kind]]");
const values_symbol = Symbol.for("[[variant::values]]");

type Variant<K extends string, V extends any[] = []> = {
  readonly [kind_symbol]: K;
  readonly [values_symbol]: V;
};

type VariantBranch<V, R> = V extends Variant<any, infer A> ? Func<A, R> : never;

type InferVariant<
  V extends Variant<any, any[]> | Func<any[], Variant<any, any[]>>
> = V extends Func<any[], infer K extends Variant<any, any[]>>
  ? K
  : V extends Variant<any, any[]>
  ? V
  : never;

type ExcludeVariant<V, K> = V extends Variant<infer T, any[]>
  ? T extends K
    ? never
    : V
  : never;

type Matcher<V, R> = UnionToIntersection<
  V extends Variant<infer K, any> ? Record<K, VariantBranch<V, R>> : never
>;

type MatcherReturn<M> = M extends Record<string, Func<any[], infer R>>
  ? R
  : never;

interface Match {
  <V extends Variant<any, any[]>, M extends Matcher<V, any>>(
    variant: V,
    matcher: Exact<M, V[typeof kind_symbol]>
  ): MatcherReturn<M>;
  <V extends Variant<any, any[]>, M extends Partial<Matcher<V, any>>, R>(
    variant: V,
    matcher: Exact<M, V[typeof kind_symbol]>,
    catchAll: (variant: ExcludeVariant<V, keyof M>) => R
  ): MatcherReturn<M> | R;
}

const assertVariant = (v: any) => {
  const hasType = typeof v[kind_symbol] === "string";
  const hasValues = Array.isArray(v[values_symbol]);

  if (!hasType || !hasValues) {
    throw new TypeError(
      `Expected value is not of type Variant { ${kind_symbol.toString()}: string, ${values_symbol.toString()}: any[] }`
    );
  }
};

const defaultCatchAll = (variant: Variant<any, any[]>) => {
  throw new TypeError(
    `Unhandled variant ${JSON.stringify(variant[kind_symbol])}.`
  );
};

const match: Match = (
  variant: Variant<any, any[]>,
  matcher: Record<string, Func<any[], any>>,
  catchAll = defaultCatchAll as Func<any[], any>
) => {
  assertVariant(variant);

  const func = matcher[variant[kind_symbol]];

  if (func != null) {
    return func(...variant[values_symbol]);
  }

  return catchAll(variant);
};

const variant = <K extends string, V extends any[]>(
  kind: K,
  ...values: V
): Variant<K, V> =>
  Object.freeze({
    [kind_symbol]: kind,
    [values_symbol]: values,
  });

export {
  match,
  variant,
  kind_symbol,
  values_symbol,
  Variant,
  VariantBranch,
  InferVariant,
};
