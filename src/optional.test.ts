import {
  None,
  OptionalCombiner,
  OptionalMapper,
  Some,
  toOptional,
} from "./optional";
import { Err, Ok } from "./result";

describe("Some", () => {
  it.each([undefined, null])(
    "Throws when a nullish value is passed to it.",
    (value) => {
      expect(() => Some(value!)).toThrow();
    }
  );

  it.each(["undefined", 9])(
    "Returns the Some variant of Optional when a non-nullish value is passed to it.",
    (value) => {
      expect(Some(value!)).toEqual({
        variant: { kind: "Some", values: [value] },
      });
    }
  );
});

describe("toOptional", () => {
  it.each([undefined, null])(
    "Returns the None variant of Optional when a nullish value is passed to it.",
    (value) => {
      expect(toOptional(value)).toBe(None);
    }
  );

  it.each(["undefined", 9])(
    "Returns the Some variant of Optional when a non-nullish value is passed to it.",
    (value) => {
      expect(toOptional(value)).toEqual({
        variant: { kind: "Some", values: [value] },
      });
    }
  );
});

describe("Optional", () => {
  describe(".map", () => {
    it.each([1, 2, 3, 4, 5])(
      "Calls the passed in mapper func with the stored value when called on the Some variant.",
      (value) => {
        const mockMapper = jest.fn();

        Some(value).map(mockMapper);

        expect(mockMapper).toBeCalledWith(value);
        expect(mockMapper).toBeCalledTimes(1);
      }
    );

    it("Does not call the passed in mapper func when called on the None variant.", () => {
      const mockMapper = jest.fn();

      None.map(mockMapper);

      expect(mockMapper).toBeCalledTimes(0);
    });

    it("Returns None when called on the None variant.", () => {
      expect(None.map(() => 0)).toBe(None);
    });

    it("Returns None when mapper returns a nullish value.", () => {
      expect(Some(0).map(() => undefined)).toBe(None);
      expect(Some(0).map(() => null)).toBe(None);
    });

    it.each([Some(1), Some(2), None])(
      "Returns the Optional returned by mapper when mapper returns an Optional.",
      (value) => {
        expect(Some(0).map(() => value)).toBe(value);
      }
    );
    it.each([1, 2, 3, 4, 5])(
      "Returns a new Optional wrapping the value returned by mapper.",
      (value) => {
        expect(Some(0).map(() => value)).toEqual({
          variant: { kind: "Some", values: [value] },
        });
      }
    );
  });

  describe(".combine", () => {
    it("Calls the passed in combiner func with the stored values when a Some variants in passed in while called on a Some variant", () => {
      const mockCombiner = jest.fn();

      Some("a").combine(Some("b"), mockCombiner);

      expect(mockCombiner).toBeCalledWith("a", "b");
      expect(mockCombiner).toBeCalledTimes(1);
    });

    it("Does not Call the passed in combiner func when a None variants in passed in while called on a Some variant", () => {
      const mockCombiner = jest.fn();

      Some("a").combine(None, mockCombiner);

      expect(mockCombiner).toBeCalledTimes(0);
    });

    it("Does not Call the passed in combiner func when called on a Some variant", () => {
      const mockCombiner = jest.fn();

      Some("a").combine(None, mockCombiner);

      expect(mockCombiner).toBeCalledTimes(0);
    });

    it("Returns the value returned by combiner func when a Some variants in passed in while called on a Some variant", () => {
      const value = Some("a").combine(Some("b"), (a, b) => a + b);

      expect(value).toEqual({
        variant: { kind: "Some", values: ["ab"] },
      });
    });

    it("Does not Call the passed in combiner func when a None variants in passed in while called on a Some variant", () => {
      const value = Some("a").combine(None, (a, b) => a + b);

      expect(value).toBe(None);
    });

    it("Does not Call the passed in combiner func when called on a Some variant", () => {
      const value = None.combine(Some("b"), (a, b) => a + b);

      expect(value).toBe(None);
    });
  });

  describe(".fallback", () => {
    it("Calls the passed in fallback func when called on the None variant.", () => {
      const mockFallback = jest.fn();

      None.fallback(mockFallback);

      expect(mockFallback).toBeCalledWith();
      expect(mockFallback).toBeCalledTimes(1);
    });

    it("Does not call the passed in fallback func when called on the Some variant.", () => {
      const mockFallback = jest.fn();

      Some(0).fallback(mockFallback);

      expect(mockFallback).toBeCalledTimes(0);
    });

    it("Returns the stored value when called on the Some variant", () => {
      expect(Some<number>(9).fallback(() => 0)).toBe(9);
    });

    it("Returns the value returned by fallback when called on the None variant", () => {
      expect(None.fallback(() => 0)).toBe(0);
    });
  });

  describe(".toResult", () => {
    it("Calls the passed in error func when called on the None variant.", () => {
      const mockError = jest.fn(() => new Error("some error"));

      None.toResult(mockError);

      expect(mockError).toBeCalledWith();
      expect(mockError).toBeCalledTimes(1);
    });

    it("Does not call the passed in error func when called on the Some variant.", () => {
      const mockError = jest.fn(() => new Error("some error"));

      Some(0).toResult(mockError);

      expect(mockError).toBeCalledTimes(0);
    });

    it("Returns the stored value wrapped in the Ok variant of Result when called on the Some variant", () => {
      expect(Some(9).toResult(() => "Some Error")).toEqual(Ok(9));
    });

    it("Returns the value returned by fallback when called on the None variant", () => {
      expect(None.toResult(() => "Some Error")).toEqual(Err("Some Error"));
    });
  });
});

describe("OptionalMapper", () => {
  it("Calls the mapper func when it is called with a Some variants.", () => {
    const mockMapper = jest.fn();

    OptionalMapper(mockMapper)(Some(0));

    expect(mockMapper).toBeCalledWith(0);
    expect(mockMapper).toBeCalledTimes(1);
  });

  it("Does not call the mapper func when it is called with a None variants.", () => {
    const mockMapper = jest.fn();

    OptionalMapper(mockMapper)(None);

    expect(mockMapper).toBeCalledTimes(0);
  });
});

describe("OptionalCombiner", () => {
  it("Calls the mapper func when it is called with both parameters as Some variants.", () => {
    const mockCombiner = jest.fn((a: number, b: number) => a + b);

    OptionalCombiner(mockCombiner)(Some(2), Some(3));

    expect(mockCombiner).toBeCalledWith(2, 3);
    expect(mockCombiner).toBeCalledTimes(1);
  });

  it.each([
    [None, None],
    [None, Some(0)],
    [Some(0), None],
  ])(
    "Does not call the mapper func when it is called with either or both parameters as None variants.",
    (o1, o2) => {
      const mockCombiner = jest.fn();

      OptionalCombiner(mockCombiner)(o1, o2);

      expect(mockCombiner).toBeCalledTimes(0);
    }
  );
});
