# Optional Variant

The Optional variant is a way to represent a value that is optional meaning the it there is either a value or nothing.

### Table of Contents

- [Variant Match](/docs/variant.md)
- [Optional(value)](#optionalvalue)
  - [.Some(value)](#somevalue)
  - [.None](#none)
  - [.map(value, mapper)](#optionalmapvalue-mapper)
  - [.fallback(value, fallback)](#optionalfallbackvalue-fallback)
  - [.returnOptional(func)](#optionalreturnoptionalfunc)

Example:

```ts
import { match } from "variant-match";
import { Optional, Some, None } from "variant-match/optional";

const handleOptionalString = (str: Optional<string>) => {
  return match(str, {
    Some(str) {
      return str;
    },
    None() {
      return "default string";
    },
  });
};

handleOptionalString(Some("test")); // 'test'
handleOptionalString(None); // 'default string'
```

## Optional(value)
Converts a nullable type into an Optional variant.
If the `value` is nullish it returns the None variant
otherwise it wraps the `value` in the Some variant.

**Returns**: An Optional variant.

| Param | Description |
| --- | --- |
| value | A nullable value. |

**Example:**
```ts
Optional(9); // Some(9)
Optional(null); // None
Optional(undefined); // None
```

### Some(value)
Returns a variant that represents some value. This variant stores one value.

**Kind**: static method of [`Optional`](#optionalvalue)  
**Returns**: A `Some<T>` variant
| Param | Description |
| --- | --- |
| value | A value of type `T` to store in a `Some<T>` variant |

**Example:**
```ts
const value = Optional.Some('string');
// or
const value = Some('string');
```

### None
A variant that represents no value.

**Kind**: static property of [`Optional`](#optionalvalue)  

**Example:**
```ts
const value = Optional.None;
// or
const value = None;
```

### Optional.map(value, mapper)
Maps an `Optional<T>` to an `Optional<M>`.

**Kind**: static method of [`Optional`](#optionalvalue)  
**Returns**: An `Optional<M>`  

| Param | Description |
| --- | --- |
| value | An `Optional<T>` |
| mapper | A function that maps `T` to `M` |

**Example:**
```ts
Optional.map(Some(9), (num) => num.toString()); // Some("9")
Optional.map(None, (num) => num.toString()); // None
```

### Optional.fallback(value, fallback)
If `value` is the Some variant it returns the value stored in it,
otherwise it returns the result of executing the `fallback` function.

**Kind**: static method of [`Optional`](#optionalvalue)  
**Returns**: The value stored in the Some variant or the result of calling `fallback`.  

| Param | Description |
| --- | --- |
| value | An Optional variant |
| fallback | A function to call if `value` is the None variant. |

**Example:**
```ts
Optional.fallback(Some(4), () => 0); // 4
Optional.fallback(None, () => 0); // 0
```

### Optional.returnOptional(func)
A higher-order function that wraps a function with
a nullable return signature and converts it to a
Optional return signature.

**Kind**: static method of [`Optional`](#optionalvalue)  
**Returns**: A new function that calls `func` wrapping its
         return in an Optional.  

| Param | Description |
| --- | --- |
| func | A function with a nullable return signature |

**Example:**
```ts
function sometimesNull() {
  if (Math.random() > 0.5) {
    return 'value';
  }

  return null;
}

const sometimes = Optional.returnOptional(sometimesNull);
//    ^? () => Optional<string>
```
