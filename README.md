# Variant Match

[![GitHub release](https://img.shields.io/github/release/Mike96angelo/variant-match.svg?maxAge=21600)](https://github.com/Mike96Angelo/variant-match)
[![npm version](https://img.shields.io/npm/v/variant-match.svg?maxAge=21600)](https://www.npmjs.com/package/variant-match)
[![npm downloads](https://img.shields.io/npm/dm/variant-match.svg?maxAge=604800)](https://www.npmjs.com/package/variant-match)
[![npm downloads](https://img.shields.io/npm/dt/variant-match.svg?maxAge=604800)](https://www.npmjs.com/package/variant-match)

Brings variant match pattern to TypeScript.

### Table of Contents

- [Documentation](/docs/variant.md)
- [What are Variants?](#what-are-variants)
- [Getting Started](#getting-started)
- [Included Variant Type Classes](#included-variant-type-classes)
  - [Optional](#optional)
  - [Result](#result)

## What are Variants?

Variants are a simple yet powerful way to represent a set of various states that can contain deferring data. Variants help you write code in a way where invalid states are not representable. Variant types extend the `VariantTypeClass` that provides a `match` method used to operate on the different variants in the type class.

The `match` method takes in named branches. Executing the match method will execute the named branch that match the variant's kind. If a variant contains data that data is passed into the named branch that matches the variant's kind. The match method returns the value returned by the named branch that was executed.

## Getting Started

```
$ npm install variant-match
```

### Example:

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

## Included Variant Type Classes
Included with this library are two variant type classes: Optional and Result.

### Optional
This variant class has two variants: `Some<T>` and `None`. The `Some<T>` represents that there is some value of type `T`. The `None` represents that there is no value at all.

**Example:**
```ts
import { None, Some, Optional } from "variant-match";

const parseInteger = (value: string): Optional<number> => {
  const integer = parseInt(value, 10);

  if (!Number.isInteger(integer)) {
    return None;
  }

  return Some(integer);
};

const doubleStringNumberOrZero = (value: string) => 
  parseInteger(value)
    .map((n) => n * 2)
    .fallback(() => 0);

doubleStringNumberOrZero('2'); // 4
doubleStringNumberOrZero('string'); // 0
```

### Result
This variant class has two variants: `Ok<T>` and `Err<E>`. The `Ok<T>` represents that there is an ok value of type `T`. The `Err<E>` represents that there is an error of type `E`.

**Example:**
```ts
import { Err, Ok, Result } from "variant-match";

const parseInteger2 = (value: string): Result<number, TypeError> => {
  const integer = parseInt(value, 10);

  if (!Number.isInteger(integer)) {
    return Err(new TypeError('Could not parse value into integer.'));
  }

  return Ok(integer);
};

const doubleStringNumberOrZero2 = (value: string) =>
  parseInteger2(value)
    .map((n) => n * 2)
    .fallback(() => 0);

doubleStringNumberOrZero2("2"); // 4
doubleStringNumberOrZero2("string"); // 0
```
