---
layout: post
title: ".NET Reflection Performance: Enum Attribute Benchmarks (Part 1)"
date: 2026-04-13
categories: [dotnet, benchmark, performance, reflection, csharp]
description: "Benchmarking reflection, cached reflection, and FrozenDictionary for retrieving custom attributes from enum values in .NET 10."
canonical_url: "https://dev.to/gramli/net-reflection-benchmarks-enum-attribute-performance-part-1-1c44"
---

*Posted 11/15/2024*

**.NET reflection** has a reputation for being slow, hard to read and something to avoid. But does this still apply in newer .NET versions like .NET 8+?

When I was a junior developer, I often heard that reflection should not be used, just avoid it. Over time, I encountered many scenarios where reflection was not only convenient, but also the most maintainable solution.

In this series, I’ll **benchmark common reflection use cases** to understand its real performance characteristics and trade-offs. The goal is simple: **separate myths from measurable cost**.

In this first part, we focus on a very common scenario, retrieving custom attributes from enum values and compare reflection against alternatives such as `Dictionary` and `FrozenDictionary`.

## Get Custom Attribute

Sometimes we need human-readable descriptions for enum values, and one of the simplest approaches is to use attributes. Reflection provides a convenient way to retrieve these attributes at runtime.

In this benchmark, we evaluate the performance of a generic extension method that retrieves custom attributes from enum values.

### Reflection Implementation
A basic extension method for retrieving a custom attribute from an enum looks like this:
```csharp
public static class EnumExtensions
{
    public static T GetCustomAttribute<T>(this Enum customEnumValue) where T : Attribute
    {
        var enumType = customEnumValue.GetType();
        return enumType
            .GetField(Enum.GetName(enumType, customEnumValue)!)!
            .GetCustomAttribute<T>()!;
    }
}
```

Since we are creating a benchmark, we should also implement a more performant version. We can improve performance by caching results using a `ConcurrentDictionary`:

```csharp
public static class EnumExtensions
{
    private static readonly ConcurrentDictionary<(Type EnumType, Type AttributeType, string MemberName), Attribute?> _cache = new();

    public static T? GetCustomAttributeCached<T>(this Enum customEnumValue) where T : Attribute
    {
        var enumType = customEnumValue.GetType();
        var key = (enumType, typeof(T), Enum.GetName(enumType, customEnumValue)!);
        return (T?)_cache.GetOrAdd(key, static k =>
            k.EnumType.GetField(k.MemberName)?.GetCustomAttribute(k.AttributeType));
    }
}
```

> **Note**: `ConcurrentDictionary` is used here to ensure thread-safe access, as this extension method may be called concurrently from multiple threads.

### Dictionary-Based Alternative
To compare against a faster alternative, I created a static dictionary that maps `CustomEnum` values to their corresponding descriptions:

```csharp
public static class CustomEnumMap
{
    public static readonly Dictionary<CustomEnum, string> Map = new Dictionary<CustomEnum, string>()
    {
        ...
    };
}
```

Starting with .NET 8, we can use `FrozenDictionary`, which is optimized for read-heavy, write-once scenarios. This allows us to compare it with a standard `Dictionary`.

```csharp
public static readonly FrozenDictionary<CustomSmallEnum, string> FrozenSmallMap = Map.ToFrozenDictionary();
```
> **Note**: Another possible approach is to use a **source generator**, which can eliminate manual maintenance of mappings like `FrozenDictionary`. However, this comes at the cost of increased complexity and more difficult debugging. I am not covering it here, as it would likely produce performance similar to the `FrozenDictionary` approach.

### Enum definition

To evaluate whether enum size has any impact on performance, I created three enums of different sizes:
* **CustomLargeEnum** with 35 values 
* **CustomEnum** with 16 values
* **CustomSmallEnum** with 7 values

The `CustomEnumAttribute` is very simple:
```csharp
[AttributeUsage(AttributeTargets.Field)]
public sealed class CustomEnumAttribute : Attribute
{
    public string Description { get; }

    public CustomEnumAttribute(string description)
    {
        Description = description;
    }

}
```

### Benchmark code

The benchmark iterates over pre-generated arrays of random enum values and calls `GetCustomAttribute` for each item.

