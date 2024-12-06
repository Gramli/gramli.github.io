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