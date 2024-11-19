*Posted 11/10/2024*
# Visible internal classes from diferent project

To be able see internal classes you have to add this code to source project .csproj file, fill ```_Parameter1``` attribute with destination project name:

```xml
	<ItemGroup>
		<AssemblyAttribute Include="System.Runtime.CompilerServices.InternalsVisibleToAttribute">
			<_Parameter1>fill with destination project name</_Parameter1>
		</AssemblyAttribute>
	</ItemGroup>
```

### Example

#### File.Core.csproj:
```xml
	<ItemGroup>
		<AssemblyAttribute Include="System.Runtime.CompilerServices.InternalsVisibleToAttribute">
			<_Parameter1>File.Core.UnitTests</_Parameter1>
		</AssemblyAttribute>
	</ItemGroup>
```

File.Core.UnitTests is destination project name. See [real project](https://github.com/Gramli/FileApi/blob/main/src/File.Core/File.Core.csproj).