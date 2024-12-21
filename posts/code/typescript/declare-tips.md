*Posted 12/21/2024*

## Node.JS Custom env variables
```typescript
declare var process: {
	env: {
		MOOD_LIGHTS: "true";
		BATH_TEMPERATURE: "327.59";
		STRAWBERRIES: "chocolate";
	};
};

```

## Declare types from different module:
```typescript
declare module "some module  name" {
	type SomeType = "aaa" | "bbb";
	type Child = {
		name: string;
		someType: SomeType;
	};

	type List = Child[];
}
```