```csharp
[SimpleJob(RuntimeMoniker.Net10_0)]
[Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.FastestToSlowest)]
[MemoryDiagnoser]
public class GetEnumAttributeBenchmark
{
    [Params(1,100,1000,10000)]
    public int Count;

    private CustomEnum[] _values = [];
    private CustomSmallEnum[] _smallValues = [];
    private CustomLargeEnum[] _largeValues = [];


   [GlobalSetup]
    public void Setup()
    {
            var rnd = new Random(42);

            var all = Enum.GetValues<CustomEnum>();
            var smallAll = Enum.GetValues<CustomSmallEnum>();
            var largeAll = Enum.GetValues<CustomLargeEnum>();

            _values = [.. Enumerable
                .Range(0, Count)
                .Select(_ => all[rnd.Next(all.Length)])];

            _smallValues = [.. Enumerable
                .Range(0, Count)
                .Select(_ => smallAll[rnd.Next(smallAll.Length)])];

            _largeValues = [.. Enumerable
                .Range(0, Count)
                .Select(_ => largeAll[rnd.Next(largeAll.Length)])];
    }

    [Benchmark(Baseline = true)]
    public void CustomEnum()
    {
        for (var i = 0; i < _values.Length; i++)
        {
            _ = _values[i].GetCustomAttribute<CustomEnumAttribute>().Description;
        }
    }

    [Benchmark]
    public void CustomLargeEnum()
    {
        for (var i = 0; i < _largeValues.Length; i++)
        {
            _ = _largeValues[i].GetCustomAttribute<CustomEnumAttribute>().Description;
        }
    }
    ...
}
```

### [Source Solution](https://github.com/Gramli/ReflectionBenchmark/tree/main/src/ReflectionBenchmark/GetEnumAttribute)

### Results
```console
BenchmarkDotNet v0.15.8, Windows 10 (10.0.19045.6466/22H2/2022Update)
Intel Core i5-6400 CPU 2.70GHz (Skylake), 1 CPU, 4 logical and 4 physical cores
.NET SDK 10.0.201
  [Host]    : .NET 10.0.5 (10.0.5, 10.0.526.15411), X64 RyuJIT x86-64-v3
  .NET 10.0 : .NET 10.0.5 (10.0.5, 10.0.526.15411), X64 RyuJIT x86-64-v3

Job=.NET 10.0  Runtime=.NET 10.0
```

