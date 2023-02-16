import { Func } from "./util.types";

export type Pipe<T> = {
  pipe<R>(func: Func<[value: T], R>): Pipe<R>;
  value(): T;
};

export const Pipe = <T>(value: T): Pipe<T> => ({
  pipe(func) {
    return Pipe(func(value));
  },
  value() {
    return value;
  },
});
