---
layout: post
title: "C# Minimal API: A Practical Way to Keep Endpoints Clean"
date: 2026-12-22
categories: [dotnet, minimapapis, architecture, webapi]
canonical_url: "https://dev.to/gramli/c-minimal-api-a-practical-way-to-keep-endpoints-clean-18aa"
---

*Posted 12/22/2025*

# C# Minimal API: A Practical Way to Keep Endpoints Clean

Minimal APIs make it tempting to write everything inline, but this quickly becomes unmaintainable. When endpoints handle validation, business logic, error handling and response formatting all in one place, they become difficult to test and reuse. The solution is to extract business logic into dedicated handlers, leaving endpoints responsible only for routing.

## A Practical Way to Keep Endpoints Clean
To keep Minimal API endpoints clean and maintainable, business logic should be implemented outside the endpoint itself, typically in dedicated handler classes.
Endpoints should be responsible only for:
- Accepting input
- Delegating work to a handler
- Returning an HTTP response

**Basic handler example**
```csharp
public record WeatherForecastPayload(string Location, int Days);

public class WeatherForecastRequestHandler
{
    public Task<string[]> HandleAsync(
        WeatherForecastPayload request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool",
            "Mild", "Warm", "Balmy", "Hot",
            "Sweltering", "Scorching"
        });
    }
}
```
**Endpoint using the handler**
```csharp
app.MapPost("/create-forecast",
    async (
        [FromBody] WeatherForecastPayload payload,
        WeatherForecastRequestHandler handler,
        CancellationToken cancellationToken) =>
    {
        var result = await handler.HandleAsync(payload, cancellationToken);

        if (result is not null)
        {
            return Results.Ok(result);
        }

        return Results.BadRequest();
    });
```
This works, but as soon as response logic becomes more complex, endpoints start to grow and lose readability.

### Introducing a unified handler abstraction

Most handlers:
- Accept a request
- Return a response

We can formalize this with a common interface with unified response models:

```csharp
public interface IHttpRequestHandler<TResponse, in TRequest>
{
    Task<HttpDataResponse<TResponse>> HandleAsync(
        TRequest request,
        CancellationToken cancellationToken);
}
```

**Unified response models**
```csharp
public class DataResponse<T>
{
    public T? Data { get; init; }
    public IEnumerable<string> Errors { get; init; } = [];
}

public class HttpDataResponse<T> : DataResponse<T>
{
    [JsonIgnore]
    public HttpStatusCode StatusCode { get; init; }
}
```
The `HttpStatusCode` is used internally and is not exposed in the API response body, that's why `HttpDataResponse<T>` inherits from `DataResponse<T>`.

**Cleaner endpoints with handler-driven responses**
```csharp
app.MapPost("/create-forecast",
    async (
        [FromBody] WeatherForecastPayload payload,
        IHttpRequestHandler<string[], WeatherForecastPayload> handler,
        CancellationToken cancellationToken) =>
    {
        var response = await handler.HandleAsync(payload, cancellationToken);
        return Results.Json(
            response,
            statusCode: (int)response.StatusCode);
    });

```
Now the endpoint is cleaner, but we can push this further with an extension method.

**Simplifying with an extension**
```csharp
public static class HandlerExtensions
{
    public static async Task<IResult> SendAsync<TResponse, TRequest>(
        this IHttpRequestHandler<TResponse, TRequest> handler,
        TRequest request,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(request, cancellationToken);

        return Results.Json(
            response,
            statusCode: (int)response.StatusCode);
    }
}
```

With this extension method in place, endpoint logic is reduced to a single method call. The endpoint no longer handles response construction, it simply delegates execution.

### The Target Pattern: Trivial Endpoints
```csharp
app.MapPost("/create-forecast",
    async (
        [FromBody] WeatherForecastPayload payload,
        IHttpRequestHandler<string[], WeatherForecastPayload> handler,
        CancellationToken cancellationToken)
        => await handler.SendAsync(payload, cancellationToken));
```
**This is our target pattern** - endpoints become trivial one-liners. At this point, the endpoint contains no business or response logic. However, with this implementation `IHttpRequestHandler<T>` always expects both a request and a response type, so we need to handle the following cases:

