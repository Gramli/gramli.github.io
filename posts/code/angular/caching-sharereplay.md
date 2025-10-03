*Posted 07/25/2025*

# shareReplay
[sharereplay](https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay) - caches the latest emitted value from an observable so multiple subscribers can share it without triggering multiple backend calls.

A simple way to cache data, ideal for static values like enums. When the frontend needs this data, it doesn’t have to call the backend every time the page is visited — it can get it from the cache.

**Example:**

```ts
export class ContractInstructionService {
  private userOptions: Observable<UserOptions>;

  constructor(private httpClient: HttpClient) {

    this.contractInstructionDetailOptions = this.httpClient
      .get<UserOptions>('/v1/user/')
      .pipe(shareReplay());
  }

  getContractInstructionDetailOptions() {
    return this.userOptions;
  }
```

When shareReplay is used like in the example above:
- The backend is called only on the first subscription to getContractInstructionDetailOptions().
- Subsequent calls return the cached value.
- The cached value persists as long as the ContractInstructionService instance exists.