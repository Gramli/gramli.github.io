---
layout: post
title: "Clean Unit Testing in .NET: Practical xUnit and Moq Tips"
date: 2026-03-31
categories: [dotnet, csharp, unittest, xunit, moq, testing]
canonical_url: "https://dev.to/gramli/clean-unit-testing-in-net-practical-xunit-and-moq-tips-5bki"
---

When writing unit tests in .NET, the basics are easy to learn. Frameworks like **xUnit** and **Moq** make it straightforward to create tests, mock dependencies and verify behavior. The real challenges appear later, when you start testing real production code.

Sooner or later, you run into practical questions that documentation rarely answers clearly:

- [How to use IOptions in Unit Tests (Without Mocking)](#how-to-use-ioptions-in-unit-tests-without-mocking)
- [Make Internals Visible to Test Projects via .csproj](#make-internals-visible-to-test-projects-via-csproj)
  - [Example](#example)
    - [File.Core.csproj:](#filecorecsproj)
- [Mock ILogger with Moq: Simplify Log Verification](#mock-ilogger-with-moq-simplify-log-verification)
- [Test ILogger Without Moq Using FakeLogger](#test-ilogger-without-moq-using-fakelogger)
- [How to Log in xUnit Tests using ITestOutputHelper](#how-to-log-in-xunit-tests-using-itestoutputhelper)
- [Type-Safe \[MemberData\] using TheoryData](#type-safe-memberdata-using-theorydata)
- [Use .Callback to Assert Internal Objects](#use-callback-to-assert-internal-objects)

These are not complex architectural problems, just practical issues that appear repeatedly in real projects. 

This article shows **practical unit testing tips and tricks for .NET developers**, helping you write cleaner, more maintainable tests with **xUnit** and **Moq**.

## How to use IOptions in Unit Tests (Without Mocking)
*Avoids unnecessary mocking and keeps your tests simple, type-safe, and easy to configure.*

Many developers try to use `new Mock<IOptions<T>>()`, but that's unnecessary overhead. `The Microsoft.Extensions.Options` library provides a built-in helper specifically for this. You can simply use the `Create` extension method from the `Microsoft.Extensions.Options.Options` class to easily generate the required options object instead.

```csharp
private readonly IOptions<DistributedLockOptions> _options;

// ...

_options = Microsoft.Extensions.Options.Options.Create(new DistributedLockOptions
{
    // configure properties
});
```

## Make Internals Visible to Test Projects via .csproj
*Enables testing internal logic without exposing implementation details publicly, keeping your code encapsulated.*

You shouldn't make a class `public` just to test it. You can keep your logic `internal` and still grant your test project access by adding a simple attribute to your source project's `.csproj` file.

```xml
	<ItemGroup>
		<AssemblyAttribute Include="System.Runtime.CompilerServices.InternalsVisibleToAttribute">
			<_Parameter1>Your.Test.Project.Name</_Parameter1>
		</AssemblyAttribute>
	</ItemGroup>
```

### Example

#### File.Core.csproj:
```xml
	<ItemGroup>
		<AssemblyAttribute Include="System.Runtime.CompilerServices.InternalsVisibleToAttribute">
			<_Parameter1>File.Core.UnitTests</_Parameter1>
		</AssemblyAttribute>
	</ItemGroup>
```

> **Note:** Alternatively, you can place `[assembly: InternalsVisibleTo("Your.Test.Project")]` in an `AssemblyInfo.cs` file (or any source file). This approach is common in older .NET Framework projects. In SDK-style projects, configuring the attribute in the `.csproj` file avoids introducing an additional file and keeps assembly configuration centralized.

In this example, `File.Core.UnitTests` is the destination test project name. See a [project example here](https://github.com/Gramli/FileApi/blob/main/src/File.Core/File.Core.csproj).

## Mock ILogger with Moq: Simplify Log Verification
*Simplifies verifying logs in tests, reducing boilerplate and making assertions readable and maintainable.*

Mocking `ILogger<T>` is notoriously difficult because the commonly used methods like `LogInformation()` or `LogError()` are extension methods, Moq cannot intercept those directly. You must verify calls against the underlying interface method `Log<TState>()`, which has a complex generic signature.

Here is a useful example of an extension class that simplifies verifying logger method calls:

```csharp
using Microsoft.Extensions.Logging;
using Moq;

namespace Extensions
{
    public static class MoqLoggerExtensions
    {
        public static void VerifyLog<T>(this Mock<ILogger<T>> loggerMock, LogLevel logLevel, EventId eventId, string message, Times times)
        {
            loggerMock.Verify(
               x => x.Log(
                   It.Is<LogLevel>(y => y.Equals(logLevel)),
                   It.Is<EventId>(y => y.Equals(eventId)),
                   It.Is<It.IsAnyType>((o, _) => string.Equals(message, o.ToString(), StringComparison.InvariantCultureIgnoreCase)),
                   It.IsAny<Exception>(),
                   It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
               times);
        }

        public static void VerifyLog<T>(this Mock<ILogger<T>> loggerMock, LogLevel logLevel, EventId eventId, Times times)
        {
            loggerMock.Verify(
               x => x.Log(
                   It.Is<LogLevel>(y => y.Equals(logLevel)),
                   It.Is<EventId>(y => y.Equals(eventId)),
                   It.IsAny<It.IsAnyType>(),
                   It.IsAny<Exception>(),
                   It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
               times);
        }
    }
}
```

Example usage in a [project](https://github.com/Gramli/FileApi/blob/main/src/Tests/UnitTests/File.UnitTests.Common/Extensions/MoqLoggerExtensions.cs).

> **Note**: Prefer `FakeLogger<T>` for new projects targeting .NET 8+. Use the Moq approach when you're already using Moq throughout your test suite or need to target older .NET versions.

## Test ILogger Without Moq Using FakeLogger
*Removes the need for a mocking framework entirely when asserting log output, using a first-party in-memory logger built for testing.*

Since .NET 8, the `Microsoft.Extensions.Logging.Testing` NuGet package ships a built-in `FakeLogger<T>` class designed specifically for unit tests. It collects all log records in memory, so you can assert on them directly without setting up any mocks or extension methods.

```csharp
using Microsoft.Extensions.Logging.Testing;

var logger = new FakeLogger<OrderService>();
var service = new OrderService(logger);

service.ProcessOrder(orderId: 0);

Assert.Equal(1, logger.Collector.Count);
Assert.Equal(LogLevel.Warning, logger.Collector.LatestRecord.Level);
Assert.Contains("invalid order", logger.Collector.LatestRecord.Message, StringComparison.OrdinalIgnoreCase);
```

`FakeLogger<T>` exposes a `Collector` property (`FakeLogCollector`) that holds all captured records. Each `FakeLogRecord` gives you direct access to `Level`, `Message`, `Exception`, `EventId`, and more.

Example usage in a [project](https://github.com/Gramli/WeatherApi-VSA/blob/main/src/Tests/Weather.API.UnitTests/Features/AddFavorites/AddFavoriteHandlerTests.cs).

## How to Log in xUnit Tests using ITestOutputHelper
*Ensures test logs are visible regardless of the test runner, improving debugging and test diagnostics.*

In xUnit, `Console.WriteLine` won't show up in your Test Explorer or on some CI logs. You must use `ITestOutputHelper` to capture diagnostic data.

```csharp
public class CalculatorTests
{
    private readonly ITestOutputHelper _output;

    public CalculatorTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void Add_ShouldLogExecution()
    {
        _output.WriteLine("Starting addition test...");
        // Test logic goes here
    }
}
```

Example usage in a [project](https://github.com/Gramli/FileApi/blob/main/src/Tests/SystemTests/File.API.SystemTests/Tests/ConvertTests.cs).

<a name="type-safe-memberdata-using-theorydata"></a>
## Type-Safe [MemberData] using TheoryData<T>
*Preserves type safety in parameterized tests, preventing runtime errors and improving code readability.*

Using `IEnumerable<object[]>` for parameterized tests is error-prone. xUnit provides `TheoryData<...>`, which provides compile-time safety for your test parameters.

```csharp
public static TheoryData<int, string, bool> ValidScenarios => new()
{
    { 1, "Active", true },
    { 2, "Pending", false },
    { 3, "Closed", false }
};

[Theory]
[MemberData(nameof(ValidScenarios))]
public void ShouldProcessStatus(int id, string status, bool isValid)
{
    // Type-safe parameters, no object[] casting required!
}
```

Example usage in a [project](https://github.com/Gramli/FileApi/blob/main/src/Tests/UnitTests/File.Infrastructure.UnitTests/FileConversions/Converters/JsonToYamlFileConverterTests.cs).

## Use .Callback to Assert Internal Objects
*Allows you to inspect and assert on objects that are constructed inside the method under test and passed directly to a dependency.*

Sometimes a method creates a complex object internally and passes it to a dependency. To verify that "hidden" object, use Moq's `.Callback` to capture it.

```csharp
var mockRepo = new Mock<IUserRepository>();
User capturedUser = null;

mockRepo.Setup(x => x.Save(It.IsAny<User>()))
        .Callback<User>(user => capturedUser = user);

var service = new UserService(mockRepo.Object);
service.Register("test@test.com", "password");

// Now assert the internal state of the captured object
Assert.NotNull(capturedUser);
Assert.Equal("test@test.com", capturedUser.Email);
```

> **Note**: `.Callback` is useful for observing internal interactions, but relying on it heavily may signal a design smell. Prefer designs where important results are observable through return values or public behavior rather than mock interception.