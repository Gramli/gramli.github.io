*Posted 09/22/2025*

When a project grows, the translation JSON file can become very large. A logical solution is to split it into multiple JSON files, which improves both maintainability and readability. However, in that case, you need to implement your own way of loading multiple files. Here’s how you can split large translation files into smaller, feature-specific files and still load them all with @ngx-translate using Angular module approach.

## Example Structure
src  
-- /assets  
---- /i18n  
------ en.json  
------ /shared  
-------- en.json  

## Configuration
```ts

export function HttpLoaderFactory(http: HttpClient) : TranslateLoader {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './assets/i18n/shared/', suffix: '.json' }
  ]);
}


@NgModule({
  declarations: [AppComponent, SelectExtensionModalComponent],
  imports: [
...
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      lang: 'en',
      fallbackLang: 'en'
    }),
...
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Implementation of MultiTranslateHttpLoader
```ts
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    public resources: { prefix: string; suffix: string }[]
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return forkJoin(
      this.resources.map(config =>
        this.http.get(`${config.prefix}${lang}${config.suffix}`)
      )
    ).pipe(
      map(response => response.reduce((acc, obj) => ({ ...acc, ...obj }), {}))
    );
  }
}
```