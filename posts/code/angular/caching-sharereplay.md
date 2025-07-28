*Posted 07/25/2025*

# shareReplay
https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay

Simple way to cache data, ideal for static values like enums for example. When Frontend needs this data it doesnt have to call it every time it steps to page but get it from cache.
Example:

```ts
export class ContractInstructionService {
  private contractInstructionDetailOptions: Observable<IContractInstructionDetailOptions>;

  constructor(private hv2ApiHttpClientProxy: Hv2ApiHttpClientProxy) {

    this.contractInstructionDetailOptions = this.hv2ApiHttpClientProxy
      .get<IContractInstructionDetailOptions>('/v1/contractInstruction/detail/options')
      .pipe(map((response: DataResponse<IContractInstructionDetailOptions>) => response.data))
      .pipe(shareReplay());
  }

  getContractInstructionDetailOptions() {
    return this.contractInstructionDetailOptions;
  }
```

When shareReplay is set like code above, backend is called when first subcribe is created on getContractInstructionDetailOptions() function then every getContractInstructionDetailOptions call returns value from cache. Cached value lives as long as ContractInstructionService lives.