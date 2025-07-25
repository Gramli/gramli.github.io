*Posted 07/25/2025*

# shareReplay
https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay

idealni pro cachovani staticky dat jako ciselniky. Daji se tim omezit zbytecna volani na BE.
Pouziti:

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

Pri tomto nastaveni se get zavola pri prvnim subscribe (subscribe na getContractInstructionDetailOptions()) a pri kazdem dalsim se pouzije zacechovana hodnota a pouziva se tak dlouho dokud zije service. shareReplay se da samozdrejme nakonfigurovat vice zpusoby.