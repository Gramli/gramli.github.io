---
layout: post
title: "C# Minimal API: Multiple Authentication Schemes with Swagger Support"
date: 2026-12-31
categories: [dotnet, minimapapis, webapi, swagger, csharp]
canonical_url: "https://dev.to/gramli/c-minimal-api-multiple-authentication-schemes-with-swagger-support-bo1"
---

*Posted 12/31/2025*

# C# Minimal API: Multiple Authentication Schemes with Swagger Support

Minimal APIs make it easy to get started quickly, but production APIs almost always require **authentication** and **authorization**. In real-world systems, it’s also common to support multiple authentication methods for example, **JWT** for public clients and **Basic** authentication for internal tooling or service to service access.

**Swagger** is invaluable for local development and quick endpoint testing, but once multiple authentication schemes are involved, it requires explicit configuration to work correctly. 

This article walks through **a practical setup for configuring authentication in ASP.NET Core Minimal APIs**, including JWT and a custom Basic authentication handler and preparing the API for proper authorization and Swagger integration.

> **Note**: For detailed background about authentication and authorization in Minimal APIs, see the official documentation: [https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/security](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/security?view=aspnetcore-10.0)

## Authentication
To enable authentication in a Minimal API application, authentication services must be registered using `AddAuthentication`. This registers the authentication infrastructure and allows endpoints to declare authentication requirements.

In this example, **JWT Bearer** authentication is configured as the default scheme. To use it, you need to install the following NuGet package:

- [Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer) nuget package.

A minimal authentication setup looks like this:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication().AddJwtBearer();
  
var app = builder.Build();

app.MapGet("/", () => "Our Auth Example");
app.Run();
```
> **Note**: While `WebApplication` can automatically inject authentication middleware in Minimal API applications, I recommend explicitly calling `UseAuthentication()` in `Program.cs` when middleware ordering matters or when clarity is important in larger applications. The same applies to `UseAuthorization()`.  
Explicit registration gives you full control over pipeline order—for example, ensuring authentication runs after a global exception-handling middleware so that exceptions thrown by custom authentication handlers or token validation logic are properly captured. The same considerations apply to authorization middleware.

### JWT configuration

A basic JWT configuration can be provided via `appsettings.json`:

```json
  "Authentication": {
    "Schemes": {
      "Bearer": {
        "ValidAudiences": [
          "https://localhost:4200",
          "http://localhost:4200"
        ],
        "ValidIssuer": "secret-issuer"
      }
    }
  },
```
> **Note**: This example shows audience and issuer validation. For production use, you must also configure token signing key validation. See [JWT authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt-authn) for complete configuration details.

### Custom authentication method: Basic Authentication
In some scenarios, more than one authentication method is required. A common example is exposing internal or administrative endpoints protected by **Basic authentication**, while public endpoints use JWT.

For demonstration purposes, this example adds a custom Basic authentication scheme.

First, extend `appsettings.json` with a Basic authentication section:

```json
  "Authentication": {
    "Schemes": {
      "Bearer": {
        "ValidAudiences": [
          "https://localhost:4200",
          "http://localhost:4200"
        ],
        "ValidIssuer": "secret-issuer"
      },
      "Basic": {
        "UserName": "admin",
        "Password": "admin"
      }
    }
  },
```
Then register the scheme in `Program.cs`, but don’t forget to also set the `DefaultScheme`, `DefaultChallengeScheme `, `DefaultAuthenticateScheme ` properties. This ensures JWT is used as the default for authentication and challenges, while Basic authentication is only applied when explicitly requested via authorization policies.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
{
     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
     options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer()
.AddScheme<BasicAuthOptions, BasicAuthenticationHandler>("Basic", (options) =>
{
     var userName = configuration["Authentication:Schemes:Basic:UserName"];
     var password = configuration["Authentication:Schemes:Basic:Password"];

     if (string.IsNullOrWhiteSpace(userName))
     {
          throw new InvalidOperationException("Basic authentication username is not configured.");
     }

     if (string.IsNullOrWhiteSpace(password))
     {
          throw new InvalidOperationException("Basic authentication password is not configured.");
     }

     options.UserName = userName;
     options.Password = password;
});
  
var app = builder.Build();

app.MapGet("/", () => "Our Auth Example");
app.Run();
```
Here, `AddScheme<TOptions, THandler>` registers a custom authentication scheme backed by a custom authentication handler. The options are bound from configuration and passed to the handler at runtime.

