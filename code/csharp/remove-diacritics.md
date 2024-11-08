# Remove diacritics using SINGLEBYTE LATIN ASCII ENCODING

Install package **System.Text.Encoding.CodePages**
```bash 
System.Text.Encoding.CodePages
``` 

Register provider 
```csharp 
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance); 
```

Add extension method to remove diacritics
```csharp
        public static string RemoveDiacritics(this string text)
        {
            if(string.IsNullOrEmpty(text))
            {
                return text;
            }

            const string SINGLEBYTE_LATIN_ASCII_ENCODING = "ISO-8859-8";

            var tempBytes = Encoding.GetEncoding(SINGLEBYTE_LATIN_ASCII_ENCODING).GetBytes(text);
            return Encoding.UTF8.GetString(tempBytes);
        }
```