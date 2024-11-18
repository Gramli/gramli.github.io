*Posted 11/15/2024*
# Secure ASP.NET Server Headers

### Remove server headers from response
Its always better to show headers which hold information about server, framework or language to hide the information from attacker.

```csharp
builder.WebHost.ConfigureKestrel(host => { host.AddServerHeader = false;  });
```

### Use HSTS
Always use Strict Transport Security Protocol and HTTPS Redirection in production apps: 

* HTTPS Redirection Middleware (UseHttpsRedirection) to redirect HTTP requests to HTTPS.
* HSTS Middleware (UseHsts) to send HTTP Strict Transport Security Protocol (HSTS) headers to clients.

```csharp
var builder = WebApplication.CreateBuilder(args);
...
var app = builder.Build();
...
app.UseHsts();
app.UseHttpsRedirection();
```

[Enforce HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl?view=aspnetcore-9.0&tabs=visual-studio%2Clinux-sles)

### Security headers

* Add the headers directly in program.cs using anonymous midleware
    ```csharp 
    using Microsoft.Extensions.Primitives;

    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("Content-Security-Policy", new StringValues("default-src 'self'"));
        context.Response.Headers.Add("X-Content-Type-Options", new StringValues("nosniff"));
        context.Response.Headers.Add("X-Frame-Options", new StringValues("SAMEORIGIN"));
        context.Response.Headers.Add("X-XSS-Protection", new StringValues("1; mode=block"));
        await next();
    });
    ```

* [Add them using external midleware](https://www.meziantou.net/security-headers-in-asp-net-core.htm) - all detailed info