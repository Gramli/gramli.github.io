*Posted 11/10/2024*

# FluentResult UnwrapOrDefault

This is an extension method for the `Result` object in the [FluentResult](https://github.com/altmann/FluentResults) library.

The extension allows you to unwrap a result. If the result is successful, it returns the value. Otherwise, it returns a default value and adds the errors to a provided Result instance.

```csharp
        private static T? UnwrapOrWithErrorsDefault<T>(this Result<T> result, Result failedError, T? defaultValue = default)
        {
            ArgumentNullException.ThrowIfNull(failedError);
            ArgumentNullException.ThrowIfNull(result);

            if (result.IsFailed)
            {
                failedError.WithErrors(result.Errors);
                return defaultValue;
            }

            return result.Value;
        }

        public static T UnwrapOrWithErrors<T>(this Result<T> result, Result failedError, T defaultValue)
            => UnwrapOrWithErrorsDefault(result, failedError, defaultValue)!;

        public static async Task<T> UnwrapOrWithErrorsAsync<T>(this Task<Result<T>> resultAsync, Result failedError, T defaultValue)
            => UnwrapOrWithErrors(await resultAsync, failedError, defaultValue);

        public static T? UnwrapOrWithErrors<T>(this Result<T> result, Result failedError)
            => UnwrapOrWithErrorsDefaul(result, failedError);

        public static async Task<T?> UnwrapOrWithErrorsAsync<T>(this Task<Result<T>> resultAsync, Result failedError)
            => UnwrapOrWithErrorsDefault(await resultAsync, failedError);
```

## Usage
You can use this method when creating an object by setting its properties. For example:

```csharp
using FluentResults;

var baseResult = new Result();

var someObject = new SomeMyObject{
    MyProperty1 = GetMyProperty1().UnwrapOrWithErrors(baseResult),
    MyProperty2 = GetMyProperty2().UnwrapOrWithErrors(baseResult),
}


private Result<string> GetMyProperty1() => ...;
private Result<int> GetMyProperty2() => ...;
```
