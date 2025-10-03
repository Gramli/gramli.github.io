*Posted 07/25/2025*

# Response Caching

Setting the `Cache-Control` header – ASP.NET has built-in support for [response caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-9.0), but it is mainly designed for [MVC](https://github.com/dotnet/aspnetcore/issues/58604).
For web services (without MVC), it can be implemented by adding an output filter that sets the `Cache-Control` header after the request is processed.

```C#
    endpointRouteBuilder.MapGet($"users/{{id}}",
        async (int id, [FromServices] IGetBatchClaimsFilterOptionsQueryHandler handler, CancellationToken cancellationToken) =>
            await handler.SendAsync(id, cancellationToken))
        .ProducesHttpDataResponse<UserDto>()
        .AddResponseCacheHourHeader()
```

```C#
    public static class HttpResponseCachingConfiguration
    {
        private const int TenMinutes = 60 * 10;
        private const int Hour = 60 * 60;
        public static RouteHandlerBuilder AddResponseCacheTenMinutesHeader(this RouteHandlerBuilder routeHandlerBuilder)
            => routeHandlerBuilder.AddResponseCacheHeader(TenMinutes);

        public static RouteHandlerBuilder AddResponseCacheHourHeader(this RouteHandlerBuilder routeHandlerBuilder)
            => routeHandlerBuilder.AddResponseCacheHeader(Hour);

        public static RouteHandlerBuilder AddResponseCacheHeader(this RouteHandlerBuilder routeHandlerBuilder, int maxAgeInSeconds)
            => routeHandlerBuilder.AddEndpointFilter(async (context, next) =>
            {
                context.HttpContext.Response.Headers.CacheControl = $"public,max-age={maxAgeInSeconds}";
                return await next(context);
            });
    }
```

With the `Cache-Control` header, responses can be cached on the client or along the way (e.g., on a proxy).
For client-side caching, the browser must not have caching disabled.
The browser then handles the cached responses.