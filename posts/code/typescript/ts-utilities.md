*Posted 11/28/2024*

# TypeScript Utilities

## NonNullable Utility Type
```ts
type OptionalString = string | null | undefined;
type NonNullString = NonNullable<OptionalString>; // string
```

## Partial, Required, and Readonly
```ts
type User = { id: number; name: string; email?: string };

type PartialUser = Partial<User>;   // Makes all fields optional
type RequiredUser = Required<User>; // Makes all fields required
type ReadonlyUser = Readonly<User>; // Makes all fields readonly
```

## Conditional Types for Advanced Type Manipulation
```ts
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
```
UseCase
```ts
type Response<T> = T extends "success" ? { data: string } : { error: string };

const handleResponse = <T extends "success" | "error">(status: T): Response<T> => {
  if (status === "success") return { data: "Success!" } as Response<T>;
  return { error: "Failed!" } as Response<T>;
};
```

## Template Literal Types
```ts
type EventNames = "click" | "hover" | "focus";
type EventHandlers = `on${Capitalize<EventNames>}`; // "onClick" | "onHover" | "onFocus"
```

## Key Remapping in Mapped Types
```ts
type RenameKeys<T> = {
  [K in keyof T as `new_${string & K}`]: T[K];
};

type Original = { id: number; name: string };
type Renamed = RenameKeys<Original>; // { new_id: number; new_name: string }
```

## Index Signatures with Template Literals
```ts
type ApiEndpoints = {
  [K in `GET_${string}` | `POST_${string}`]: () => void;
};

const api: ApiEndpoints = {
  GET_user: () => console.log("Fetch user"),
  POST_order: () => console.log("Create order"),
};
```

## Union and Intersection
* A union type **|** only requires the object to match one of the types, but it allows extra properties.
* An intersection type **&** requires the object to match all properties from both types.

## as const (const assertions)
```ts
// Type '"hello"'
let x = "hello" as const;
// Type 'readonly [10, 20]'
let y = [10, 20] as const;
// Type '{ readonly text: "hello" }'
let z = { text: "hello" } as const;
```
More details
https://www.omarileon.me/blog/typescript-as-const


## Example of parsing Variables and Functions

```ts
type Parse<T extends string> = T extends `${infer Line}\n${infer Rest}`
  ? Trim<Line> extends "" // Check if the trimmed line is empty
    ? Parse<Rest> // Skip empty or whitespace-only lines
    : [ParseLine<Trim<Line>>, ...Parse<Rest>]
  : Trim<T> extends "" // Handle the last line
  ? []
  : [ParseLine<Trim<T>>];

// Trim whitespaces and \n, \t, \r
type Trim<T extends string> = T extends ` ${infer Rest}` | `\t${infer Rest}` | `${infer Rest} ` | `${infer Rest}\t` | `${infer Rest}\r`
  ? Trim<Rest>
  : T;

type ParseLine<T extends string> = 
	T extends `let ${infer Id} = ${string}` | `var ${infer Id} = ${string}` | `const ${infer Id} = ${string}`
	? { id: Id; type: "VariableDeclaration" }
	: T extends `${infer Func}(${infer Arg});`
		? { argument: Arg; type: "CallExpression" }
		: T;

```

```ts
//Expected result
[
  {
    id: "teddyBear",
    type: "VariableDeclaration"
  },
  {
    argument: "teddyBear",
    type: "CallExpression"
  }
]
```