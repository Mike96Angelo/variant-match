# Variant Match

### Table of Contents

- [variant(kind, ...values)](#variantkind-values)
- [VariantTypeClass](#varianttypeclass)
  - [.match(matcher)](#varianttypeclassmatchmatcher)
- [Included Variants](/docs/variant.md)
  - [Optional Variant](/docs/optional.md)
  - OptionalPair Variant (coming soon)
  - Result Variant (coming soon)

## What are Variants?

Variants are a simple yet powerful way to represent a set of various states that can contain deferring data. Variants help you write code in a way where invalid states are not representable. Together with the match expression this can greatly reduce complexity and help improve readability of the code.

## What is a Match Expression?

A match expression takes in a variant object and named branches. Evaluating the match expression will execute the named branch that match the variant's kind. If a variant contains data that data is passed into the named branch that matches the variant's kind. The match expression returns that value returned by the named branch that was executed.

**Example:**

```ts
import { Variant, variant, VariantTypeClass } from "variant-match";

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
  });

handleABC(A("string")); // 'A: string'
handleABC(B(123, true)); // 'B: 123 | true'
handleABC(C); // 'C'

const handleA = (abc: ABC) =>
  abc.match({
    A(a) {
      return `A: ${a}`;
    },

    // catch all
    _() {
      return "B or C";
    },
  });

handleA(A("string")); // 'A: string'
handleA(B(123, true)); // 'B or C'
handleA(C); // 'B or C'

```

### variant(kind, ...values)
Creates a instance of a variant with the givin kind and values.

**Returns**: An instance of a variant.  

| Param | Description |
| --- | --- |
| kind | A unique name, this name will be used as the named branch to execute in the match expression. |
| ...values | Any data that that will be stored in the variant, this data will be available as arguments within the named branch of a match expression. |

### VariantTypeClass
VariantTypeClass is an abstract class that can be extended to create variant types.

### VariantTypeClass.match(matcher)
Executes a named branch that matches the this variant.

**Kind**: method of [`VariantTypeClass`](#varianttypeclass)  
**Returns**:  The result of the named branch or catchAll (`_`) that was executed.  

| Param | Description |
| --- | --- |
| matcher | An object containing named branches for each variant kind. |
| matcher._ | An optional catch-all branch used if you don't need to handle all branches independently. |
