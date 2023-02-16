import { Variant, variant, VariantTypeClass } from "./variant.js";

type ABCVariant =
  | Variant<"A", [a: string]>
  | Variant<"B", [b: number, bool: boolean]>
  | Variant<"C">;

class ABC extends VariantTypeClass<ABCVariant> {
  // add any useful methods for ABC variants
}

const A = (a: string) => new ABC(variant("A", a));
const B = (b: number, bool: boolean) => new ABC(variant("B", b, bool));
const C = new ABC(variant("C"));

export { A, B, C };

const handleABC = (abc: ABC) =>
  console.log(
    abc,
    abc.match({
      A(a) {
        return `A: ${a}`;
      },
      B(b, bool) {
        return `B: ${b} | ${bool}`;
      },
      C() {
        return "C";
      },
    })
  );

handleABC(A("string")); // 'A: string'
handleABC(B(123, true)); // 'B: 123 | true'
handleABC(C); // 'C'

const handleA = (abc: ABC) => {
  if (abc.variant.kind === "A") {
    abc.variant.values;
  }
  console.log(
    abc,
    abc.match<string | number | boolean>({
      A(a) {
        return `A: ${a}`;
      },

      // catch all
      _() {
        return "B or C";
      },
    })
  );
};

handleA(A("string")); // 'A: string'
handleA(B(123, true)); // 'B or C'
handleA(C); // 'B or C'
