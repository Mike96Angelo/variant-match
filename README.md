# Variant Match

Brings variant match pattern to TypeScript.

### Table of Contents

- [What are Variants?](#what-are-variants)
- [What is a Match Expression?](#what-is-a-match-expression)
- [Getting Started](#getting-started)
## What are Variants?

Variants are a simple yet powerful way to represent a set of various states that can contain deferring data. Variants help you write code in a way where invalid states are not representable. Together when the match expression this can greatly reduce complexity and help improve readability of the code.

## What is a Match Expression?

A match expression takes in a variant object and named branches. Evaluating the match expression will execute the named branch that match the variant's kind. If a variant contains data that data is passed into the named branch that matches the variant's kind. The match expression returns that value returned by the named branch that was executed.

## Getting Started

```
$ npm install variant-match
```

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

```


  return Ok(integer);
};

const parseIntOrZero = (str: string) => {
  return match(parseInteger(str), {
    Ok(int) {
      return int;
    },
    Err() {
      return 0;
    },
  });
};

parseIntOrZero("123"); // 123
parseIntOrZero("abc"); // 0
```
