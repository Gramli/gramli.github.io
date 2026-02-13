---
layout: post
title: "Comparing Throwing Exceptions vs. Result Pattern using Benchmark"
date: 2026-01-13
categories: [dotnet, benchmark, patterns, control-flow]
canonical_url: "https://dev.to/gramli/net-throwing-exceptions-vs-result-pattern-benchmark-4a62"
---

# .NET: Throwing Exceptions vs. Result Pattern Benchmark

In the realm of **error handling** and **control flow**, developers often choose between two primary approaches: **throwing exceptions** and using the **Result Pattern**. Throwing exceptions relies on the standard language mechanism to handle errors, whereas the Result Pattern involves returning a structured object containing both the operation's outcome and any error details.

Both approaches have distinct trade-offs, and the **optimal choice often depends on the specific project context**. Based on my experience with both, I was curious about the performance differences between them.

## Benchmark Methodology
To provide a comprehensive comparison, the benchmark evaluates **two execution scenarios**: a failure path and a success path. The failure path measures the overhead of propagating errors through the call stack, highlighting the cost of throwing exceptions versus returning structured results. The success path measures the overhead during normal execution when no errors occur. Evaluating both scenarios offers a clearer perspective on the trade-offs and illustrates how each approach behaves under different runtime conditions.

For the benchmark, I created two handlers: `ResultHandler` and `ThrowExceptionHandler`. Both perform the same task but use different error handling mechanisms. Each processes generated data through multiple validation layers. To introduce asynchronous suspension without performing real I/O, `Task.Yield()` is used. This forces the method to asynchronously yield execution, allowing the benchmark to measure error propagation across async boundaries.