| Method                   | Count | Mean               | Allocated |
|------------------------- |------ |-------------------:|----------:|
| CustomEnumFrozenMap      | 1     |          0.5172 ns |         - |
| CustomLargeEnumFrozenMap | 1     |          0.5200 ns |         - |
| CustomSmallEnumFrozenMap | 1     |          0.5209 ns |         - |
| CustomSmallEnumMap       | 1     |          4.5348 ns |         - |
| CustomLargeEnumMap       | 1     |          4.5409 ns |         - |
| CustomEnumMap            | 1     |          4.5477 ns |         - |
| CustomLargeEnumCached    | 1     |         55.2759 ns |      24 B |
| CustomSmallEnumCached    | 1     |         55.8674 ns |      24 B |
| CustomEnumCached         | 1     |         63.9393 ns |      24 B |
| CustomSmallEnum          | 1     |        886.7600 ns |     280 B |
| CustomEnum               | 1     |        887.6823 ns |     272 B |
| CustomLargeEnum          | 1     |        888.5621 ns |     280 B |
| CustomEnumFrozenMap      | 100   |         99.5479 ns |         - |
| CustomLargeEnumFrozenMap | 100   |         99.5514 ns |         - |
| CustomSmallEnumFrozenMap | 100   |         99.8055 ns |         - |
| CustomLargeEnumMap       | 100   |        336.8072 ns |         - |
| CustomSmallEnumMap       | 100   |        337.0285 ns |         - |
| CustomEnumMap            | 100   |        337.2214 ns |         - |
| CustomSmallEnumCached    | 100   |      5,473.7805 ns |    2401 B |
| CustomLargeEnumCached    | 100   |      5,571.3201 ns |    2402 B |
| CustomEnumCached         | 100   |      6,463.1792 ns |    2401 B |
| CustomSmallEnum          | 100   |     90,100.0065 ns |   28026 B |
| CustomLargeEnum          | 100   |     93,418.7069 ns |   28174 B |
| CustomEnum               | 100   |     94,719.9186 ns |   27112 B |
| CustomEnumFrozenMap      | 1000  |        949.7209 ns |         - |
| CustomSmallEnumFrozenMap | 1000  |        955.7943 ns |         - |
| CustomLargeEnumFrozenMap | 1000  |        963.3053 ns |         - |
| CustomLargeEnumMap       | 1000  |      3,266.3050 ns |         - |
| CustomEnumMap            | 1000  |      3,267.1102 ns |         - |
| CustomSmallEnumMap       | 1000  |      3,270.5155 ns |         - |
| CustomSmallEnumCached    | 1000  |     56,106.7629 ns |   24006 B |
| CustomLargeEnumCached    | 1000  |     57,870.7619 ns |   24015 B |
| CustomEnumCached         | 1000  |     70,576.5613 ns |   24010 B |
| CustomSmallEnum          | 1000  |    909,513.7370 ns |  280254 B |
| CustomEnum               | 1000  |    921,044.2253 ns |  271621 B |
| CustomLargeEnum          | 1000  |    925,368.7630 ns |  281798 B |
| CustomLargeEnumFrozenMap | 10000 |      9,240.9962 ns |         - |
| CustomEnumFrozenMap      | 10000 |      9,243.3792 ns |         - |
| CustomSmallEnumFrozenMap | 10000 |      9,249.7069 ns |         - |
| CustomSmallEnumMap       | 10000 |     32,852.3596 ns |         - |
| CustomEnumMap            | 10000 |     32,912.0222 ns |         - |
| CustomLargeEnumMap       | 10000 |     32,914.4958 ns |         - |
| CustomLargeEnumCached    | 10000 |    554,776.4648 ns |  240152 B |
| CustomSmallEnumCached    | 10000 |    559,146.3867 ns |  240057 B |
| CustomEnumCached         | 10000 |    671,990.9701 ns |  240102 B |
| CustomSmallEnum          | 10000 |  8,941,992.9688 ns | 2802559 B |
| CustomEnum               | 10000 |  9,313,023.7981 ns | 2716716 B |
| CustomLargeEnum          | 10000 |  9,354,293.2292 ns | 2818074 B |

Let's start with the `Count = 1` scenario.

`FrozenDictionary` appears to be the fastest approach, with measured times in the sub-nanosecond range. However, results at this scale should be interpreted cautiously, as they are highly sensitive to JIT optimizations.

A standard `Dictionary` performs consistently at around **~4.5 ns** per lookup, which is still extremely fast and effectively negligible in most applications.

Cached reflection shows a significant improvement over uncached reflection, reducing execution time from **~888 ns** to **~55-65 ns** per call. This demonstrates that caching eliminates the majority of reflection overhead.

Uncached reflection is by far the slowest approach, with roughly 15-16x higher latency compared to cached reflection and orders of magnitude slower than dictionary-based solutions.

In terms of memory allocations:
- Dictionary-based approaches allocate no memory during lookup
- Cached reflection allocates ~24 B per call. This is caused by boxing the enum value when using the `Enum` type. A zero-allocation alternative is possible using a generic constraint, but it results in a more verbose API:
```csharp
public static TAttribute? GetCustomAttributeCached<TEnum, TAttribute>(this TEnum value) 
    where TEnum : struct, Enum 
    where TAttribute : Attribute
```
- Uncached reflection allocates ~270-280 B per call

When scaling to higher `Count` values, the relative differences remain consistent. Execution time increases linearly for all approaches, but the absolute gap between them becomes more pronounced due to the higher per-call cost of reflection.

Finally, the size of the enum does not have a measurable impact on performance in this benchmark, which is expected given the constant-time nature of the underlying lookup mechanisms.

### Summary
**Dictionary-based solutions** provide the **best raw performance** and avoid allocations during lookups, but require manual maintenance whenever enum values change. This could be avoided with source generators, which provide zero-reflection, zero-allocation, near-native performance. However, they introduce additional complexity and make debugging more difficult, which may be unnecessary for many scenarios.

**Reflection** is slower and introduces allocations, but when **combined with caching, the performance cost becomes negligible** for low-frequency operations. In many real-world scenarios, the improved maintainability outweighs the performance difference.

Reflection should therefore be avoided in hot paths but remains a practical and maintainable solution for metadata access.
