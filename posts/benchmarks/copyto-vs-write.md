---
layout: post
title: "Comparing CopyToAsync vs WriteAsync using Benchmark"
date: 2026-03-06
categories: [dotnet, benchmark, performance, ai, csharp]
canonical_url: "https://dev.to/gramli/net-copytoasync-vs-writeasync-the-benchmark-you-didnt-know-you-needed-1g39"
---

*Posted 03/06/2025*
# .NET: CopyToAsync vs WriteAsync: The Benchmark You Didn’t Know You Needed

I had a task where one small part involved writing a byte array to a `MemoryStream`.

Since this was a trivial task, I let Copilot generate the code. But Copilot used `CopyToAsync` instead of `WriteAsync`.

That raised a question, so I asked why.

It kept trying to convince me that `CopyToAsync` was a better fit for this scenario (a 1 MB file), and I quote:

> *`CopyToAsync` might offer better performance due to its internal optimizations for copying data between streams. The performance difference between these two approaches can be minimal for small to moderately sized data.*

According to Copilot:
- Small to medium data: 12 KB – 32 KB
- Large data: 5 MB – 10 MB

But here’s the important detail:

I wasn’t copying between two independent streams.
I already had a byte array in memory.

In that case, wrapping it in a `MemoryStream` just to call `CopyToAsync` adds an extra abstraction layer. So I was skeptical.

Copilot was confident.
I was suspicious.

As a responsible developer, **I couldn’t sleep until I proved my point**.

So I wrote a benchmark.

## The Benchmark
```shell
BenchmarkDotNet v0.15.8, Windows 10 (10.0.19045.6466/22H2/2022Update)
Intel Core i5-6400 CPU 2.70GHz (Skylake), 1 CPU, 4 logical and 4 physical cores
.NET SDK 10.0.102
  [Host]    : .NET 10.0.2 (10.0.2, 10.0.225.61305), X64 RyuJIT x86-64-v3
  .NET 10.0 : .NET 10.0.2 (10.0.2, 10.0.225.61305), X64 RyuJIT x86-64-v3

Job=.NET 10.0  Runtime=.NET 10.0
```

I tested four methods:
- `MemoryStream.CopyToAsync`
- `MemoryStream.CopyTo`
- `MemoryStream.WriteAsync`
- `MemoryStream.Write`

Across file sizes:
- 12 KB
- 32 KB
- 5 MB
- 10 MB
- 25 MB
- 50 MB

## The Code

The benchmark uses **BenchmarkDotNet** and tests copying from a byte array into a `MemoryStream`.

```csharp
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Jobs;

namespace GeneralBenchmark.CopyToAndWrite
{
    [SimpleJob(RuntimeMoniker.Net90)]
    [Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
    [MemoryDiagnoser]
    public class CopyToAndWriteBenchmark
    {
        public IEnumerable<CopyToAndWriteBenchmarkData> Data()
        {
            yield return new CopyToAndWriteBenchmarkData(1024 * 12);
            yield return new CopyToAndWriteBenchmarkData(1024 * 32);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 5);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 10);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 25);
            yield return new CopyToAndWriteBenchmarkData(1024 * 1024 * 50);
        }


        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task MemoryStream_CopyTo_Async(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            using var innerStream = new MemoryStream(data.ByteData);
            await innerStream.CopyToAsync(outerStream);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public async Task ByteArray_Write_Async(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            await outerStream.WriteAsync(data.ByteData);
        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void MemoryStream_CopyTo(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            using var innerStream = new MemoryStream(data.ByteData);
            innerStream.CopyTo(outerStream);

        }

        [Benchmark]
        [ArgumentsSource(nameof(Data))]
        public void ByteArray_Write(CopyToAndWriteBenchmarkData data)
        {
            using var outerStream = new MemoryStream();
            outerStream.Write(data.ByteData);
        }
    }
}

```

[Link To Code](https://github.com/Gramli/Gramli.Framework/blob/main/src/GeneralBenchmark/CopyToAndWrite/CopyToAndWriteBenchmark.cs)

## The Results

| Method | data | Mean | Allocated |
|:--- |:---:| ---:| ----------:|
| MemoryStream_CopyTo_Async | 12 KB | 951.9 ns | 12.15 KB |
| ByteArray_Write_Async     | 12 KB | 916.6 ns | 12.09 KB |
| MemoryStream_CopyTo       | 12 KB | 905.7 ns | 12.15 KB |
| ByteArray_Write           | 12 KB | 891.1 ns | 12.09 KB |
| MemoryStream_CopyTo_Async | 32 KB | 2,535.8 ns | 32.15 KB |
| ByteArray_Write_Async     | 32 KB | 2,511.8 ns | 32.09 KB |
| MemoryStream_CopyTo       | 32 KB | 2,456.8 ns | 32.15 KB |
| ByteArray_Write           | 32 KB | 2,461.5 ns | 32.09 KB |
| MemoryStream_CopyTo_Async | 5120 KB | 1,820,022.6 ns | 5120.27 KB |
| ByteArray_Write_Async     | 5120 KB | 1,826,398.4 ns | 5120.21 KB |
| MemoryStream_CopyTo       | 5120 KB | 1,819,132.4 ns | 5120.27 KB |
| ByteArray_Write           | 5120 KB | 1,807,830.4 ns | 5120.21 KB |
| MemoryStream_CopyTo_Async | 10240 KB | 3,588,365.1 ns | 10240.27 KB |
| ByteArray_Write_Async     | 10240 KB | 3,545,750.1 ns | 10240.21 KB |
| MemoryStream_CopyTo       | 10240 KB | 3,528,154.4 ns | 10240.27 KB |
| ByteArray_Write           | 10240 KB | 3,530,808.4 ns | 10240.21 KB |
| MemoryStream_CopyTo_Async | 25600 KB | 8,796,565.6 ns | 25600.26 KB |
| ByteArray_Write_Async     | 25600 KB | 8,808,362.9 ns | 25600.2 KB |
| MemoryStream_CopyTo       | 25600 KB | 8,815,669.9 ns | 25600.26 KB |
| ByteArray_Write           | 25600 KB | 8,787,913.1 ns | 25600.2 KB |
| MemoryStream_CopyTo_Async | 51200 KB | 8,704,199.7 ns | 51200.26 KB |
| ByteArray_Write_Async     | 51200 KB | 8,718,245.6 ns | 51200.2 KB |
| MemoryStream_CopyTo       | 51200 KB | 8,738,011.5 ns | 51200.26 KB |
| ByteArray_Write           | 51200 KB | 8,721,815.7 ns | 51200.2 KB |

The difference? **Statistically negligible** for both mean execution time and allocations.
`Write` avoids creating the extra `MemoryStream` wrapper, but the practical impact remains minimal even at 50 MB.

This doesn’t mean `CopyTo` is bad. It’s the correct API to use when copying between two arbitrary streams.

But it is not “magically faster.”

In fact, when your source is already a byte array, `Write` is:
- Simpler
- More direct
- Semantically correct

## The Real Lesson
Yeah, I put all this effort into investigating a single line of abstraction suggested by Copilot and even wrote a post about it. But this wasn’t about proving Copilot wrong, it was about something more important:

**AI suggestions are hypotheses, not conclusions.** Measure when it matters. Trust evidence over assumptions.

If you already have the buffer, use the buffer API.

The right choice depends on the scenario, not on AI suggestions about “internal optimizations.”

And yes… **now I can sleep**.