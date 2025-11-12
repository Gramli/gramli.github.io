*Posted 11/11/2025*

# LINQ: Why Chaining Two OrderBy Calls Doesn’t Work the Way You Expect

In LINQ, chaining multiple OrderBy calls doesn’t create a multi-level sort — the second OrderBy replaces the first one.

### Code
```csharp
using System.Linq;

var data = new[]
{
    new { Id = 1, Name = "c" },
    new { Id = 5, Name = "b" },
    new { Id = 3, Name = "a" },
    new { Id = 2, Name = "d" },
};

// Two OrderBy calls (second one replaces the first)
var twoOrderBy = data
    .OrderBy(x => x.Id)
    .OrderBy(x => x.Name)
    .ToList();

// Proper multi-level sorting
var orderByThenBy = data
    .OrderBy(x => x.Id)
    .ThenBy(x => x.Name)
    .ToList();

Console.WriteLine("Two OrderBy:");
twoOrderBy.ForEach(x => Console.WriteLine($"{x.Id} - {x.Name}"));

Console.WriteLine("\nOrderBy + ThenBy:");
orderByThenBy.ForEach(x => Console.WriteLine($"{x.Id} - {x.Name}"));
```

### Output
```
Two OrderBy:
3 - a
5 - b
1 - c
2 - d

OrderBy + ThenBy:
1 - c
2 - d
3 - a
5 - b
```

### Why This Happens

When you call OrderBy, LINQ creates a new IOrderedEnumerable<T> that sorts the sequence.
If you call another OrderBy, it doesn’t continue the existing order — it starts a new sort from scratch, ignoring the previous one.

Internally, this code:

```csharp
data.OrderBy(x => x.Id).OrderBy(x => x.Name)
```

```csharp
Enumerable.OrderBy(
    Enumerable.OrderBy(data, x => x.Id),
    x => x.Name);
```

### Takeaway

OrderBy → starts a new sort.

ThenBy → continues the existing sort.

The compiler won’t warn you if you misuse them — so it’s up to you to choose correctly.

One OrderBy to rule them all — and ThenBy to refine them.