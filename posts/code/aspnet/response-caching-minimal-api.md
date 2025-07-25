*Posted 07/25/2025*

# Response Caching

Nastaveni Cache-Control header - ASP.NET ma build in support pro [response caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-9.0), ale je delane pro [MVC](https://github.com/dotnet/aspnetcore/issues/58604). kazdopadne lze to jednoduse udelat i pro web service (bez MVC) a to nastavenim output filtru, ktery ten cache-control header po zpracovani requestu nastavi

```C#
    endpointRouteBuilder.MapGet($"{RoutePrefix}/claims/search/options",
        async ([FromServices] IGetBatchClaimsFilterOptionsQueryHandler handler, CancellationToken cancellationToken) =>
            await handler.SendAsync(EmptyRequest.Instance, cancellationToken))
        .ProducesHttpDataResponse<BatchClaimsFilterOptionsDto>()
        .RequireRoleAuthorization(AuthorizationPolicyFactory.JwtPolicy, HV2Roles.AP_HV2_SUPERVISOR, HV2Roles.AP_HV2_ITADMIN)
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

Dle nastaveni CacheControl se pak hodnota cachuje bud na clientovi nebo po ceste (treba na proxy, zalezi na nastaveni), pokud se ale ma cachovat na clientovi je nutne aby client (browser) nemel disablovanou cache.
O samotne cachovani na strane clienta se pak stara browser.