#### Create `AuthenticationConfiguration`
As we are always trying to keep our `Program.cs` file as clean as possible, let’s create an extension method that configures authentication:

```csharp
public static class BasicSchemeDefaults
{
    public static readonly string AuthenticationScheme = "Basic";
}

public static class AuthenticationConfiguration
{
    public static IServiceCollection ConfigureAuthentication(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        serviceCollection.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer().AddScheme<BasicAuthOptions, BasicAuthenticationHandler>(BasicSchemeDefaults.AuthenticationScheme, (options) =>
        {
            var userName = configuration["Authentication:Schemes:Basic:UserName"];
            var password = configuration["Authentication:Schemes:Basic:Password"];

            if (string.IsNullOrWhiteSpace(userName))
            {
                throw new InvalidOperationException(
                    "Basic authentication username is not configured.");
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Basic authentication password is not configured.");
            }

            options.UserName = userName;
            options.Password = password;
        });

        return serviceCollection;
    }
}
```

#### Implementing `BasicAuthenticationHandler`
To create a custom authentication handler, the handler must implement `IAuthenticationHandler`. In practice, this is usually done by inheriting from `AuthenticationHandler<TOptions>`.

The handler’s responsibility is to extract credentials from the request, validate them, and produce an `AuthenticateResult`.

```csharp
public sealed class BasicAuthenticationHandler : AuthenticationHandler<BasicAuthOptions>
{
    public BasicAuthenticationHandler(
        IOptionsMonitor<BasicAuthOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
        {
            return AuthenticateResult.Fail("Missing Authorization header");
        }

        if (!AuthenticationHeaderValue.TryParse(authorizationHeader.ToString(), out var authHeader))
        {
            return AuthenticateResult.Fail("Invalid Authorization header");
        }

        if (string.IsNullOrEmpty(authHeader?.Parameter))
        {
            return AuthenticateResult.Fail("Missing Authorization Header parameter");
        }

        Span<byte> bytesBuffer = stackalloc byte[authHeader!.Parameter!.Length];
        if (!Convert.TryFromBase64String(authHeader.Parameter, bytesBuffer, out var bytesWritten))
        {
            return AuthenticateResult.Fail("Invalid Base64 string");
        }

        var credentials = Encoding.UTF8.GetString(bytesBuffer[..bytesWritten]).Split(':', 2);

        if (credentials.Length != 2)
        {
            return AuthenticateResult.Fail("Invalid credential format");
        }

        if (credentials[0] != this.Options.UserName || credentials[1] != this.Options.Password)
        {
            return AuthenticateResult.Fail("Invalid credentials");
        }

        var claims = new List<Claim>()
        {
            new(ClaimTypes.Name, credentials[0]),
            new(ClaimTypes.Role, AuthRoles.Administrator)
        };

        var claimsIdentity = new ClaimsIdentity(claims, Scheme.Name);
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

        return AuthenticateResult.Success(
            new AuthenticationTicket(
                claimsPrincipal,
                Scheme.Name));
    }
}
```

#### Authentication options

The options class used by the handler must inherit from `AuthenticationSchemeOptions`:

```csharp
public sealed class BasicAuthOptions : AuthenticationSchemeOptions
{
   public const string SectionName = "Basic";
   public string UserName { get; set; } = string.Empty;
   public string Password { get; set; } = string.Empty;
}
```

> **Important** This Basic authentication implementation is intended for demonstration. Credentials **must never** be stored in `appsettings.json` in production. Use secure storage such as environment variables, secret managers, or Azure Key Vault.
**Always use Basic authentication over HTTPS**. Without HTTPS, credentials are exposed to anyone listening on the network, making your API extremely vulnerable.

## Authorization
Authentication answers who the user is. Authorization answers what the user is allowed to do. In most real-world APIs, authenticated users do not  have the same permissions, which means authorization policies are required.

ASP.NET Core authorization is **policy-based**. Policies can be scoped to:
- Specific authentication schemes
- Required roles or claims
- Custom requirements

