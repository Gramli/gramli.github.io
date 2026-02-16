---
layout: post
title: "Angular: HTTP Caching with RxJS shareReplay"
date: 2026-02-16
categories: [angular, rxjs, performance, caching]
canonical_url: "https://dev.to/gramli/angular-http-caching-with-rxjs-sharereplay-3mm0"
---

*Posted 07/25/2025*

# Angular: HTTP Caching with RxJS shareReplay

At some point in every Angular application repeated HTTP calls start to hurt, slower page loads, unnecessary backend load, and wasted network traffic.

The obvious solution is **caching**. But in Angular, caching is not just about storing data, it’s about **managing observables correctly**.

Done wrong, it leads to duplicate requests, stale data, or permanently cached errors. Done right, it eliminates redundant calls entirely.


## A Naive Caching Approach
The simplest way to cache data in Angular, without knowing much about RxJS, is to use a field in a service class:
```ts
@Injectable({
  providedIn: 'root',
})
export class AppService {
  private vehiclesDataCache: VehiclesApiResponse | null = null;

  constructor(private http: HttpClient) {}

  public getVehiclesData(): Observable<VehiclesApiResponse> {
    if (this.vehiclesDataCache) {
      return of(this.vehiclesDataCache);
    }

    const observable = this.http.get<VehiclesApiResponse>(
      'https://starwars-databank-server.vercel.app/api/v1/vehicles',
    );
    observable.subscribe((response: VehiclesApiResponse) => {
      this.vehiclesDataCache = response;
    });
    return observable;
  }
}
```

Although this solution works, it is not very elegant and has several problems:
- If `getVehiclesData()` is called multiple times before the first request completes, each call triggers a new HTTP request instead of sharing the in-flight one.
- The code subscribes manually and **never unsubscribes**, which can lead to **memory leaks**.

## A Better Solution: shareReplay

Angular applications rely heavily on **RxJS** and RxJS provides a much cleaner solution: the `shareReplay` operator.

`shareReplay` is an **RxJS operator** designed to cache the latest emitted value from an observable so that multiple subscribers can share it without triggering multiple backend calls.

> [sharereplay](https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay) *- Share source and replay specified number of emissions on subscription.*

This makes it ideal for caching relatively static data such as enums, configuration values, or reference data. Once the frontend has fetched this data, it doesn’t need to call the backend again on every page visit.

**Basic Example:**
The most basic use of `shareReplay` looks like this:

```ts
@Injectable({
  providedIn: 'root',
})
export class AppService {

  private vehiclesDataShareReplay$: Observable<VehiclesApiResponse> | null = null;

  constructor(private http: HttpClient) {}

  public getVehicleShareReplay(): Observable<VehiclesApiResponse> {
    if (!this.vehiclesDataShareReplay$) {
      this.vehiclesDataShareReplay$ = this.http
        .get<VehiclesApiResponse>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
        .pipe(shareReplay(1));
    }
    return this.vehiclesDataShareReplay$;
  }
}
```

This caches the last emitted value (`shareReplay(1)`). The subscription to the source (`HttpClient`) remains active until the request completes. This is the most common pattern for caching HTTP requests in Angular services.

However, while this approach looks correct, **it hides a subtle issue**.

## The "Cached Error" Problem

A common pitfall with `shareReplay` is that it also **caches errors**. If the HTTP request fails, every future subscriber will immediately receive the same error, and no new HTTP request will ever be made.

A typical solution is to use `retry` and `catchError` before `shareReplay`:
```ts
@Injectable({
  providedIn: 'root',
})
export class AppService {

  private vehiclesDataShareReplay$: Observable<VehiclesApiResponse> | null = null;

  constructor(private http: HttpClient) {}

  public getVehicleShareReplay(): Observable<VehiclesApiResponse> {
    if (!this.vehiclesDataShareReplay$) {
      this.vehiclesDataShareReplay$ = this.http
        .get<VehiclesApiResponse>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
        .pipe(
          retry(2),
          catchError((error) => {
            this.vehiclesDataShareReplay$ = null;
            return throwError(() => error);
          }),
          shareReplay(1),
        );
    }
    return this.vehiclesDataShareReplay$;
  }
}
```

In this example, `retry(2)` means the request is attempted up to three times in total. If all attempts fail, `catchError` resets the cached observable before the error is replayed.

## Cache with Refresh
The biggest limitation of `shareReplay(1)` is that the **cached data can become stale**. In some scenarios, you want to refresh the data while still benefiting from caching.

A common solution is the “cache with refresh” pattern using a `BehaviorSubject` and `switchMap`:

