*Posted 11/10/2024*

# FluentResult UnwrapOrDefault

This is an extension method for the `Result` object in the [FluentResult](https://github.com/altmann/FluentResults) library.

The extension allows you to unwrap a result. If the result is successful, it returns the value. Otherwise, it returns a default value and adds the errors to a provided Result instance.

```csharp
using FluentResults;

namespace Extensions.FluentResult
{
    public static class UnwrapExtensions
    {
        private static T? UnwrapOrWithErrorsDefault<T>(this Result<T> result, Result failedError, T? optionalDefaultValue = default)
        {
            ArgumentNullException.ThrowIfNull(result);

            if (result.IsFailed)
            {
                ArgumentNullException.ThrowIfNull(failedError);
                failedError.WithErrors(result.Errors);
                return optionalDefaultValue;
            }

            return result.Value;
        }

        /// <summary>
        /// Unwraps the result. If the result is failed, adds errors to the specified failedError and returns the provided default value.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <param name="defaultValue">The value to return if the result is failed.</param>
        /// <returns>The unwrapped value if successful, or the provided default value if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError, result, or defaultValue is null.</exception>
        public static T UnwrapOrWithErrors<T>(this Result<T> result, Result failedError, T defaultValue)
        {
            ArgumentNullException.ThrowIfNull(defaultValue);
            return UnwrapOrWithErrorsDefault(result, failedError, defaultValue)!;
        }

        /// <summary>
        /// Unwraps the result async. If the result is failed, adds errors to the specified failedError and returns the provided default value.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <param name="defaultValue">The value to return if the result is failed.</param>
        /// <returns>The unwrapped value if successful, or the provided default value if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError, result, or defaultValue is null.</exception>
        public static async Task<T> UnwrapOrWithErrorsAsync<T>(this Task<Result<T>> resultAsync, Result failedError, T defaultValue)
            => UnwrapOrWithErrors(await resultAsync, failedError, defaultValue);

        /// <summary>
        /// Unwraps the result. If the result is failed, adds errors to the specified failedError and returns default of T.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <returns>The unwrapped value if successful, or a default value if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError or result is null.</exception>
        public static T? UnwrapOrWithErrors<T>(this Result<T> result, Result failedError)
            => UnwrapOrWithErrorsDefault(result, failedError);

        /// <summary>
        /// Unwraps the result async. If the result is failed, adds errors to the specified failedError and returns default of T.
        /// </summary>
        /// <typeparam name="T">The type of the result value.</typeparam>
        /// <param name="result">The result to unwrap.</param>
        /// <param name="failedError">The result object to which errors are added if unwrapping fails.</param>
        /// <returns>The unwrapped value if successful, or a default value if failed.</returns>
        /// <exception cref="ArgumentNullException">Thrown if failedError or result is null.</exception>
        public static async Task<T?> UnwrapOrWithErrorsAsync<T>(this Task<Result<T>> resultAsync, Result failedError)
            => UnwrapOrWithErrorsDefault(await resultAsync, failedError);

    }
}

```

## Usage
You can use this method when creating an object by setting its properties. For example:

```csharp
using FluentResults;

var baseResult = new Result();

var someObject = new SomeMyObject{
    MyProperty1 = GetMyProperty1().UnwrapOrWithErrors(baseResult, string.Empty),
    MyProperty2 = GetMyProperty2().UnwrapOrWithErrors(baseResult, 0),
    MyNullableProperty = GetMyNullableProperty().UnwrapOrWithErrors(baseResult),
}


private Result<string> GetMyProperty1() => ...;
private Result<int> GetMyProperty2() => ...;
private Result<long?> GetMyNullableProperty() => ...;
```
