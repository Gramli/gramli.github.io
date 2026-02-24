---
layout: post
title: "Comparing Clean Architecture and Vertical Slice Architecture"
date: 2026-01-13
categories: [dotnet, architecture]
canonical_url: "https://dev.to/gramli/net-vertical-slice-architecture-vs-clean-architecture-a-practical-comparison-using-real-apis-4mck"
---

*Posted 01/13/2026*

# .NET: Vertical Slice Architecture vs Clean Architecture: A Practical Comparison

There are plenty of articles comparing **Clean Architecture** and **Vertical Slice Architecture**, but most of them stay at a purely theoretical level and, apart from the conclusion, contain only explanations of core concepts.

To address this gap, I created two simple, identical APIs using these architectures to observe practical differences in implementation speed, ease of unit testing, and feature additions.

This article does not explain the core concepts or pros and cons of these architectures. Instead, it **summarizes practical findings** based on implementing them in small APIs.

Both APIs are written in **.NET** and use **Minimal APIs**. The examples allow users to retrieve current and forecasted weather data by location from [Weatherbit](https://www.weatherbit.io/) via [RapidAPI](https://rapidapi.com). It also allows users to add favorite or delete locations to an [in memory database](https://learn.microsoft.com/en-us/ef/core/providers/in-memory/?tabs=dotnet-core-cli) and retrieve weather data for those stored locations.

Repo Links:
- **[Clean Architecture WeatherApi](https://github.com/Gramli/WeatherApi)**
- **[Vertical Slice Architecture WeatherApi](https://github.com/Gramli/WeatherApi-VSA)**

In the rest of the article, I will use the abbreviations **Clean Architecture (CA)** and **Vertical Slice Architecture (VSA)**.

## Comparing Implementations Through a New Delete Operation
A comprehensive comparison of architectures involves many factors and project considerations. For this article, I intentionally used a **simple, real-world feature** to illustrate practical differences. To do so, I implemented the same **Delete** operation in both APIs.

### Request Handler Comparison

First, let’s look at the core implementation itself.

#### VSA Handler
The first handler comes from the VSA implementation and contains the full logic of the Delete operation: request validation and the database context call.  
For a simple Delete operation, this is the fastest and easiest solution. At this stage, it is still easy to extend the business logic if needed.


```csharp
internal sealed class DeleteFavoriteHandler : IHttpRequestHandler<bool, DeleteFavoriteCommand>
{
    private readonly WeatherContext _weatherContext;
    private readonly IValidator<DeleteFavoriteCommand> _validator;
    private readonly ILogger<DeleteFavoriteHandler> _logger;
    public DeleteFavoriteHandler(
        IValidator<DeleteFavoriteCommand> validator,
        ILogger<DeleteFavoriteHandler> logger,
        WeatherContext weatherContext)
    {
        _validator = Guard.Against.Null(validator);
        _logger = Guard.Against.Null(logger);
        _weatherContext = Guard.Against.Null(weatherContext);
    }

    public async Task<HttpDataResponse<bool>> HandleAsync(DeleteFavoriteCommand request, CancellationToken cancellationToken)
    {
        if (!_validator.IsValid(request))
        {
            return HttpDataResponses.AsBadRequest<bool>(string.Format(ErrorMessages.RequestValidationError, request));
        }

        var deleteResult = await DeleteFavoriteLocationSafeAsync(request, cancellationToken);
        if (deleteResult.IsFailed)
        {
            return HttpDataResponses.AsInternalServerError<bool>("Location was not deleted from database.");
        }

        return HttpDataResponses.AsOK(true);
    }

    private async Task<Result> DeleteFavoriteLocationSafeAsync(DeleteFavoriteCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var location = await _weatherContext.FavoriteLocations.FindAsync(command.Id, cancellationToken);

            if (location is null)
            {
                return Result.Fail($"Location with ID {command.Id} not found.");
            }

            _weatherContext.Remove(location);
            await _weatherContext.SaveChangesAsync(cancellationToken);
            return Result.Ok();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(LogEvents.FavoriteWeathersStoreToDatabase, ex, "Can't delete location.");
            return Result.Fail(ex.Message);
        }
    }
}
```
#### CA structure

The CA handler implementation is much simpler. It depends on `IWeatherCommandsRepository`, where the database logic is implemented, and request validation is handled in the abstract `ValidationStatusRequestHandler` base class.

At first glance, this handler looks cleaner and makes extending business logic very easy.

```csharp
internal sealed class DeleteFavoriteHandler : ValidationStatusRequestHandler<bool, DeleteFavoriteCommand>
{
    private readonly IWeatherCommandsRepository _weatherCommandsRepository;

    public DeleteFavoriteHandler(
        IWeatherCommandsRepository weatherCommandsRepository,
        IRequestValidator<DeleteFavoriteCommand> validator)
        : base(validator)
    {
        _weatherCommandsRepository = Guard.Against.Null(weatherCommandsRepository);
    }

    protected override async Task<HandlerResponse<bool>> HandleValidRequestAsync(DeleteFavoriteCommand request, CancellationToken cancellationToken)
    {
        var deleteResult = await _weatherCommandsRepository.DeleteFavoriteLocationSafeAsync(request, cancellationToken);
        if (deleteResult.IsFailed)
        {
            return HandlerResponses.AsInternalError<bool>("Location was not deleted from database.");
        }

        return HandlerResponses.AsSuccess(true);
    }
}
```
The repository implementation, located in the **Infrastructure layer**, also contains other command operations. This helps keep **related logic together**, which is one of the reasons why CA generally suffers less from code duplication:

```csharp
internal sealed class WeatherCommandsRepository : RepositoryBase, IWeatherCommandsRepository
{
    private readonly ILogger<IWeatherCommandsRepository> _logger;
    public WeatherCommandsRepository(WeatherContext weatherContext, IMapper mapper, ILogger<IWeatherCommandsRepository> logger)
        : base(weatherContext, mapper) 
    {
        _logger = Guard.Against.Null(logger);
    }

    public async Task<Result<int>> AddFavoriteLocation(AddFavoriteCommand addFavoriteCommand, CancellationToken cancellationToken)
    {
        var locationEntity = _mapper.Map<FavoriteLocationEntity>(addFavoriteCommand.Location);
        try
        {
            await _weatherContext.FavoriteLocations.AddAsync(locationEntity);
            await _weatherContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(locationEntity.Id);
        }
        catch(DbUpdateException ex)
        {
            _logger.LogError(LogEvents.FavoriteWeathersStoreToDatabase, ex, "Can't add favorite locations into database.");
            return Result.Fail(ex.Message);
        }
    }

    public async Task<Result> DeleteFavoriteLocationSafeAsync(DeleteFavoriteCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var location = await _weatherContext.FavoriteLocations.FindAsync(command.Id, cancellationToken);

            if (location is null)
            {
                return Result.Fail($"Location with ID {command.Id} not found.");
            }
            _weatherContext.FavoriteLocations.Remove(location);
            await _weatherContext.SaveChangesAsync(cancellationToken);
            return Result.Ok();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(LogEvents.FavoriteWeathersStoreToDatabase, ex, "Can't delete location.");
            return Result.Fail(ex.Message);
        }
    }
}
```

---

While a **VSA handler can use abstractions similar to CA** (inside the slice rather than across layers), for small APIs this often does not make sense.

At the same time, **code duplication tends to be less of an issue in CA**, especially for shared domain and persistence logic. This is mainly due to its **strict separation of layers** and responsibilities, which encourages reuse across features.

### Pull Request Comparison

- **Clean Architecture (CA)**: [Pull Request](https://github.com/Gramli/WeatherApi/pull/2)
  - Files Changed: **27**
  - Lines changed: **348 additions** & **67 deletions**

- **Vertical Slice Architecture (VSA)**: [Pull Request](https://github.com/Gramli/WeatherApi-VSA/pull/1)
  - Files Changed: **15**
  - Lines changed: **260 additions** & **35 deletions**

Both **CA Weather API** and **VSA Weather API** are small APIs. However, even at this scale, one significant difference is immediately visible: **the number of touched files**.

#### CA Pull Request

In the CA example, nearly **twice as many files are modified** to introduce a single Delete endpoint. With so many touched files, there is always a higher risk of introducing bugs.

Additionally, because you have to go through all layers, development speed is generally slower. While it is always good to **follow SOLID principles** and maintain **optimal test coverage**, for CA this is essential, not just recommended.

#### VSA Pull Request

In the VSA example, most changes are localized within a single feature folder. Files outside the feature are touched only when necessary—for example, when sharing a common return type (which also exists in CA).

This localized change model significantly reduces the number of touched files, and because fewer abstractions were required, **development was much faster**.

However, as a project grows, **code duplication** can become a real concern in VSA. A common strategy is to extract shared logic into a domain or shared components layer, but this can lead to a large and unfocused domain. In my opinion, this situation also defeats one of the original goals of VSA: **simplicity and feature isolation**.

---

From the pull request comparison **implementation speed was clearly faster in VSA** thanks to editing only a single slice, whereas in CA I had to go through multiple layers and if a repository or some abstraction did not already exist in CA, I would still had to create them and implementation would be even slower.

### Unit Testing Comparison

#### CA Unit Testing
In **CA**, **unit testing is straightforward** due to the **high level of abstraction** and **clear separation of concerns**. Each component can be tested in isolation. 
The **downside is repetition**: similar test setups, mocks, and boilerplate code appear across many features. Fortunately, modern AI tooling can significantly reduce the manual effort required here.
 
```csharp
public class DeleteFavoriteHandlerTests
{
    private readonly Mock<IWeatherCommandsRepository> _weatherCommandsRepositoryMock;
    private readonly Mock<IValidator<DeleteFavoriteCommand>> _validatorMock;

    private readonly IDeleteFavoriteHandler _uut;
    public DeleteFavoriteHandlerTests()
    {
        _weatherCommandsRepositoryMock = new();
        _validatorMock = new();

        _uut = new DeleteFavoriteHandler(_weatherCommandsRepositoryMock.Object, _validatorMock.Object);
    }

    [Fact]
    public async Task InvalidRequest()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 5 };

        _validatorMock.Setup(x => x.IsValid(It.IsAny<DeleteFavoriteCommand>())).Returns(false);

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Single(result.Errors);
        _validatorMock.Verify(x => x.IsValid(It.Is<DeleteFavoriteCommand>(y => y.Equals(deleteFavoriteCommand))), Times.Once);
    }

    [Fact]
    public async Task DeleteFavoriteLocationSafeAsync_Failed()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 5 };

        _validatorMock.Setup(x => x.IsValid(deleteFavoriteCommand)).Returns(true);
        _weatherCommandsRepositoryMock.Setup(x => x.DeleteFavoriteLocationSafeAsync(deleteFavoriteCommand, CancellationToken.None))
            .ReturnsAsync(Result.Fail(string.Empty));

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.InternalServerError, result.StatusCode);
        Assert.Single(result.Errors);
        _validatorMock.Verify(x => x.IsValid(deleteFavoriteCommand), Times.Once);
        _weatherCommandsRepositoryMock.Verify(x => x.DeleteFavoriteLocationSafeAsync(deleteFavoriteCommand, CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task DeleteFavoriteLocationSafeAsync_Success()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 5 };

        _validatorMock.Setup(x => x.IsValid(deleteFavoriteCommand)).Returns(true);
        _weatherCommandsRepositoryMock.Setup(x => x.DeleteFavoriteLocationSafeAsync(deleteFavoriteCommand, CancellationToken.None))
            .ReturnsAsync(Result.Ok());

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        Assert.Empty(result.Errors);
        _validatorMock.Verify(x => x.IsValid(deleteFavoriteCommand), Times.Once);
        _weatherCommandsRepositoryMock.Verify(x => x.DeleteFavoriteLocationSafeAsync(deleteFavoriteCommand, CancellationToken.None), Times.Once);
    }
}
```

Because the `IWeatherCommandsRepository` implementation is not part of the handler, a fair comparison with VSA unit testing requires additional coverage at the repository level.
In other words, while the CA handler and repository are each easy to unit test, they require **separate test suites**. For small APIs, this additional overhead can feel like overkill. However, the approach scales well as complexity grows. I will not paste the test code here, but you can review it in the repository: [WeatherCommandsRepositoryTests](https://github.com/Gramli/WeatherApi/blob/main/src/Tests/UnitTests/Weather.Infrastructure.UnitTests/Database/Repositories/WeatherCommandsRepositoryTests.cs)

#### VSA Unit Testing

Unit testing in **VSA** depends heavily on **how the slice is implemented**. In this example, most of the logic resides in a single handler to keep the feature implementation simple.
While this approach is **acceptable for small features**, it does not scale well. As the project grows, testing such handlers becomes more complex, and test maintenance becomes harder, even with AI assistance. This **is not a limitation of VSA itself**, but my choice to avoid introducing abstractions where they are not yet justified.

For small features, this trade-off is often acceptable. For larger ones, it is not.


```csharp
public class DeleteFavoriteHandlerTests
{
    private readonly Mock<IValidator<DeleteFavoriteCommand>> _deleteFavoriteCommandValidatorMock;
    private readonly Mock<TestWeatherContext> _weatherContextMock;
    private readonly Mock<DbSet<FavoriteLocationEntity>> _favoriteLocationEntityDbSetMock;

    private readonly IRequestHandler<bool, DeleteFavoriteCommand> _uut;
    public DeleteFavoriteHandlerTests()
    {
        _deleteFavoriteCommandValidatorMock = new();
        var loggerMock = new Mock<ILogger<DeleteFavoriteHandler>>();
        _weatherContextMock = new();
        _favoriteLocationEntityDbSetMock = new();

        _uut = new DeleteFavoriteHandler(_deleteFavoriteCommandValidatorMock.Object, loggerMock.Object, _weatherContextMock.Object);
    }

    [Fact]
    public async Task InvalidRequest()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 1 };

        _deleteFavoriteCommandValidatorMock.Setup(x => x.IsValid(deleteFavoriteCommand)).Returns(false);

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);
        Assert.Single(result.Errors);
        Assert.False(result.Data);
    }

    [Fact]
    public async Task DeleteFavoriteLocationSafeAsync_Failed()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 1 };

        _deleteFavoriteCommandValidatorMock.Setup(x => x.IsValid(deleteFavoriteCommand)).Returns(true);

        _favoriteLocationEntityDbSetMock.Setup(x => x.FindAsync(It.IsAny<int>(), CancellationToken.None)).ThrowsAsync(new DbUpdateException());
        _weatherContextMock.Setup(x => x.FavoriteLocations).Returns(_favoriteLocationEntityDbSetMock.Object);

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.InternalServerError, result.StatusCode);
        Assert.Single(result.Errors);
        Assert.False(result.Data);
    }

    [Fact]
    public async Task DeleteFavoriteLocationSafeAsync_Success()
    {
        //Arrange
        var deleteFavoriteCommand = new DeleteFavoriteCommand { Id = 1 };

        _deleteFavoriteCommandValidatorMock.Setup(x => x.IsValid(deleteFavoriteCommand)).Returns(true);

        var favoriteLocation = new FavoriteLocationEntity();
        _favoriteLocationEntityDbSetMock.Setup(x => x.FindAsync(It.IsAny<int>(), CancellationToken.None)).ReturnsAsync(favoriteLocation);
        _favoriteLocationEntityDbSetMock.Setup(x => x.Remove(favoriteLocation));
        _weatherContextMock.Setup(x => x.FavoriteLocations).Returns(_favoriteLocationEntityDbSetMock.Object);

        //Act
        var result = await _uut.HandleAsync(deleteFavoriteCommand, CancellationToken.None);

        //Assert
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        Assert.Empty(result.Errors);
        Assert.True(result.Data);
    }

}
```
---
**Unit test development was faster in VSA**, primarily because the implementation is contained within a single slice.

For this small feature, the overall complexity of unit test implementation was roughly the same in both approaches. However, as features grow or additional behavior is added, the **complexity of test setup and maintenance in VSA will increase significantly**, especially when business logic and data access remain tightly coupled.

### Final Thoughts on New Delete Operation Comparison

**VSA** addresses one of the main pain points of CA: the need to touch multiple layers and a lot of abstractions for a single feature. However, this comes at the cost of an increased risk of code duplication and unit tests that are harder to implement, but again it depends on **how the slice is implemented**.

**CA** reduces duplication through layered reuse and well-defined abstractions, but this results in broader change impact and more repetitive work like unit testing or creating abstractions.

I would say that **CA layered approach** requires stronger architectural discipline, while **VSA simplicity** makes it more accessible to developers less familiar with complex patterns.

Neither approach is objectively superior. Problems arise when:

- VSA accumulates too much shared logic without proper structure
- CA introduces abstractions prematurely for trivial use cases

A practical solution is to combine the strengths of both.

## Hybrid Approaches

### 1. VSA as the Base Architecture

- Feature-based folder structure
- Features do not reference each other
- Abstractions are introduced only where complexity justifies them

This approach allows extremely lightweight features while accepting some duplication. Shared folders (e.g., `Common`, `Configuration`) may grow over time, but feature isolation remains strong.

### 2. CA as the Base Architecture

- Traditional layered structure
- Each layer contains feature-specific folders
- Strict separation and reuse are enforced

This approach minimizes duplication but requires touching multiple layers even for simple features. It also removes the ability to create very small features without structural overhead.

Both hybrids **reduce the weaknesses** of pure CA and pure VSA but do **not eliminate trade-offs entirely**. A conscious choice is still required.

## Conclusion

**Vertical Slice Architecture** is an excellent fit for small projects and CRUD-heavy APIs where simplicity, development speed, and minimal abstraction are more valuable than reuse. I will definitely use it for my next small or CRUD-focused API.

However, this does not mean that VSA does not work well for large projects, as slices can also contain deeper structures and a significant number of abstractions.

**Clean Architecture**, which I have used extensively in medium-sized systems (often in a hybrid approach where CA serves as the base architecture), remains a strong and proven choice. I believe Clean Architecture is better suited for projects with a lot of business logic, where abstractions and layers become a “friend” thanks to **clear structure** and **easier unit testing**.

Ultimately, the most important takeaway remains unchanged:

**The architecture of a project must be driven by the project’s needs, not by preference or trend.**

### Decision Matrix

| Criteria | VSA | CA | Hybrid |
|-----------|-----|-----|--------|
| **Project Complexity** | CRUD-heavy, simple business logic | Complex domain rules and business logic | Mixed: some simple, some complex features |
| **Development Speed Priority** | High - fast initial delivery | Moderate - slower initial setup | Balanced |
| **Code Duplication Tolerance** | Acceptable for simplicity | Minimize through layering | Controlled duplication |
| **Feature Independence** | Features are isolated | Shared domain logic across features | Varies by feature |
| **Long-term Maintainability** | Good for small scope | Excellent for evolving requirements | Good scalability path |
| **Testing Approach** | Integration tests more practical | Unit tests straightforward | Mixed strategy |
| **Team Experience** | Junior-friendly | Requires architectural discipline | Flexible to skill levels |
