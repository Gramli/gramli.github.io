# Czech Encodings in .NET Core. Like Windows-1250, ISO 8859-2, CP852

```csharp
using KamenickyEncoding;
using System.Text;

//Need to install System.Text.Encoding.CodePages
//Then register CodePagesEncodingProvider
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

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