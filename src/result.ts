import { InferVariant, match, variant, VariantBranch } from "./variant";

export const Ok = <T>(value: T) => variant("Ok", value);
export const Err = <T>(error: T) => variant("Err", error);
export type Ok<T> = InferVariant<typeof Ok<T>>;
export type Err<E = unknown> = InferVariant<typeof Err<E>>;
export type Result<T, E = unknown> = Ok<T> | Err<E>;

export const tryResult = <T, E = unknown>(func: () => T): Result<T, E> => {
  try {
    return Ok(func());
  } catch (e) {
    return Err(e as E);
  }
};

export const unwrap = <T>(value: Result<T, any>) =>
  match(value, {
    Ok(value) {
      return value;
    },
    Err(error) {
      throw error;
    },
  });

export const unwrapExpect = <T, E>(value: Result<T, any>, error: E) =>
  match(value, {
    Ok(value) {
      return value;
    },
    Err() {
      throw error;
    },
  });

export const unwrapOr = <T, E = unknown>(
  value: Result<T, any>,
  Err: VariantBranch<Err<E>, T>
) =>
  match(value, {
    Ok(value) {
      return value;
    },
    Err,
  });