In this example, the API supports two authentication schemes:
- **JWT Bearer authentication**
- **Basic authentication**

Each scheme requires its own authorization rules.

### Authorization configuration
To keep authorization setup explicit and reusable, policies are defined in a dedicated configuration class:
```csharp
public static class AuthorizationConfiguration
{
    public static readonly string BasicPolicyName = "basicPolicy";
    public static readonly string UserPolicyName = "userPolicy";
    public static readonly string DeveloperPolicyName = "developerPolicy";
    public static readonly string AdministratorPolicyName = "administratorPolicy";

    public static IServiceCollection ConfigureAuthorization(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddAuthorization(options =>
        {
            options.AddBearerPolicy(UserPolicyName, AuthRoles.AllRoles);
            options.AddBearerPolicy(DeveloperPolicyName, [AuthRoles.Developer, AuthRoles.Administrator]);
            options.AddBearerPolicy(AdministratorPolicyName, [AuthRoles.Administrator]);
            options.AddPolicy(BasicPolicyName, options =>
            {
                options.RequireAuthenticatedUser();
                options.AddAuthenticationSchemes(BasicSchemeDefaults.AuthenticationScheme);
            });
        });

        return serviceCollection;
    }

    public static void AddBearerPolicy(this AuthorizationOptions authorizationOptions, string policyName, IEnumerable<string> roles)
    {
        authorizationOptions.AddPolicy(policyName, policy =>
        {
          policy.RequireAuthenticatedUser();
          policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme);
          policy.RequireRole(roles);

        });
    }
}
```

#### Why AddAuthenticationSchemes matters
When multiple authentication schemes are registered, authorization policies must explicitly specify which scheme they apply to.

Without `AddAuthenticationSchemes`:
- ASP.NET Core may attempt to authenticate using the default scheme, leading to unexpected failures when multiple schemes are registered.
- Requests may fail even with valid credentials
- Swagger testing becomes unreliable

In this configuration:
- JWT-based policies explicitly require the Bearer scheme
- The Basic policy explicitly requires the Basic scheme

This guarantees predictable behavior when both authentication methods coexist.

#### Role-based authorization for JWT
JWT policies use role-based authorization:
```csharp
policy.RequireAuthenticatedUser();
policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme);
policy.RequireRole(roles);
```
This assumes roles are:

- Embedded in the JWT token
- Mapped to ClaimTypes.Role (or configured accordingly)

Each policy restricts access to a specific role set:
- User policy → any authenticated user
- Developer policy → developer or administrator
- Administrator policy → administrator only

#### Basic authentication authorization
The Basic authentication policy is intentionally simple:
```csharp
policy.RequireAuthenticatedUser();
policy.AddAuthenticationSchemes(BasicSchemeDefaults.AuthenticationScheme);
```
This ensures:
- Only authenticated Basic credentials are accepted
- Authorization remains explicit and isolated

### Applying authorization to endpoints

To use it in our endpoints we have to call `RequireAuthorization` method with specific policy name:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureAuthentication(builder.Configuration);
builder.Services.ConfigureAuthorization();
  
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/jwt", () => "Our jwt Auth Example")
.RequireAuthorization(AuthorizationConfiguration.UserPolicyName);
app.MapGet("/basic", () => "Our basic Auth Example")
.RequireAuthorization(AuthorizationConfiguration.BasicPolicyName);
app.Run();
``` 
Each endpoint clearly declares:
- Which policy it requires
- Which authentication scheme is expected
- Which roles (if any) are allowed


## Swagger
And finally **swagger configuration**. Let's start from basics. Extension method below configures Swagger and adds it to your dependency injection container. And with `SwaggerDoc` creates the main Swagger document with version "v1".
```csharp
public static IServiceCollection ConfigureSwagger(this IServiceCollection serviceCollection)
{
    return serviceCollection.AddSwaggerGen(options =>
    {
        options.SwaggerDoc(_version, new OpenApiInfo()
        {
            Version = _version,
        });
    });
}
```

### JWT Bearer Authentication Setup

```csharp
options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, CreateScheme());

