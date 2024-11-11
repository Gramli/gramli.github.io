# Czech Encodings in .NET Core. Like Windows-1250, ISO 8859-2, CP852

### 1. install System.Text.Encoding.CodePages
package manager:
```
Install-Package System.Text.Encoding.CodePages -Version 8.0.0
```

[nuget link](https://www.nuget.org/packages/system.text.encoding.codepages/)
### 2. Register it
Register it in some main configuration file:
```csharp
using System.Text;

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
```

### 2. register and use it in code:
```csharp
using KamenickyEncoding;
using System.Text;

// Windows-1250
// Default character set for Czech language under MS Windows
var windows1250 = Encoding.GetEncoding(1250);

//ISO 8859-2 also names like ISO Latin-2
var iso88592 = Encoding.GetEncoding("ISO-8859-2");

//CP852 also names like IBM Latin-2
var cp852 = Encoding.GetEncoding(852);

//Kamenickych
//used under MS DOS for Czech and Slovak.
//defined in KamenickyEncoding.cs
//also need to be registered
Encoding.RegisterProvider(KamenickyEncodingProvider.Instance);
var kamenicky = Encoding.GetEncoding("CP895");

```

#### [Implementation for Kamenicky encoding](https://gist.github.com/Gramli/10b92a79227697cda6a41d767b6f500f#file-kamenickyencoding-cs)