📁 [Benchmark Repository](https://github.com/Gramli/Gramli.Framework/tree/main/src/GeneralBenchmark/ExceptionsAndResult) - all benchmark source code is available on GitHub.

### Benchmark class
To reflect control flow overhead rather than test data processing, **the benchmark uses small datasets**.
```csharp
[SimpleJob(RuntimeMoniker.Net10_0)]
[Orderer(BenchmarkDotNet.Order.SummaryOrderPolicy.Declared)]
[MemoryDiagnoser]
public class ExceptionAndResultBenchmark
{
    private readonly ResultHandler _resultHandler;
    private readonly ThrowExceptionHandler _throwExceptionHandler;

    public IEnumerable<ExceptionAndResultBenchmarkData> Data()
    {
        yield return new ExceptionAndResultBenchmarkData(100);
        yield return new ExceptionAndResultBenchmarkData(250);
        yield return new ExceptionAndResultBenchmarkData(500);
        yield return new ExceptionAndResultBenchmarkData(750);
    }

    public IEnumerable<ExceptionAndResultBenchmarkData> ValidOnlyData()
    {
        yield return new ExceptionAndResultBenchmarkData(100, true);
        yield return new ExceptionAndResultBenchmarkData(250, true);
        yield return new ExceptionAndResultBenchmarkData(500, true);
        yield return new ExceptionAndResultBenchmarkData(750, true);
    }

    public ExceptionAndResultBenchmark()
    {
        _resultHandler = new ResultHandler(Logger.Instance);
        _throwExceptionHandler = new ThrowExceptionHandler(Logger.Instance);
    }

    [Benchmark]
    [ArgumentsSource(nameof(Data))]
    public async Task Result_Pattern(ExceptionAndResultBenchmarkData data)
    {
        var _ = await _resultHandler.Handle(data.RequestData);
    }

    [Benchmark]
    [ArgumentsSource(nameof(Data))]
    public async Task Exception_Throw(ExceptionAndResultBenchmarkData data)
    {
        var _ = await _throwExceptionHandler.Handle(data.RequestData);
    }

    [Benchmark]
    [ArgumentsSource(nameof(ValidOnlyData))]
    public async Task Result_Pattern_ValidOnly(ExceptionAndResultBenchmarkData data)
    {
        var _ = await _resultHandler.Handle(data.RequestData);
    }

    [Benchmark]
    [ArgumentsSource(nameof(ValidOnlyData))]
    public async Task Exception_Throw_ValidOnly(ExceptionAndResultBenchmarkData data)
    {
        var _ = await _throwExceptionHandler.Handle(data.RequestData);
    }
}
```

### Result pattern handler

```csharp
internal sealed class ResultHandler(Logger logger)
{
    private readonly Logger _logger = logger;

    public async ValueTask<HandleDto?> Handle(IEnumerable<RequestItem> data)
    {
        if (data is null || !data.Any())
        {
            return default;
        }

        var processResult = await ProcessData(data);

        if (processResult.IsFailed)
        {
            _logger.Log(processResult.Errors);
            return default;
        }

        return new HandleDto { Sum = processResult.Value };
    }

    private static async ValueTask<Result<double>> ProcessData(IEnumerable<RequestItem> data)
    {
        var getValidDataResult = await GetValidData(data);

        if (getValidDataResult.IsFailed)
        {
            return Result<double>.Fail(getValidDataResult.Errors);
        }

        var positiveDataResult = await GetPositiveData(getValidDataResult.Value);

        if (positiveDataResult.IsFailed)
        {
            return Result<double>.Fail(positiveDataResult.Errors);
        }

        return Result<double>.Ok(positiveDataResult.Value.Sum(x => x.Value));
    }

    private static async ValueTask<Result<IEnumerable<RequestItem>>> GetValidData(IEnumerable<RequestItem> inputData)
    {
        if (inputData.All(x => !x.IsValid))
        {
            return Result<IEnumerable<RequestItem>>.Fail("All data are invalid");
        }

        await Task.Yield();

        foreach (var item in inputData)
        {
            var isValidSecondLayerResult = IsValidSecondLayer(item);
            if (isValidSecondLayerResult.IsFailed)
            {
                return Result<IEnumerable<RequestItem>>.Fail("Second level validation is invalid.")
                    .WithErrors(isValidSecondLayerResult.Errors);
            }
        }

        return Result<IEnumerable<RequestItem>>.Ok(inputData.Where(x => x.IsValid));
    }

    private static Result<bool> IsValidSecondLayer(RequestItem item)
    {
        if (!item.IsValidSecondLayer)
        {
            return Result<bool>.Fail("Item is not valid in the second layer");
        }

        return Result<bool>.Ok(true);
    }

    private static async ValueTask<Result<IEnumerable<RequestItem>>> GetPositiveData(IEnumerable<RequestItem> inputData)
    {
        await Task.Yield();

        if (inputData.All(x => x.Value < 0))
        {
            return Result<IEnumerable<RequestItem>>.Fail("All data are smaller than 0");
        }

        return Result<IEnumerable<RequestItem>>.Ok(inputData.Where(x => x.Value > 0));
    }
}
```

While using the **Result Pattern** introduces a lot of repetition—you must check `IsFailed` after nearly every method call, this trade-off leads to highly **predictable** code and explicit control flow.

#### Result<T> implementation

As the `Result<T>` object is a crucial component of the Result pattern, its implementation is included below.

```csharp
internal readonly struct Result<T>
{
    public T? Value { get; }
    public bool IsFailed { get; }
    public IEnumerable<string> Errors { get; }

    private Result(T value)
    {
        Value = value;
        IsFailed = false;
        Errors = [];
    }

    private Result(IEnumerable<string> errors)
    {
        Value = default;
        IsFailed = true;
        Errors = errors;
    }

    private Result(string error)
    {
        Value = default;
        IsFailed = true;
        Errors = [error];
    }

    public Result<T> WithErrors(IEnumerable<string> errors)
    {
        return new Result<T>(Errors.Concat(errors));
    }

    public static Result<T> Ok(T value) => new(value);
    public static Result<T> Fail(IEnumerable<string> errors) => new(errors);
    public static Result<T> Fail(string error) => new(error);

    public override string ToString()
    {
        return string.Join(string.Empty, Errors);
    }
}
```

### Throw exception handler

```csharp
internal sealed class ThrowExceptionHandler(Logger logger)
{
    private readonly Logger _logger = logger;

    public async ValueTask<HandleDto?> Handle(IEnumerable<RequestItem> data)
    {
        if (data is null || !data.Any())
        {
            return default;
        }

        try
        {
            var processResult = await ProcessData(data);
            return new HandleDto { Sum = processResult };
        }
        catch (Exception ex)
        {
            _logger.Log(ex);
            return default;
        }
    }

    private static async ValueTask<double> ProcessData(IEnumerable<RequestItem> data)
    {
        var getValidDataResult = await GetValidData(data);

        var positiveDataResult = await GetPositiveData(getValidDataResult);

        return positiveDataResult.Sum(x => x.Value);
    }

    private static async ValueTask<IEnumerable<RequestItem>> GetValidData(IEnumerable<RequestItem> inputData)
    {
        if (inputData.All(x => !x.IsValid))
        {
            throw new ArgumentException("All data are invalid", nameof(inputData));
        }

        await Task.Yield();

        foreach (var item in inputData)
        {
            IsValidSecondLayer(item);
        }

        return inputData.Where(x => x.IsValid);
    }

    private static void IsValidSecondLayer(RequestItem item)
    {
        if (!item.IsValidSecondLayer)
        {
            throw new ArgumentException("Item is not valid in the second layer", nameof(item));
        }
    }

    private static async ValueTask<IEnumerable<RequestItem>> GetPositiveData(IEnumerable<RequestItem> inputData)
    {
        await Task.Yield();

        if (inputData.All(x => x.Value < 0))
        {
            throw new ArgumentException("All data are smaller than 0", nameof(inputData));
        }

        return inputData.Where(x => x.Value > 0);
    }
}
```

The exception-based implementation is **simpler and cleaner at first glance**. However, I have observed many times that throwing exceptions can lead to a cycle of catch-and-rethrow, which quickly transforms to **spaghetti code**.


### Benchmark results
```shell
BenchmarkDotNet v0.15.8, Windows 10 (10.0.19045.6466/22H2/2022Update)
Intel Core i5-6400 CPU 2.70GHz (Skylake), 1 CPU, 4 logical and 4 physical cores
.NET SDK 10.0.102
  [Host]    : .NET 9.0.9 (9.0.9, 9.0.925.41916), X64 RyuJIT x86-64-v3
  .NET 10.0 : .NET 10.0.2 (10.0.2, 10.0.225.61305), X64 RyuJIT x86-64-v3

Job=.NET 10.0  Runtime=.NET 10.0
```

| Method                    | data      | Mean      | Error     | StdDev    | Gen0   | Allocated |
|-------------------------- |---------- |----------:|----------:|----------:|-------:|----------:|
| Result_Pattern            | 100 items |  1.384 us | 0.0227 us | 0.0212 us | 0.2251 |     704 B |
| Exception_Throw           | 100 items | 57.909 us | 0.6635 us | 0.6206 us | 5.8594 |   18658 B |
| Result_Pattern_ValidOnly  | 100 items |  3.792 us | 0.0690 us | 0.0645 us | 0.3281 |    1022 B |
| Exception_Throw_ValidOnly | 100 items |  3.318 us | 0.0511 us | 0.0546 us | 0.2747 |     903 B |
| Result_Pattern            | 250 items |  1.347 us | 0.0141 us | 0.0131 us | 0.2251 |     704 B |
| Exception_Throw           | 250 items | 58.265 us | 0.4117 us | 0.3851 us | 5.8594 |   18661 B |
| Result_Pattern_ValidOnly  | 250 items |  6.500 us | 0.2048 us | 0.5875 us | 0.2441 |    1017 B |
| Exception_Throw_ValidOnly | 250 items |  6.659 us | 0.1314 us | 0.2336 us | 0.2823 |     892 B |
| Result_Pattern            | 500 items |  1.371 us | 0.0137 us | 0.0129 us | 0.2251 |     704 B |
| Exception_Throw           | 500 items | 57.530 us | 0.8766 us | 0.8200 us | 5.8594 |   18629 B |
| Result_Pattern_ValidOnly  | 500 items |  7.139 us | 0.1873 us | 0.5524 us | 0.3204 |    1013 B |
| Exception_Throw_ValidOnly | 500 items |  6.468 us | 0.1283 us | 0.1798 us | 0.2823 |     885 B |
| Result_Pattern            | 750 items |  1.317 us | 0.0124 us | 0.0103 us | 0.2251 |     704 B |
| Exception_Throw           | 750 items | 58.142 us | 0.5948 us | 0.5564 us | 5.8594 |   18665 B |
| Result_Pattern_ValidOnly  | 750 items |  8.023 us | 0.1575 us | 0.2675 us | 0.3204 |    1011 B |
| Exception_Throw_ValidOnly | 750 items | 10.361 us | 0.2963 us | 0.8738 us | 0.2441 |     883 B |

### Performance Analysis

#### The Failure Path (Error Handling Overhead)
The benchmark shows a clear performance gap when errors occur: the **Result Pattern is approximately 44 times faster** (~1.3 μs vs. ~58 μs). While a few microseconds might seem small, these costs add up quickly in applications that process thousands of requests per second.

**Why is the Exception approach slower? (~58 μs)**
When you `throw` an exception, the .NET runtime has to do some heavy lifting:
- **Stack Walking:** The runtime must traverse the entire call stack to identify the appropriate `catch` block. This requires aggregating metadata for every active method in the current execution thread, which is a CPU-bound process.
- **Internal Bookkeeping:** Even if the `StackTrace` is never explicitly accessed, the runtime must still capture and store the raw frame data during the throw. This ensures the diagnostic information is available if needed, but it creates immediate overhead.
- **Memory Allocation:** Exceptions are heavyweight heap objects. These results show an allocation of **~18.6 KB** per error. Excessive throwing increases memory pressure and triggers more frequent Garbage Collection (GC) cycles, which can lead to application stutters.


**Why is the Result Pattern faster? (~1.3 μs)**
It treats an error like a regular piece of data:
- **No call-stack traversal is required:** It doesn't care about the history of method calls; it just returns a simple object.
- **Lightweight:** It consumes significantly less memory (**~704 B**). Because `Result<T>` is a small value type, it typically avoids the large heap allocations associated with exception objects, though it may still be copied or stored within async state machines depending on usage.

#### The Success Path (Normal Execution)
When everything goes right (the `ValidOnly` benchmarks), the performance gap disappears. In fact, **the exception approach is slightly faster** in some cases.

This is because .NET uses "zero-cost" exceptions. If an error is **never thrown**, the `try/catch` block doesn't slow down your code at all. On the other hand, the Result Pattern has a tiny "success tax" as you always pay a few nanoseconds because the code must wrap the successful answer inside a `Result` object. 

The memory usage on the success path is also nearly identical (around 1 KB), showing that during normal operation, the choice of error handling doesn't really impact your app's performance.


## Conclusion

The benchmark results clearly demonstrate that the Result Pattern is **substantially faster** and consumes **significantly less memory** than exception-based error handling in the **failure path**. In most scenarios, the Result Pattern is the superior choice for managing expected failures. While it requires more repetitive "failure checks", it provides **predictable behavior and undeniable performance benefits**. Exact performance characteristics will vary based on how the `Result<T>` object is implemented.

While the exception-based approach often results in **cleaner-looking code**, it **demands strict discipline**. Developers must catch only specific exceptions and handle general failures at a central level. Without this rigor, exception-based control flow can quickly devolve into a confusing web of dependencies, forcing developers to dig through lower-level logic just to understand what might go wrong.

In summary, when failures occur frequently and are a normal part of the business logic, the Result Pattern is the clear winner. However, **exceptions remain the correct tool for truly exceptional, unexpected** conditions, especially when the diagnostic value of a full stack trace outweighs the performance cost. The **ideal architecture likely uses both**, choosing the right tool based on failure frequency, performance needs, and domain clarity.