options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
{
    [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
});
```

What this does:
- `AddSecurityDefinition` - Tells Swagger "this API uses JWT Bearer tokens for authentication"
- `AddSecurityRequirement` - Tells Swagger "users must provide a JWT token to test endpoints"

The `CreateScheme()` method defines how JWT authentication works:

```csharp
private static OpenApiSecurityScheme CreateScheme()
{
    return new OpenApiSecurityScheme()
    {
        Name = "JWT Bearer token",          // Display name in Swagger UI
        Type = SecuritySchemeType.Http,     // Uses HTTP authentication
        Scheme = JwtBearerDefaults.AuthenticationScheme,  // "Bearer - Scheme name"
        BearerFormat = "JWT",               // Token format
        Description = "JWT Bearer token Authorization"
    };
}
```
### Basic Authentication Setup
```csharp
options.AddSecurityDefinition(BasicSchemeDefaults.AuthenticationScheme, CreateBasicScheme());

options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
{
    [new OpenApiSecuritySchemeReference(BasicSchemeDefaults.AuthenticationScheme, document)] = []
});
```

Same pattern as JWT, but for Basic authentication (username + password).

The `CreateBasicScheme()` method:

```csharp
private static OpenApiSecurityScheme CreateBasicScheme()
{
    return new OpenApiSecurityScheme()
    {
        Name = "Basic Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = BasicSchemeDefaults.AuthenticationScheme,  // "Basic" Scheme name
        In = ParameterLocation.Header,      // Sent in HTTP headers
        Description = "Enter your username and password."
    };
}
```

Let's put it together in one final **Swagger UI extension** method:
```csharp
public static class SwaggerConfiguration
{
    private static readonly string _version = "v1";
    public static IServiceCollection ConfigureSwagger(this IServiceCollection serviceCollection)
    {
        return serviceCollection.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(_version, CreateInfo());
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, CreateScheme());
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
            });
            options.AddSecurityDefinition(BasicSchemeDefaults.AuthenticationScheme, CreateBasicScheme());
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(BasicSchemeDefaults.AuthenticationScheme, document)] = []
            });
        });
    }

    private static OpenApiSecurityScheme CreateScheme()
    {
        return new OpenApiSecurityScheme()
        {
            Name = "JWT Bearer token",
            Type = SecuritySchemeType.Http,
            Scheme = JwtBearerDefaults.AuthenticationScheme,
            BearerFormat = "JWT",
            Description = "JWT Bearer token Authorization",
        };
    }

    private static OpenApiSecurityScheme CreateBasicScheme()
    {
        return new OpenApiSecurityScheme()
        {
            Name = "Basic Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = BasicSchemeDefaults.AuthenticationScheme,
            In = ParameterLocation.Header,
            Description = "Enter your username and password.",
        };
    }

    private static OpenApiInfo CreateInfo()
    {
        return new OpenApiInfo()
        {
            Version = _version,
        };
    }
    
```
> **Note**: Swagger security definitions are declared at the API level and describe which authentication mechanisms are supported globally. Actual access control such as JWT or Basic policies is enforced per endpoint through your authorization policies.

And `program.cs` will look like this:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureSwagger();
builder.Services.ConfigureAuthentication(builder.Configuration);
builder.Services.ConfigureAuthorization();
  
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/jwt", () => "Our jwt Auth Example").RequireAuthorization(AuthorizationConfiguration.UserPolicyName);
app.MapGet("/basic", () => "Our basic Auth Example").RequireAuthorization(AuthorizationConfiguration.BasicPolicyName);
app.Run();
``` 

When you open Swagger UI you'll see:
1. 🔒 Authorize Button - Click to authenticate
2. Two authentication options:
  - Bearer - Paste your JWT token
  - Basic - Enter username/password

> **Note** Usually `UseSwagger` and `UseSwaggerUI` methods are under if statement because we use them in development environments:
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

## Solution Examples
The following example project demonstrates multiple authentication schemes with swagger support: [AuthApi](https://github.com/Gramli/AuthApi)

## Conclusion
Securing Minimal APIs requires **deliberate design and careful implementation**. By combining multiple authentication schemes, clearly defined authorization policies, and a properly configured Swagger setup, you ensure your endpoints remain **predictable, secure, and maintainable**, even as your API scales.