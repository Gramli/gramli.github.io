---
layout: post
title: "C# Minimal API: Response Caching - Complete Guide with Examples"
date: 2025-07-25
categories: [dotnet, minimapapis, webapi, caching, csharp]
canonical_url: "https://dev.to/gramli/c-minimal-api-response-caching-nmk"
---

*Posted 07/25/2025*

## Response Caching
> *Response caching reduces the number of requests a client or proxy makes to a web server. Response caching also reduces the amount of work the web server performs to generate a response. Response caching is set in headers. ([Microsoft Docs](https://learn.microsoft.com/aspnet/core/performance/caching/response))*

Response caching is configured using the [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) header, which allows responses to be cached on the client or along the way, for example on a proxy.

## Response Caching in Minimal APIs
In ASP.NET Core MVC, [response caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-10.0) is typically configured using the `ResponseCache` attribute in combination with the `UseResponseCaching` middleware, but this is purely an MVC concept.  
  
For Minimal APIs, we can achieve similar behavior by adding an [endpoint filter](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-10.0) that sets the Cache-Control header after the request is processed.

## RouteHandlerBuilder Caching Extension
The following extension method provides a simple way to apply response caching headers to Minimal API endpoints. The endpoint filter checks if the request is a `GET` or `HEAD` method, executes the endpoint, and then sets the `Cache-Control` header with the specified max age only if the response status code is `200 OK`.
```C#
public static class HttpResponseCachingConfiguration
{
    public static RouteHandlerBuilder AddResponseCacheHeader(this RouteHandlerBuilder routeHandlerBuilder, int maxAgeInSeconds)
      => routeHandlerBuilder.AddEndpointFilter(async (context, next) =>
       {
         var isGetOrHeadRequest = HttpMethods.IsGet(context.HttpContext.Request.Method) || 
                                       HttpMethods.IsHead(context.HttpContext.Request.Method);
         if (!isGetOrHeadRequest)
         {
           return await next(context);
         }

         var result = await next(context);
              
         if (context.HttpContext.Response.StatusCode == StatusCodes.Status200OK)
         {
           context.HttpContext.Response.Headers.CacheControl = $"public,max-age={maxAgeInSeconds}";
         }
              
         return result;
      });
}
```

This extension makes it easy to attach caching headers to any Minimal API endpoint by chaining the extension method, as shown in the example below.

```C#
app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.AddResponseCacheHeader(300);
.WithName("GetWeatherForecast");
```


> **Note**: Client-side caching in browsers or proxies requires caching to be enabled. Once cached, the client or proxy serves the cached response automatically when appropriate.

<br>

> **Important**: User-specific HTTP responses should never be cached as public. If caching is needed, mark them as private.

## When to use
Use response caching when responses are **static**, **public** and can be **safely cached** by browsers or proxies.