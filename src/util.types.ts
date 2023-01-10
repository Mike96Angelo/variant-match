export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? {
      [K in keyof I]: I[K];
    }
  : never;

export type Exact<T, K extends keyof T> = Exclude<keyof T, K> extends never
  ? T
  : Pick<T, K> & Record<Exclude<keyof T, K>, never> extends infer U
  ? {
      [K in keyof U]: U[K];
    }
  : never;

export type Func<Args extends any[], R> = ((...args: Args) => R) extends infer U
  ? U
  : never;
