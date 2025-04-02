*Posted 12/21/2024*

## Configure options programically

## Configure options with a delegate

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<MyOptions>(myOptions =>
{
    myOptions.Option1 = "Value configured in delegate";
    myOptions.Option2 = 500;
});

var app = builder.Build();
```

[More about Configuraion](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-9.0#configure-options-with-a-delegate)

## Configure options for Unit tests
We dont mock this options, just use `Create` extension method from `Microsoft.Extensions.Options.Options` class.

```csharp
private readonly IOptions<DistributedLockOptions> _options;

...

_options = Microsoft.Extensions.Options.Options.Create(new DistributedLockOptions
{
    ...
});

```

