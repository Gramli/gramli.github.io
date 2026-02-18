---
layout: post
title: "Output Caching in ASP.NET Core Minimal APIs with Authorization - Complete Guide"
date: 2025-07-25
categories: [dotnet, minimapapis, webapi, caching, csharp]
canonical_url: "https://dev.to/gramli/c-minimal-api-output-caching-2iij"
description: "Learn how to implement output caching in ASP.NET Core Minimal APIs with authorization headers. Improve performance by caching server-side responses."
---

*Posted 07/25/2025*

## Minimal API: Output Caching
> *Stores the generated response on the server and serves it directly without re-executing the endpoint.* ([Microsoft Docs](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output?view=aspnetcore-10.0))

Output caching is a **server-side caching mechanism implemented as middleware**. It stores the entire HTTP response and serves it for subsequent requests without executing the endpoint again.

By default, output caching uses **in-memory storage**, but it can be backed by distributed stores such as Redis, depending on your configuration and scalability requirements.

Output caching is most suitable for **expensive server-side operations** that return the same response within a defined time window.

When a request arrives:
- If a cached response exists, the middleware short-circuits the pipeline and returns it.
- If not, the request is processed normally, and the response is cached for future requests.

## How to use it
Adding output caching is straightforward. You register it using `AddOutputCache()`, define one or more policies, and then apply those policies to endpoints.
Finally, you must add the middleware using `UseOutputCache()`.
```csharp
var builder = WebApplication.CreateBuilder(args);
...
builder.Services.AddOutputCache(options =>
{
    //add default policy
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromSeconds(10)));
    //add specific policy
    options.AddPolicy("OutputCache20Seconds", builder => 
        builder.Expire(TimeSpan.FromSeconds(20)));
});
...
//use default policy
app.MapGet("/default-cache-policy", () => { return new[] { "someresponse2" }; })
    .CacheOutput();
//use specific policy
app.MapGet("/custom-cache-policy", () => { return new[] { "someresponse" }; })
    .CacheOutput("OutputCache20Seconds");
...
//add middleware
app.UseOutputCache();
```
> **Note**: In apps that use CORS middleware, `UseOutputCache()` must be called after `UseCors()`.

## Output Caching with Authorization Header
By default, output caching **does not cache responses** when an Authorization header is present. This is a safety feature to prevent accidentally serving authenticated content to the wrong user.

If you want to override this behavior, you must create a custom output cache policy.

```csharp
internal static class CustomOutputCachingPolicyFactory
{
    internal static CustomOutputCachingPolicy CreateOutputCachingPolicy(TimeSpan timeSpan)
        => new(timeSpan);
}

internal sealed class CustomOutputCachingPolicy : IOutputCachePolicy
{
    private readonly TimeSpan _responseExpirationTime;
    internal CustomOutputCachingPolicy(TimeSpan responseExpirationTime)
    {
        _responseExpirationTime = responseExpirationTime;
    }

    ValueTask IOutputCachePolicy.CacheRequestAsync(
        OutputCacheContext context,
        CancellationToken cancellation)
    {
        var attemptOutputCaching = AttemptOutputCaching(context);
        context.EnableOutputCaching = attemptOutputCaching;
        context.AllowCacheLookup = attemptOutputCaching;
        context.AllowCacheStorage = attemptOutputCaching;
        context.AllowLocking = true;
        context.ResponseExpirationTimeSpan = _responseExpirationTime;
        context.CacheVaryByRules.QueryKeys = "*";

        return ValueTask.CompletedTask;
    }

    ValueTask IOutputCachePolicy.ServeFromCacheAsync
        (OutputCacheContext context, CancellationToken cancellation)
        => ValueTask.CompletedTask;

    ValueTask IOutputCachePolicy.ServeResponseAsync
        (OutputCacheContext context, CancellationToken cancellation)
    {
        var response = context.HttpContext.Response;

        if (!StringValues.IsNullOrEmpty(response.Headers.SetCookie))
        {
            context.AllowCacheStorage = false;
            return ValueTask.CompletedTask;
        }

        if (response.StatusCode is not (StatusCodes.Status200OK or StatusCodes.Status301MovedPermanently))
        {
            context.AllowCacheStorage = false;
            return ValueTask.CompletedTask;
        }

        return ValueTask.CompletedTask;
    }

    private static bool AttemptOutputCaching(OutputCacheContext context)
    {
        var request = context.HttpContext.Request;

        return HttpMethods.IsGet(request.Method) ||
            HttpMethods.IsHead(request.Method);

    }
```
### Convenience extensions for Minimal APIs
To simplify usage in Minimal APIs, you can create extension methods:

```csharp
public static class OutputCachingExtensions
{
    public static void AddCustomOutputCachingPolicy(this OutputCacheOptions options, params (string name, TimeSpan timeSpan)[] policies)
    {
        foreach (var (name, timeSpan) in policies)
        {
            options.AddPolicy(name, CustomOutputCachingPolicyFactory.CreateOutputCachingPolicy(timeSpan));
        }
    }

    public static IServiceCollection AddOutputCacheWithCustomPolicy(
        this IServiceCollection serviceCollection,
        params (string name, TimeSpan timeSpan)[] policies)
            => serviceCollection.AddOutputCache(options =>
            {
                options.AddCustomOutputCachingPolicy(policies);
            });

    public static IServiceCollection AddOutputCacheWithCustomPolicy(
        this IServiceCollection serviceCollection,
        Action<OutputCacheOptions> configureOptions,
        params (string name, TimeSpan timeSpan)[] policies)
            => serviceCollection.AddOutputCache(options =>
            {
                options.AddCustomOutputCachingPolicy(policies);
                configureOptions.Invoke(options);
            });

    public static RouteHandlerBuilder CustomCacheOutput(this RouteHandlerBuilder routeHandlerBuilder, string name)
        => routeHandlerBuilder.CacheOutput(name);
}
```
> **Important**: Do not use output caching for authenticated or user-specific endpoints unless the response is identical for all users.

## When to use
Use output caching when responses are **costly to generate** and do not change frequently:
- Expensive server-side computations
- Frequently requested responses where execution cost is high (e.g., report generation, user profile rendering)