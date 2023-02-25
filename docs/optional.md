# Optional Variant

The Optional variant is a way to represent a value that is optional meaning the it there is either a value or nothing.

### Table of Contents

- [Variant Match](/docs/variant.md)
- [toOptional(value)](#tooptionalvalue)
- [Some(value)](#somevalue)
- [None](#none)
- [Optional](#optional)
  - [.map(mapper)](#optionalmapmapper)
  - [.combine(value, mapper)](#optionalcombinevalue-mapper)
  - [.filter(filter)](#optionalfilterfilter)
  - [.fallback(fallback)](#optionalfallbackfallback)
  - [.toResult(error)](#optionaltoresulterror)

Example:

```ts
import { Optional, Some, None } from "variant-match";

const handleOptionalString = (str: Optional<string>) => {
  return str.match({
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

## toOptional(value)
Converts a nullable type into an Optional variant.
If the `value` is nullish it returns the None variant
otherwise it wraps the `value` in the Some variant.

**Returns**: An Optional variant.

| Param | Description |
| --- | --- |
| value | A nullable value. |

**Example:**
```ts
toOptional(9); // Some(9)
toOptional(null); // None
toOptional(undefined); // None
```

### Some(value)
Returns a variant that represents some value. This variant stores one value.


**Returns**: A `Some<T>` variant
| Param | Description |
| --- | --- |
| value | A value of type `T` to store in a `Some<T>` variant |

**Example:**
```ts
const value = Some('string');
```

### None
A variant that represents no value.


**Example:**
```ts
const value = None;
```

## Optional
Both Some(T) and None are instances of Optional. Optional extends the VariantTypeClass which provides the match method. Optional add additional methods that make working with Optional more connivent.

### Optional.map(mapper)
Maps this `Optional<T>` to an `Optional<M>`.

**Kind**: method of [`Optional`](#optionalvalue)  
**Returns**: An `Optional<M>`  

| Param | Description |
| --- | --- |
| mapper | A function that maps `T` to `M` |

**Example:**
```ts
Some(9).map((num) => num.toString()); // Some("9")
None.map((num) => num.toString()); // None
```

### Optional.combine(value, mapper)
Combines this `Optional<T>` with `Optional<B>` to make `Optional<C>`.

**Kind**: method of [`Optional`](#optionalvalue)  
**Returns**: An `Optional<C>`  

| Param | Description |
| --- | --- |
| value | An `Optional<B>` |
| combiner | A function that combines `T` and `B` into `C` |

**Example:**
```ts
Some(9).combine(Some(1), (a, b) => a + b); // Some(10)
Some(9).combine(None, (a, b) => a + b); // None
None.combine(Some(1), (a, b) => a + b); // None
None.combine(None, (a, b) => a + b); // None
```

### Optional.filter(filter)
Converts Some variants to None variants if the filter predicate results in false.
   
If this variant is None or the `filter` predicate results in false the None variant is returned. Otherwise the Some variant is returned.

**Kind**: method of [`Optional`](#optionalvalue)  
**Returns**: An `Optional<T>`  

| Param | Description |
| --- | --- |
| filter | A predicate to determine whether or not to return the Some variant or None variant. |

**Example:**
```ts
Some(10).filter((x) => x % 2 === 0); // Some(10)
Some(11).filter((x) => x % 2 === 0); // None
None.filter((x) => x % 2 === 0); // None
```

### Optional.fallback(fallback)
If this Optional is the Some variant it returns the value stored in it,
otherwise it returns the result of executing the `fallback` function.

**Kind**: method of [`Optional`](#optionalvalue)  
**Returns**: The value stored in the Some variant or the result of calling `fallback`.  

| Param | Description |
| --- | --- |
| fallback | A function to call if `value` is the None variant. |

**Example:**
```ts
Some(4).fallback(() => 0); // 4
None.fallback(() => 0); // 0
```

### Optional.toResult(error)
If this Optional is the Some variant it returns the value stored in it wrapped in Ok,
otherwise it returns the result of executing the `error` function wrapped in Err.

**Kind**: method of [`Optional`](#optionalvalue)  
**Returns**: A `Result<T, E>`.  

| Param | Description |
| --- | --- |
| error | A function to call if this is the None variant to compute the error. |

**Example:**
```ts
Some(4).toResult(() => new Error('Missing value')); // Ok(4)
None.toResult(() => new Error('Missing value')); // Err(Error('Missing value'))
```
