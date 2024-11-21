*Posted 11/19/2024*
# Redefine property of mock object

Create Mock Object with properties and then redefine them using **Object.defineProperty** like this:

```typescript
    Object.defineProperty(authService, 'isCurrentlyAuthenticated', { get: () => false });
    Object.defineProperty(authService, 'isAuthenticated', { get: () => of(false) });
```

### Full example

```typescript
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { UserAuthenticationService } from './user-authentication-service';


describe('UserService', () => {
  let authService: jasmine.SpyObj<UserAuthenticationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: UserAuthenticationService, useValue: { isAuthenticated: of(true), isCurrentlyAuthenticated: true, } },
      ],
    });

    authService = TestBed.inject(UserAuthenticationService) as jasmine.SpyObj<UserAuthenticationService>;

  });

  it('redefine property mock test', () => {
    Object.defineProperty(authService, 'isCurrentlyAuthenticated', { get: () => false });
    Object.defineProperty(authService, 'isAuthenticated', { get: () => of(false) });

    TestBed.inject(UserService);

    expect(authService.isCurrentlyAuthenticated).toBe(false);
  });
});

```