# Variants.ts
Brings Rust style Variants and match statements to TypeScript
# Variant Match

Brings variant match pattern to TypeScript.

### Table of Contents

- [What are Variants?](#what-are-variants)
- [What is a Match Expression?](#what-is-a-match-expression)
- [Getting Started](#getting-started)
## What are Variants?

Variants are...

## What is a Match Expression?

Match expressions are...

## Getting Started

### Example:

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
```

