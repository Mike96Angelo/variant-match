import {
  variant,
  match,
  // InferVariant,
  kind_symbol,
  values_symbol,
} from "./variant";

const A = (a: string) => variant("A", a);
const B = (b: number, bool: boolean) => variant("B", b, bool);
const C = variant("C");

// type ABC = InferVariant<typeof A | typeof B | typeof C>;

describe("match", () => {
  it("Throws if the passed in value is not a variant.", () => {
    expect(() => match(0 as any, {})).toThrow();
  });

  it("Throws if there is no specified branch or catch-all for the passed in variant.", () => {
    expect(() => match(C, {} as any)).toThrow();
  });

  it.each([A("test"), B(5, false), C])(
    "Calls the corresponding branch for the variant with the values stored in the variant.",
    (value) => {
      const mockBranches = {
        A: jest.fn(),
        B: jest.fn(),
        C: jest.fn(),
      };

      const catchAll = jest.fn();

      match(value, mockBranches, catchAll);

      const kind = value[kind_symbol];
      const values = value[values_symbol];
      Object.entries(mockBranches).forEach(([key, mockFunc]) => {
        kind === key
          ? expect(mockFunc).toHaveBeenCalledWith(...values)
          : expect(mockFunc).not.toBeCalled();
      });

      expect(catchAll).not.toBeCalled();
    }
  );

  it.each([A("test"), B(5, false), C])(
    "Returns the result of calling the corresponding branch for the variant.",
    (value) => {
      const result = match(value, {
        A() {
          return "A";
        },
        B() {
          return "B";
        },
        C() {
          return "C";
        },
      });

      expect(result).toBe(value[kind_symbol]);
    }
  );

  it.each([A("test"), B(5, false), C])(
    "Calls the catch-all with the variant if there is no specified branch for the variant.",
    (value) => {
      const mockBranches = {
        A: jest.fn(),
      };

      const catchAll = jest.fn();

      match(value, mockBranches, catchAll);

      const kind = value[kind_symbol];
      const values = value[values_symbol];

      if (kind === "A") {
        expect(mockBranches.A).toHaveBeenCalledWith(...values);
        expect(catchAll).not.toBeCalled();
      } else {
        expect(mockBranches.A).not.toBeCalled();
        expect(catchAll).toHaveBeenCalledWith(value);
      }
    }
  );

  it.each([A("test"), B(5, false), C])(
    "Returns the result of calling the catch-all with the variant if there is no specified branch for the variant.",
    (value) => {
      const result = match(
        value,
        {
          A() {
            return "A";
          },
        },
        () => "catch-all"
      );

      const kind = value[kind_symbol];

      if (kind === "A") {
        expect(result).toBe("A");
      } else {
        expect(result).toBe("catch-all");
      }
    }
  );
});
