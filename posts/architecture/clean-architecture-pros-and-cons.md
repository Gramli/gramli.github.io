### Clean Architecture
#### Pros
- **UI/Framework/Database Independent** 
	- business logic is in the middle so framework, database (any external layer) can be easily changed without major impacts
- **Highly Testable** 
	- clean architechture is designed for testing, for example business logic can be tested without touching any external layer/element like database, UI, external web service etc.
	- easy to mock because of abstractions
- **Maintain and Extensibility**
	- thanks to defined structure, changes has isolated impact and together with SOLID principles it's easy to maintain

#### Cons
- **Understanding**
	- sometimes it's hard to split responsibilities or select right layer for our new code 
- **Heavy Structure**
	- it can be overkill to use it for simple CRUD api beacuse of lot of boilerplate code 

**[Clean Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#clean-architecture)**