- **Requests without input/payload**: for endpoints without a request body, a simple marker type can be used like an empty record for example.
```csharp
public sealed record EmptyRequest;
``` 
- **Empty Response**: The same approach can be applied to responses as well, allowing the `SendAsync` extension method to determine the appropriate HTTP status (e.g., NoContent, Ok).

### The Trade-off: HTTP-Aware Handlers

With `HttpDataResponse<T>`, handlers are **HTTP-aware** they return `HttpStatusCode` directly. This couples your handler layer to HTTP transport.

For many applications, this is **pragmatic and sufficient**. The handler layer *is* your HTTP boundary. Just ensure that:
- Only `IHttpRequestHandler` implementations return `HttpDataResponse<T>`
- Lower layers (domain services, business logic) remain transport-agnostic

If this coupling concerns you, there's an alternative approach.

## Alternative: Transport-Agnostic Handlers
If you need stricter separation (e.g., sharing handlers across gRPC, message queues, REST), you can use transport-agnostic status codes that get mapped at the endpoint level.

**Unified response models**
```csharp
public enum HandlerStatusCode
{
   Success = 0,
   SuccessWithEmptyResult = 1,
   ValidationError = 2,
   InternalError = 4
}

public class HandlerResponse<T> : DataResponse<T>
{
    [JsonIgnore]
    public HandlerStatusCode StatusCode { get; init; }
}
```

**Strict Handler interface**
`IHttpRequestHandler<T>` was renamed to `IStatusRequestHandler<T>` because it now has its own status type instead of an HTTP status.
```csharp
public interface IStatusRequestHandler<TResponse, in TRequest>
{
    Task<HandlerResponse<TResponse>> HandleAsync(
        TRequest request,
        CancellationToken cancellationToken);
}
```

**Mapping status codes in extension method**
```csharp
public static class HandlerExtensions
{
    /// <summary>
    /// Executes a request handler and maps the response to an appropriate HTTP result.
    /// </summary>
    public static async Task<IResult> SendAsync<TResponse, TRequest>(this IStatusRequestHandler<TResponse, TRequest> requestHandler, TRequest request, CancellationToken cancellationToken)
    {
        var response = await requestHandler.HandleAsync(request, cancellationToken);

        return response.StatusCode switch
        {
            HandlerStatusCode.SuccessWithEmptyResult => Results.NoContent(),
            HandlerStatusCode.Success => Results.Json(response, statusCode: (int)HttpStatusCode.OK),
            HandlerStatusCode.ValidationError => Results.Json(response, statusCode: (int)HttpStatusCode.BadRequest),
            HandlerStatusCode.InternalError => Results.Json(response, statusCode: (int)HttpStatusCode.InternalServerError),
            _ => throw new InvalidOperationException($"Unknown HandlerStatusCode: {response.StatusCode}"),
        };
    }
}
```

When to use this approach:
- You're building multiple transport layers (REST, gRPC, message queues)
- You have strict architectural boundaries between layers
- You want handlers completely decoupled from HTTP

## Solution Examples
The following example projects demonstrate both approaches:
- **Using HTTP-Aware Handlers** - HTTP response codes are handled directly in handler layer - https://github.com/Gramli/AuthApi
- **Using transport-agnostic handlers** - the response model is independent of HTTP - https://github.com/Gramli/WeatherApi

## Conclusion
This pattern transforms Minimal API endpoints from multi-line routing functions into single-line declarations that are consistent, testable and maintainable.

The core insight: endpoints should route, not implement. By standardizing on `IHttpRequestHandler<TResponse, TRequest>` and `HttpDataResponse<T>`, you gain:
- Trivial endpoints that fit on one line
- Business logic isolated in testable handlers
- Consistent error handling and response formatting across your entire API

The **trade-off** is handlers become **HTTP-aware**. For most applications, this is the right choice because handlers are your HTTP boundary. If you need transport-agnostic handlers (for gRPC, message queues, etc.), use the `HandlerStatusCode` approach shown above.