```ts
@Injectable({
  providedIn: 'root',
})
export class AppService {

  private vehiclesDataBehavior$: Observable<VehiclesApiResponse> | null = null;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  public getVehicleBehavior(): Observable<VehiclesApiResponse> {
    // 1. Check if we already created this observable
    if (!this.vehiclesDataBehavior$) {
      // 2. Create the observable (only once)
      this.vehiclesDataBehavior$ = this.refreshTrigger$.pipe(
        // 3. Listen to refresh trigger
        switchMap(() =>
          // 4. When trigger fires, make HTTP request
          this.http
            .get<VehiclesApiResponse>('https://starwars-databank-server.vercel.app/api/v1/vehicles')
            .pipe(
              // 5. If request fails, retry 2 times
              retry(2),
              // 6. If still fails after retries, catch error
              catchError((error) => {
                console.error('Error fetching vehicles:', error);
                return EMPTY;
              }),
            ),
        ),
        // 7. Cache the most recent successful HTTP response and replay it to all current and future subscribers
        shareReplay(1),
      );
    }
    // 8. Return the cached observable
    return this.vehiclesDataBehavior$;
  }

  public refreshVehiclesBehavior(): void {
    // Trigger a new fetch by calling next() on the BehaviorSubject
    this.refreshTrigger$.next(undefined);
  }
}
```

In this example, the `BehaviorSubject` triggers an HTTP request whenever `next()` is called. The `switchMap` ensures that if a refresh is triggered while a request is still in flight, the previous request is canceled and replaced with a new one.

However, let’s take a closer look at **error handling in this pattern**. We cannot simply reset the cached observable and rethrow the error like this:
```ts
catchError((error) => {
  this.vehiclesDataShareReplay$ = null;
  return throwError(() => error);
})
```
When `throwError()` is called inside `switchMap`, **it completes the entire stream**. Once completed, the stream is **dead forever**. Any future calls to `next()` on the `BehaviorSubject` will have no effect, because there is no longer an active subscription. Setting `vehiclesDataBehavior$ = null` does not revive the stream, the observable pipeline has already terminated.

That's why we use `EMPTY` instead. When an error occurs, `EMPTY` completes the inner observable without emitting a value. Since there's no value to emit, the outer stream stays alive and listening to the `BehaviorSubject`. This means:

- **Subscribers are NOT notified of the error** – they retain the last successful cached value
- **The refresh mechanism stays active** – users can trigger another fetch with `refreshVehiclesBehavior()`
- **Trade-off**: Users see stale data instead of an error message, which may or may not be desirable depending on your use case.

If you prefer to notify subscribers of errors instead, you'd need a different approach (e.g., `Subject<VehiclesApiResponse | Error>` to explicitly model both success and failure states).

## Choosing the Right `shareReplay` Configuration

To avoid memory leaks, it’s important to understand how different `shareReplay` configurations affect subscriptions and memory usage.

### 1. `shareReplay()` - no arguments
- **Buffer**: Caches all emitted values (infinite buffer).
- **Subscription**: Stays active until the source completes, even if there are no subscribers.
-  **Use Case**: Suitable only for finite streams where you need the full emission history.

### 2. `shareReplay(1)` - buffer size only
This is the most common usage for HTTP requests.
- **Buffer**: Caches the last emitted value.
- **Subscription**: Remains active until the source completes.
- **Use Case**: Ideal for global singleton data fetched once and reused across the app.

### 3. `shareReplay({ bufferSize: 1, refCount: true })`
`refCount: true` is better for streams where you want cleanup when nobody's listening (WebSockets, timers), not necessarily for component-level data.
- **Buffer**: Caches the last emitted value.
- **Subscription (Magic of `refCount`)**: Automatically unsubscribes from the source when the subscriber count drops to zero.
- **Use Case**: Recommended for long-lived or infinite streams (e.g., WebSockets), or when you want cached data to reset when users leave a feature.

## When NOT to Use `shareReplay`

While `shareReplay` is powerful, it's inappropriate for:

- **User-specific data**: Risk of showing cached data from one user to another
- **Real-time data**: Stock prices, live scores, etc. need fresh data on every request
- **Large payloads**: Caching large responses increases memory footprint
- **Security-sensitive data**: Ensure proper cache invalidation on logout

## Conclusion

Caching in Angular is not just about improving performance, but also about **controlling side effects, avoiding duplicate work, and managing application state predictably**.

`shareReplay` provides a powerful and elegant way to cache HTTP responses, but it must be used with a clear understanding of its behavior:
- `shareReplay(1)` is ideal for global, static data that rarely changes.
- **Error handling is mandatory**, otherwise failures can be permanently cached.
- **Stale data requires an explicit refresh strategy**, such as a BehaviorSubject combined with switchMap.
- `refCount` matters when dealing with long-lived or infinite streams and component lifecycles.

There is no single “correct” configuration for `shareReplay`. The right approach depends on **how long the data should live, who consumes it, and whether it needs to be refreshed**.

When used deliberately, `shareReplay` can eliminate redundant HTTP calls, simplify state management, and significantly improve application performance, without introducing hidden bugs or memory leaks.

A working example project is available in my 📁 **[GitHub repository](https://github.com/Gramli/Gramli.Framework/tree/main/src/angular-shareReplay)**