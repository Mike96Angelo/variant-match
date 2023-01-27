# Variant Match

### Table of Contents

- [variant(kind, ...values)](#variantkind-values)
- [match(variant, matcher, catchAll)](#matchvariant-matcher-catchall)
- [Included Variants](/docs/variant.md)
  - [Optional Variant](/docs/optional.md)
  - [Result Variant](/docs/result.md)

Example:

```ts
import { variant, match, InferVariant } from "variant-match";

const A = (a: string) => variant("A", a);
const B = (b: number, bool: boolean) => variant("B", b, bool);
const C = variant("C");

type ABC = InferVariant<typeof A | typeof B | typeof C>;

const handleABCVariants = (value: ABC) =>
  match(value, {
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

handleABCVariants(A("test")); // 'A: test'
handleABCVariants(B(123, true)); // 'B: 123 | true'
handleABCVariants(C); // 'C'

const handleABCVariantsOnlyA = (value: ABC) =>
  match(
    value,
    {
      A(a) {
        return `A: ${a}`;
      },
    },
    (v) => "B or C"
    // v: B(number, boolean) | C
  );

handleABCVariantsOnlyA(A("test")); // 'A: test'
handleABCVariantsOnlyA(B(123, true)); // 'B or C'
handleABCVariantsOnlyA(C); // 'B or C'
```

### variant(kind, ...values)
Creates a instance of a variant with the givin kind and values.

**Returns**: An instance of a variant.  

| Param | Description |
| --- | --- |
| kind | A unique name, this name will be used as the named branch to execute in the match expression. |
| ...values | Any data that that will be stored in the variant, this data will be available as arguments within the named branch of a match expression. |

### match(variant, matcher, catchAll)
Executes a named branch that matches the variant passed in.

**Returns**: The result of the named branch or catchAll that was executed.  

| Param | Description |
| --- | --- |
| variant | A variant to match on. |
| matcher | An object containing named branches for each variant kind. |
| catchAll | An optional catch-all branch used if you don't need to handle all branches independently. |
