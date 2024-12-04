*Posted 11/15/2024*
## Get Enum Value Attribute

### [Source Solution](https://github.com/Gramli/ReflectionBenchmark/tree/main/src/ReflectionBenchmark/GetEnumAttribute)

Sometimes, we require human-readable explanations for enum values, and one of the simplest solutions is to use attributes. Reflection provides a convenient way to extract attributes from enum values. In this benchmark measure, we observe the performance of a generic method extension that retrieves custom attributes from enum values.

```csharp
    public static class EnumExtensions
    {
        public static T GetCustomAttribute<T>(this Enum customEnumValue) where T : Attribute
        {
            return customEnumValue
                .GetType()
                .GetMember(customEnumValue.ToString())
                .First()
                .GetCustomAttribute<T>()!;
        }
    }
```

Benchmark shows result of three enums with different sizes and also GetCustomAttribute reflection method which is called in for loop.
* **CustomLargeEnum** with 35 values 
* **CustomEnum** with 16 values
* **CustomSmallEnum** with 6 values

To be able to compare with some fast solution I create static Dictionary -> Map with CustomEnum as key and string as value which represents description.

```csharp
    public static class CustomEnumMap
    {
        public static readonly IDictionary<CustomEnum, string> Map = new Dictionary<CustomEnum, string>()
        {
			...
        };
    }
```
.NET7  
![Measure One - Get Enum Attribute](../assets/getEnumAttribute.png)  
.NET9  
![Measure One - Get Enum Attribute](../assets/getEnumAttribute_net9.png)  

#### Summary
Comparatively, the implementation with Dictionary shows significantly faster performance and avoids memory allocation when retrieving values by key. However, it requires manual editing every time a new item is added to the Enum.
On the other hand, Reflection is slower and leads to memory allocation, resulting in frequent garbage collections and increased memory usage, especially evident with a large number of items such as 25k. Despite this, Reflection eliminates the need for Enum editing.

In scenarios with a high volume of method calls, Reflection may prove inadequate. However, for fewer calls, up to a hundred, it remains viable, particularly considering the generic nature of our code.