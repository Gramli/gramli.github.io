*Posted 09/222025*

# Angular: Custom Multi-File Translation Loader for ngx-translate

In the Angular ecosystem, many projects use [@ngx-translate](https://ngx-translate.org/) for runtime translations, especially when dynamic language switching is required. As a project grows a single translation JSON file can become **very large**. A logical solution is to split it into **multiple JSON files**, which improves both maintainability and readability.

There is already a library that supports loading multiple translation files: [ngx-translate-multi-http-loader](https://www.npmjs.com/package/ngx-translate-multi-http-loader). However, because the required functionality is relatively small (approximately 30 lines of code), implementing a custom loader can be a **reasonable alternative** when **minimizing dependencies** or maintaining compatibility with the latest Angular versions.

## Implementation of MultiTranslateHttpLoader
First, we implement our multi-file translation loader. This is fairly straightforward: we implement the `TranslateLoader` abstract class from `@ngx-translate/core` and provide the logic for the `getTranslation` function.

```ts
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    public resources: { prefix: string; suffix: string }[]
  ) {}

  public getTranslation(lang: string): Observable<any> {
    return forkJoin(
      this.resources.map((config) =>
        this.http.get(`${config.prefix}${lang}${config.suffix}`).pipe(
          catchError((error) => {
            /*your error handling logic per resource*/
            console.error(`Could not load translations for lang: ${lang}`, error);
            return of({});
          })
        )
      )
    ).pipe(map((response) => Object.assign({}, ...response)));
  }
}
```

The core of the implementation relies on `forkJoin`, from [rxjs](https://rxjs.dev/) library, it executes all HTTP requests in parallel and emits a single combined result once all requests complete successfully. Because each request handles its own errors, a failure in one translation file does not terminate the entire stream.

> NOTE: With `Object.assign({}, ...response)` when multiple files contain the same translation key, values from later resources in the configuration array override earlier ones. Since `Object.assign` performs a shallow merge, overlapping nested objects will be completely replaced rather than merged, so ensure your **translation files don't share the same top-level keys**.

## Folder Structure
Before configuring the loader, let’s define a simple folder structure that will be used in the examples below. We have a main `en.json` file in the `i18n` folder and another `en.json` file in the `shared` folder:

```
i18n
├── en.json
└── shared
    └── en.json
```

> NOTE: In older Angular versions, translation files are typically stored in the `/src/assets/i18n` folder. Projects generated with Angular 18+ may use the `public` folder by default instead of `assets`.

## Configuration
You can choose between two configuration approaches: using `forRoot` for a **module-based** application or `provideTranslateService` for **standalone components**.

###  Module Approach

In `AppModule`, configure the loader by providing `TranslateLoader`, specifying `useFactory` with the `HttpLoaderFactory` function, and declaring `HttpClient` as a dependency. 
The `HttpLoaderFactory` function creates a new `MultiTranslateHttpLoader` instance. In its constructor, we define the folders (via prefix) and the file extension (via suffix). At runtime, the loader downloads all translation files matching this configuration for example, the global `en.json` file as well as the `en.json` file from the `shared` folder.

```ts
import { AppComponent } from './app.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from './translate/multi-translate-http-loader';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) : TranslateLoader {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './assets/i18n/shared/', suffix: '.json' }
  ]);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
...
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    }),
...
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

###  Standalone Approach
For the standalone approach, update your `appConfig` and use the `provideTranslateService` function to configure the loader.
The prefix configuration in the `HttpLoaderFactory` function differs slightly for this standalone approach because newer Angular projects (18+) serve translation files from the `public` folder rather than the traditional `assets` directory.

```ts
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from './multi-translate-http-loader';
import { HttpClient, provideHttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) : TranslateLoader {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './i18n/', suffix: '.json' },
    { prefix: './i18n/shared/', suffix: '.json' }
  ]);
}

export const appConfig: ApplicationConfig = {
    providers: [
...
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    })
    ],
};
```
 
## Conclusion
This approach provides a straightforward way to implement a **custom translation loader** that supports multiple translation files. One important consideration is that during the initial application load, **multiple translation files will be downloaded** according to the configured resources. This represents a **trade-off**: improved **readability and maintainability** of translation files versus a potentially **higher initial load cost**. In practice, this trade-off is often acceptable, especially in larger applications where translation files are organized by feature or domain.