*Posted 07/25/2025*

# Output Caching

Server side caching implemented in minddleware. By default data are cached InMemory but you can use Redis, it depends on configuration and needs.
Suitable for expensive operations on server side which returns same result in timeout window.

When value is not cached it process request and cache response, another request do not invoke endpoint but middleware sends cached value.

Default output caching policy will not cache, if there is authorization header, you have to create your own policy and register it as folows:
```C#
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.Primitives;
using System;

internal static class CustomOutputCachingPolicyFactory
{
    internal static readonly CustomOutputCachingPolicy HourOutputCachingPolicy = new(TimeSpan.FromHours(1));
}

namespace KB.Hv2.Api.Caching
{
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
            context.EnableOutputCaching = true;
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

            if (response.StatusCode != StatusCodes.Status200OK &&
                response.StatusCode != StatusCodes.Status301MovedPermanently)
            {
                context.AllowCacheStorage = false;
                return ValueTask.CompletedTask;
            }

            return ValueTask.CompletedTask;
        }

        private static bool AttemptOutputCaching(OutputCacheContext context)
        {
            var request = context.HttpContext.Request;

            if (!HttpMethods.IsGet(request.Method) &&
                !HttpMethods.IsHead(request.Method))
            {
                return false;
            }

            return true;
        }
    }
}
```

and then configure it as folows:
```C#
public static class OutputCachingConfiguration
{
    public readonly static string HourOutputCachingPolicy = "Expire60Minutes";

    public static IServiceCollection AddOutputCaching(this IServiceCollection serviceCollection)
        => serviceCollection.AddOutputCache(options =>
        {
            options.AddPolicy(HourOutputCachingPolicy, CustomOutputCachingPolicyFactory.HourOutputCachingPolicy);
        });
    public static RouteHandlerBuilder AddOutputCacheHourMinutesPolicy(this RouteHandlerBuilder routeHandlerBuilder)
        => routeHandlerBuilder.CacheOutput(OutputCachingConfiguration.HourOutputCachingPolicy);
}
```

in Program.cs then:

```C#
var builder = WebApplication.CreateBuilder(args);
...
builder.Services.AddOutputCaching();
...
var app = builder.Build();
...
app.UseOutputCache();
...   
app.Run();
```

NOTE:
***`
In apps that use CORS middleware, UseOutputCache must be called after UseCors.
In Razor Pages apps and apps with controllers, UseOutputCache must be called after UseRouting.
`***


