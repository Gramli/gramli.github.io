---
layout: post
title: "Clean Architecture in .NET: Real-World Pros, Cons, and Trade-offs"
date: 2026-02-24
categories: [dotnet, architecture, dotnet, csharp, clean-architecture]
canonical_url: "https://dev.to/gramli/clean-architecture-in-net-real-world-pros-cons-and-trade-offs-3m9i"
---

*Posted 02/24/2026*
# Clean Architecture in .NET: Real-World Pros, Cons, and Trade-offs

I have experience with **Clean Architecture** across multiple projects, both when creating new applications and when maintaining existing ones. Based on this experience, I decided to write about the **pros and cons** of using Clean Architecture, **focusing on real-world examples** rather than repeating the same theoretical descriptions found in many articles on this topic.

## Table of Contents
- [Clean Architecture in .NET: Real-World Pros, Cons, and Trade-offs](#clean-architecture-in-net-real-world-pros-cons-and-trade-offs)
	- [Table of Contents](#table-of-contents)
	- [Pros](#pros)
		- [UI/Framework/Database Independence](#uiframeworkdatabase-independence)
			- [Independence in Practice](#independence-in-practice)
		- [Highly Testable](#highly-testable)
			- [Highly Testable In practice](#highly-testable-in-practice)
		- [Maintainability and Extensibility](#maintainability-and-extensibility)
			- [Maintainability in practice](#maintainability-in-practice)
			- [Extensibility in practice](#extensibility-in-practice)
		- [Clear Boundaries](#clear-boundaries)
			- [Clear Boundaries in practice](#clear-boundaries-in-practice)
		- [Scalability](#scalability)
			- [Scalability in Practice](#scalability-in-practice)
	- [Cons](#cons)
		- [Understanding and Complexity](#understanding-and-complexity)
			- [Understanding in practice](#understanding-in-practice)
		- [Heavy Structure](#heavy-structure)
			- [Heavy Structure in Practice](#heavy-structure-in-practice)
		- [Performance](#performance)
			- [Performance in Practice](#performance-in-practice)
		- [Initial Setup Time](#initial-setup-time)
			- [Initial Setup Time in practice](#initial-setup-time-in-practice)
		- [Data Model Duplication](#data-model-duplication)
			- [Duplication in Practice](#duplication-in-practice)
	- [Conclusion](#conclusion)

## Pros
The advantages of Clean Architecture go beyond theoretical principles. In practice, it improves maintainability, testability, and scalability, especially in applications with complex business logic. The following sections highlight **real-world examples** of how these benefits are realized in day-to-day development.

### UI/Framework/Database Independence
> *Business logic is kept at the core, enabling external frameworks and databases to be changed with minimal disruption.*

Many articles mention this advantage, but I think the **common explanation is misleading**. How often do you actually change the database, framework, or UI? Sure, the Core is independent of these layers, so in theory you could change them, but the real advantage is more specific:

Thanks to the Infrastructure layer and abstractions, you can **easily replace an external library** or **switch to a different external service** without touching the Core, because the implementation is hidden behind an abstraction and resides in the Infrastructure layer.

#### Independence in Practice
We had a requirement to read Excel files, so we chose a library and implemented the feature.

Later, the requirements changed and we needed to support password protected Excel files, which our original library could not handle. 

Because we followed Clean Architecture, the Excel library was used only in the Infrastructure layer. We were able to replace the library by updating that layer only, while the business logic in the Core layer remained unchanged.

---

### Highly Testable
> *Business logic in Clean Architecture is isolated from external concerns, making unit testing easy and straightforward.*

This benefit is straightforward and one of the strongest advantages of Clean Architecture. Thanks to **separation of concerns and extensive use of abstractions** you can **easily mock and test** every layer independently especially the Core layer.

#### Highly Testable In practice
This unit test demonstrates how Clean Architecture makes the system easy to test in isolation.

The request handler lives in the Core layer, because in a REST API the core application logic is implemented in request handlers and business services.

The handler depends only on abstractions:
- `IRequestValidator<T>`
- `IWeatherService`

Because these are interfaces, we can mock all dependencies in the test and fully control their behavior.

Although implementation of `IWeatherService` belongs to the Infrastructure layer and calls an external weather API, the handler does not depend on any HTTP client or third-party library directly. Thanks to this abstraction, the handler can be tested without making real HTTP calls.

As a result:
- The test is fast
- The test is deterministic
- All success and failure scenarios can be covered easily

```csharp
public class GetCurrentWeatherHandlerTests
{
	private readonly Mock<IRequestValidator<GetCurrentWeatherQuery>> _getCurrentWeatherQueryValidatorMock;
	private readonly Mock<IRequestValidator<CurrentWeatherDto>> _currentWeatherValidatorMock;
	private readonly Mock<IWeatherService> _weatherServiceMock;

	private readonly IStatusRequestHandler<CurrentWeatherDto, GetCurrentWeatherQuery> _uut;

	public GetCurrentWeatherHandlerTests()
	{
		_getCurrentWeatherQueryValidatorMock = new();
		_currentWeatherValidatorMock = new();
		_weatherServiceMock = new();

		_uut = new GetCurrentWeatherHandler(
			_getCurrentWeatherQueryValidatorMock.Object, 
			_currentWeatherValidatorMock.Object, 
			_weatherServiceMock.Object, 
			_loggerMock.Object);
	}

	[Fact]
	public async Task Success()
	{
		//Arrange
		var getCurrentWeatherQuery = new GetCurrentWeatherQuery(1, 1);
		var currentWeather = new CurrentWeatherDto();

		_getCurrentWeatherQueryValidatorMock.Setup(x => x.Validate(It.IsAny<GetCurrentWeatherQuery>())).Returns(new RequestValidationResult { IsValid = true });

		//Act
		var result = await _uut.HandleAsync(getCurrentWeatherQuery, CancellationToken.None);

		//Assert
		Assert.Equal(HandlerStatusCode.Success, result.StatusCode);
		_getCurrentWeatherQueryValidatorMock.Verify(x => x.Validate(It.Is<GetCurrentWeatherQuery>(y => y.Equals(getCurrentWeatherQuery))), Times.Once);
	}
}
```

---

### Maintainability and Extensibility
> *Clean Architecture provides a clear structure that keeps changes isolated and predictable, improving maintainability and extensibility.*

When Clean Architecture is followed together with SOLID principles **each part of the system has one clear responsibility** so when you are fixing a bug or implementing a new feature you are **working in isolated part** of the solution so you usually don’t break others.

#### Maintainability in practice
We had a bug related to user login.

Because responsibilities were clearly defined, we knew the issue belonged to the API layer, where the login endpoint and request handling logic live.

We were able to quickly locate the relevant code, fix the bug, and deploy the change without affecting other parts of the system.

#### Extensibility in practice
We needed to add a new endpoint for fetching data from the database.

Following Clean Architecture:
- I added a new endpoint in the API layer
- Created a new handler in the Core layer to handle the use case
- Implemented a new query in the Infrastructure layer to access the database through a repository

No existing logic had to be modified, and the structure made it obvious where each piece of code belonged.

---

### Clear Boundaries
> *Establishes well-defined boundaries between components, which helps teams divide work effectively.*

**Each part of the system has a clear responsibility** and components communicate through well defined abstractions. As a result, critical changes in the Infrastructure layer do not necessarily impact the Core layer for example.

#### Clear Boundaries in practice
We were integrated with an external service that was part of a very old legacy system. 

Over time, the team owning that service rewrote it using a new technology stack and the entire communication contract changed. As a result, we had to adapt our system to work with the new contract.

All of the changes were done in the Infrastructure layer, where integration and communication with the external service are handled.  
The Core layer, which contains business rules and data processing logic, was not modified at all.

---

### Scalability
> *Clean Architecture promotes scalability by keeping functionality modular, making it easier to adapt or extract parts of the system when necessary.*

Clean Architecture’s modular structure and use of abstractions make it easier to extract parts of the system and **scale them independently** from the rest of the application.

#### Scalability in Practice
We were using a legacy library to generate large DOC, PDF, and Excel files, but it consumed a significant amount of memory and did not release resources properly. In some cases, we even had to call `GC.Collect` explicitly to avoid memory pressure.

To address this, we decided to move file generation into a separate microservice that encapsulates this library and handles document generation independently.

Thanks to Clean Architecture and its modular design, we were able to reuse the existing file generation code and move it into the new microservice without changing the Core layer.

---

## Cons
While Clean Architecture offers many benefits, it is not without drawbacks. In reality, the added structure, abstractions and layer separations can introduce **complexity, additional boilerplate and upfront development overhead**. The next sections explore these challenges with concrete examples from real projects.

### Understanding and Complexity
> *Understanding the architecture can be challenging, especially for developers or teams unfamiliar with it.*

Deciding how to **split responsibilities** and **assign code to the correct layer** often requires **experience and careful reasoning**, not just following dependencies or namespaces.

#### Understanding in practice
Let’s look at the example below. All referenced dependencies implementations `IDataCommandRepository` and `IAuditLogger` come from the Infrastructure layer. Because of this, many developers might assume that `DataService` should also belong to the Infrastructure layer.

However, this class actually **contains business logic**:

- It decides how data would be updated (setting `State`)
- It applies business rules (ignoring empty input)
- It coordinates persistence and auditing as part of a business operation

For these reasons, `DataService` belongs in the Core layer, even though it depends on abstractions that are implemented in Infrastructure layer.

This example highlights one of the main challenges of Clean Architecture: **layer placement is determined by responsibility and intent**. Understanding this distinction often takes time and experience.

```csharp
internal sealed class DataService : IDataService
{
	private readonly IDataCommandRepository _dataCommandRepository;
	private readonly IAuditLogger _auditLogger;

	public async Task<Result> FinishDataSafeAsync(IReadOnlyCollection<int> dataIds, CancellationToken cancellationToken)
	{
		if(dataIds is null || !dataIds.Any())
		{
			return Result.Ok();
		}

		var updateCommands = dataIds.Select(x => new UpdateDataCommand{
			Id = x,
			State = DataState.Finish,
		});

		var updateResult = await _dataCommandRepository.UpdateDataSafeAsync(updateCommands, cancellationToken);

		if(updateResult.IsFailed)
		{
			return Result.Fail("Update data failed.").WithErrors(updateResult.Errors);
		}

		_auditLogger.Log(updateCommands);

		return Result.Ok();
	}
}
```

---

### Heavy Structure
> *Clean Architecture enforces a strict layered structure and extensive use of abstractions.*

While this improves long-term maintainability, it also introduces **significant boilerplate and ceremony**, which can feel excessive for small or simple applications, especially basic CRUD based applications.

#### Heavy Structure in Practice
In Clean Architecture, even a simple CRUD operation often requires changes across multiple layers:

- Creating an endpoint in the API layer
- Implementing a handler or use case in the Core layer
- Adding a repository method in the Infrastructure layer
 
Now imagine that the controller, Minimal API file or repository class does not exist yet, you first have to create all of them before implementing the actual functionality.

On top of that, if you enforce code coverage standards, you also need to write unit tests for these components.

As a result, a very **simple CRUD operation** can require a **large amount of code** and setup, which may feel unnecessarily heavy for straightforward use cases.

---

### Performance
> *The layered structure and extensive use of abstractions may cause minor performance overhead compared to simpler, more direct architectures.*

The additional layers of abstraction in Clean Architecture can introduce slight performance overhead due to increased indirection and mapping between layers. While this is rarely an issue for most business applications, performance critical systems may require careful optimization.

#### Performance in Practice
Let’s look at a performance critical CRUD endpoint in a .NET application.

For every request, a deep call stack is executed involving multiple allocations:
- The `RequestHandler` resolves `IValidator` and `IRepository`.
- The `Repository` resolves `IConnectionProvider` and `IMapper`.
- Data is mapped from `DataEntity` (Infrastructure) to `Data` (Core).

Each step is small, but collectively they introduce extra allocations, method calls, and indirection compared to a more direct approach. In high-throughput scenarios, this additional overhead can become noticeable under load.
```csharp
internal sealed class RequestHandler : IRequestHandler
{
	private readonly IValidator _validator;
	private readonly IRepository _repository;

	public RequestHandler(IValidator validator, IRepository repository)
	{
		_validator = validator;
		_repository = repository;
	}

	public async Task<Result<IEnumerable<Data>>> HandleAsync(
		Request request, 
		CancellationToken cancellationToken)
	{
		if (!_validator.IsValid(request))
		{
			return Result.Fail("Invalid request");
		}

		return await _repository.GetDataSafeAsync(request, cancellationToken);
	}
}
```

```csharp
internal sealed class Repository : IRepository
{
	private readonly IConnectionProvider _provider;
	private readonly IMapper _mapper;

	public Repository(IConnectionProvider provider, IMapper mapper)
	{
		_provider = provider;
		_mapper = mapper;
	}

	public async Task<Result<IEnumerable<Data>>> GetDataSafeAsync(
		Request request, 
		CancellationToken cancellationToken)
	{
		try
		{
			using var connection = _provider.GetOpenedConnection();
			var data = await connection.ExecuteQueryAsync<DataEntity>(...);
			return Result.Ok(_mapper.Map<Data>(data));
		}
		catch (DbException)
		{
			return Result.Fail("Database command failed");
		}
	}
}
```

> **NOTE:** In practice, this downside is **arguably negligible for 99% of business applications**. For most I/O bound web APIs, database latency far outweighs the cost of a few extra interface allocations.

---

### Initial Setup Time
> *Clean Architecture requires a significant upfront investment in structure, abstractions, and conventions*

Before delivering visible features, teams must **define layers, interfaces, dependency rules and project organization**, which can slow down early development, especially for greenfield projects.

#### Initial Setup Time in practice
We started a greenfield application with heavy business logic and the initial development phase was noticeably slow. Every new feature required creating a full structure: Minimal API endpoints, application handlers, business services, repositories and external proxy services.

Because these were new features, we had to introduce new abstractions and classes for almost every layer. Additionally, to maintain a minimal level of quality, we implemented unit tests for each component.

As a result, **progress in the early stages felt slow**, even though the architecture paid off later as the system grew.

---

### Data Model Duplication
> *Strict separation of concerns often leads to duplicating similar data structures across layers, increasing the maintenance burden.*

To keep the Core layer independent of the Database and the UI, you normally cannot use the same class for all three. This **forces you to create separate classes for Database Entities, Domain Models, and API DTOs,** even if they look almost identical.

#### Duplication in Practice
In a previous project, we had a `User` object. To follow Clean Architecture strictness, we had:
- `UserEntity` (Infrastructure for fetching data from the database)
- `User` (Core, rich domain model)
- `UserDto` (API, exposed to clients)

Every time we added a new field like `PhoneNumber`, we had to:
1. Add it to all three classes.
2. Update the mapper from Infrastructure to Core.
3. Update the mapper from Core to API.

This "mapping tax" consumed a lot of development time for fields that were just being passed through the system without valid business logic. However, **this does not apply to all cases**, in many scenarios only `UserEntity` and `UserDto` are sufficient.

---

## Conclusion

Clean Architecture is **not a silver bullet**, and it shouldn't be the default choice for every single project.

If you are building a **small operational tool, a POC or a simple CRUD application**, the overhead of Clean Architecture will likely slow you down without providing much value. In these cases, a simpler approach like **Vertical Slice Architecture** or a straightforward layered monolith is often a better fit.

However, for **complex, long-lived enterprise systems** where business rules change frequently and technology needs to evolve, Clean Architecture is an invaluable investment. The initial cost of setup and boilerplate pays dividends in the form of a system that is testable, adaptable, and resistant to rot over time.

**The key is to understand the trade-offs.** Don't adopt it blindly because it's popular, adopt it when your problem domain is complex enough to warrant the solution.
