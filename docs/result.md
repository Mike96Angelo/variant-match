# Result Variant

The Result variant is a way to represent a value that is optional meaning the it there is either a value or nothing.

### Table of Contents

- [Variant Match](/docs/variant.md)
- [Result(err, value)](#resulterr-value)
  - [.Ok(value)](#okvalue)
  - [.Err(error)](#errerror)
  - [.map(value, mapper)](#resultmapvalue-mapper)
  - [.fallback(value, fallback)](#resultfallbackvalue-fallback)
  - [.returnResult(func)](#resultreturnresultfunc)
  - [.returnPromiseResult(func)](#resultreturnpromiseresultfunc)
  - [.callback(func)](#resultcallbackfunc)

Example:

```ts
import { match } from "variant-match";
import { Result, Ok, Err } from "variant-match/result";

const parseInteger = (value: string): Result<number, Error> => {
  const integer = parseInt(value, 10);

  if (!Number.isInteger(integer)) {
    return Err(new Error("Parsed value is not an integer"));
  }

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

### Result(err, value)
Converts a `err`, `value` pair into a Result variant. If `err` is not nullish it
returns the `err` wrapped in the Err variant. Otherwise it returns `value`
wrapped in the Ok variant.

**Returns**: A Result.  

| Param | Description |
| --- | --- |
| err | A value representing the err state. |
| value | A value representing the ok state. |

**Example:**
```ts
Result('error', null);      // Err('error')
Result('error', 'value');   // Err('error')
Result(null, 'value');      // Ok('value')
Result(undefined, 'value'); // Ok('value')
```

### Ok(value)
Returns a variant that represents a success value. This variant stores one value.

**Kind**: static method of [`Result`](#optionalvalue)  
**Returns**: A `Ok<T>` variant
| Param | Description |
| --- | --- |
| value | A value of type `T` to store in a `Ok<T>` variant |

**Example:**
```ts
const value = Result.Ok('string');
// or
const value = Ok('string');
```

### Err(error)
Returns a variant that represents a failure value. This variant stores one value.

**Kind**: static method of [`Result`](#optionalvalue)  
**Returns**: A `Err<T>` variant
| Param | Description |
| --- | --- |
| value | A value of type `T` to store in a `Err<T>` variant |

**Example:**
```ts
const value = Result.Err('some error');
// or
const value = Err('some error');
```

### Result.map(value, mapper)
Maps a `Result<T, E>` to a `Result<M, E>`

**Kind**: static method of [`Result`](#resulterr-value)
**Returns**: An `Result<M, E>`  

| Param | Description |
| --- | --- |
| value | An `Result<T, E>` |
| mapper | A function that maps `T` to `M` |

**Example:**
```ts
Result.map(Ok(9), (num) => num.toString()); // Ok('9')
Result.map(Err('error'), (num) => num.toString()); // Err('error')
```

### Result.fallback(value, fallback)
If `value` is the Ok variant it returns the value stored in it,
otherwise it returns the result of executing the `fallback` function.

**Kind**: static method of [`Result`](#resulterr-value)
**Returns**: The value stored in the Ok variant or the result of calling `fallback`.  

| Param | Description |
| --- | --- |
| value | A Result variant |
| fallback | A function to call if `value` is the Err variant. |

**Example:**
```ts
Result.fallback(Ok(9), () => 0); // 9
Result.fallback(Err('error'), () => 0); // 0
```

### Result.returnResult(func)
A higher-order function that wraps a function that throws
into a Result variant. If the `func` throws the new function
returns the Err variant, otherwise it wraps the return of
`func` in the Ok variant.

**Kind**: static method of [`Result`](#resulterr-value)
**Returns**: A new function that calls `func` wrapping its
         return in a Result.  

| Param | Description |
| --- | --- |
| func | A function that throws. |

**Example:**
```ts
function sometimesNull() {
  if (Math.random() > 0.5) {
    return 'value';
  }

  throw new Error('error');
}

const sometimes = Result.returnResult(sometimesNull);
//    ^? () => Result<string>
```

### Result.returnPromiseResult(func)
A higher-order function that wraps a function that returns a
Promise that may reject into a function that returns a
Promise of Result. If the Promise rejects the new function returns
the Promise of Err variant, otherwise it wraps the resolved value in
the Ok variant.

**Kind**: static method of [`Result`](#resulterr-value)
**Returns**: A new function that calls `func` wrapping its
         returned Promise into a Promise of Result.  

| Param | Description |
| --- | --- |
| func | A function that throws. |

**Example:**
```ts
function sometimesNull() {
  if (Math.random() > 0.5) {
    return Promise.resolve('value');
  }

  return Promise.reject('error');
}

const sometimes = Result.returnResult(sometimesNull);
//    ^? () => Promise<Result<string>>
```

### Result.callback(func)
Converts a function the receives a Result into a node.js style callback function

**Kind**: static method of [`Result`](#resulterr-value)
**Returns**: A node.js style callback function  

| Param | Description |
| --- | --- |
| func | A function the receives a Result. |

**Example:**
```ts
import { readFile } from 'node:fs';

readFile('./file.txt', Result.callback((result) => {
  match(result, {
    Ok(data) {
      // do stuff with data
    },
    Err(error) {
      // handle error
    }
  })
}));
```
