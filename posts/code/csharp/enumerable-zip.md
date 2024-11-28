*Posted 11/28/2024*

# Enumerable.Zip
`Enumerable.Zip` combines two sequences element by element and applies a specified function to each pair. It's great for scenarios where two collections need to be processed together.

## Combine Two Lists into a Key-Value Pair
```csharp
var keys = new[] { "Id", "Name", "Age" };
var values = new[] { "1", "John", "30" };

var dictionary = keys.Zip(values, (key, value) => new { key, value })
                     .ToDictionary(x => x.key, x => x.value);

// Output:
// Id: 1
// Name: John
// Age: 30
```

## Perform Element-Wise Operations
```csharp
var list1 = new[] { 1, 2, 3 };
var list2 = new[] { 4, 5, 6 };

var sum = list1.Zip(list2, (a, b) => a + b);
// Output: 5, 7, 9
```

## Handle Unequal Lengths
```csharp
var shortList = new[] { 1, 2 };
var longList = new[] { 10, 20, 30 };

var result = shortList.Zip(longList, (a, b) => a * b);
// Output: 10, 40
```

## Nested Zips for Pairing Across Multiple Collections
```csharp
var list1 = new[] { "A", "B", "C" };
var list2 = new[] { 1, 2, 3 };
var list3 = new[] { true, false, true };

var result = list1.Zip(list2, (x, y) => new { x, y })
                  .Zip(list3, (xy, z) => $"{xy.x}-{xy.y}-{z}");
// Output: A-1-True, B-2-False, C-3-True
```