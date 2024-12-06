*Posted 11/10/2024*

# FluentResult UnwrapOrWithErrors

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
Suppose we have a SpaceShip object and want to create an instance with all properties set. However, the methods returning these properties use the Result type, requiring us to handle potential errors. By using UnwrapOrWithErrors, we significantly reduce boilerplate code and make property initialization more concise and error-aware.

Example: 

```csharp
using FluentResults;

public class SpaceShip 
{
    public string Name { get; init; }
    public int GunsCount { get; init; }
    public string? Owner { get; init; }
}

public class ShipCreator
{
    public Result<SpaceShip> Create()
    {
        var nameResult = GetName();
        if(nameResult.IsFailed)
        {
            return Result.Fail(nameResult.Errors);
        }

        var gunsCountResult = GetGunsCount();
        if(gunsCountResult.IsFailed)
        {
            return Result.Fail(gunsCountResult.Errors);
        }

        var ownerResult = GetOwner();
        if(ownerResult.IsFailed)
        {
            return Result.Fail(ownerResult.Errors);
        }

        return new SpaceShip
        {
            Name = nameResult.Value,
            GunsCount = gunsCountResult.Value,
            Owner = ownerResult.Value
        }
    }

    // Using the UnwrapOrWithErrors extension method, we can simplify this process:
    public Result<SpaceShip> CreateWithExtension()
    {
        var resultAggregator = new Result();

        var ship = new SpaceShip
        {
            // Unwrap Name with a default value and collect errors if any
            Name = GetName().UnwrapOrWithErrors(resultAggregator, string.Empty),
            // Unwrap GunsCount with a default value and collect errors if any
            GunsCount = GetGunsCount().UnwrapOrWithErrors(resultAggregator, 0),
            // Unwrap Owner with the default value of null
            Owner = GetOwner().UnwrapOrWithErrors(resultAggregator)
        };

        if(resultAggregator.IsFailed)
        {
            return resultAggregator;
        }

        return Result.Ok(ship);
    }

    private Result<string> GetName() => Result.Ok("Falcon");
    private Result<int> GetGunsCount() => Result.Ok(5);
    private Result<string?> GetOwner() => Result.Ok(null);
}
```
