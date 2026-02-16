---
layout: post
title: "Angular: Stop Overusing ChangeDetectorRef"
date: 2026-01-16
categories: [angular, architecture, typescript]
canonical_url: "https://dev.to/gramli/angular-stop-overusing-changedetectorref-33oa"
---

*Posted 11/26/2025*

# Angular: Stop Overusing ChangeDetectorRef

In Angular development, we often run into **change detection issues**, for example when some **fields are not updated properly** in the template. At that point, we need to investigate where the problem is, and since AI is now part of our day-to-day work, we often use it to help identify the root cause.

However, I have observed many times that **Copilot suggests** using **detectChanges()** or **markForCheck()** as a quick fix for various problems. In most cases, these methods **do not solve the root cause**. The actual issue is usually an incorrect data flow between components or poor architecture. These methods should be used only in specific situations — definitely not as a workaround for misunderstanding or overusing the `OnPush` change detection strategy.

## Understanding Change Detection Strategies
Before examining anti-pattern examples, let's clarify what these methods do and how Angular's change detection strategies work.

- **[ChangeDetectorRef.detectChanges()](https://angular.dev/api/core/ChangeDetectorRef)** - runs change detection immediately for current component and its children.
- **[ChangeDetectorRef.markForCheck()](https://angular.dev/api/core/ChangeDetectorRef)** - explicitly marks the view as changed so that it can be checked again in next detection cycle.

**ChangeDetectionStrategy.Default:** Angular checks every component on every change detection cycle.
**ChangeDetectionStrategy.OnPush:** Angular only checks a component when:
- An @Input reference changes
- An async pipe receives a new value
- An event is triggered from the template
- When `detectChanges()` or `markForCheck()` is triggered

>NOTE: When talking about change detection, it is also important to mention `zone.js`. Angular's `zone.js` library automatically triggers change detection after async operations like setTimeout, HTTP requests, and event handlers. This means manual `detectChanges()` is rarely needed.

## Common Anti-patterns
Let’s look at some simple examples of anti-pattern involving `detectChanges()` and `markForCheck()`.

### detectChanges()
```typescript
@Component({
  selector: 'app-user',
  template: '<div>{{ user?.name }}</div>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UserComponent {
  @Input() user: User | undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  // ❌ WRONG: Mutating @Input and calling detectChanges()
  updateUser(user: User) {
    this.user = user;
    this.cdr.detectChanges(); // Doesn't fix the architecture problem
  }
}
```
There are two problems here. First, the `user` should be updated via `@Input()` from the parent component, not through an internal `updateUser` method. Second, calling `detectChanges()` is unnecessary because Angular should detect the change automatically. Both issues indicate that something is wrong with the component architecture.

```typescript
@Component({
  selector: 'app-data',
  template: '<div>{{ data }}</div>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataComponent {
  data = '';

  constructor(
    private service: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  // ❌  WRONG: Using detectChanges() instead of fixing data flow
  loadData() {
    this.service.getData().subscribe(result => {
      this.data = result;
      this.cdr.detectChanges();  // Workaround for bad architecture
    });
  }
}
```

In this example, `detectChanges()` is used inside a subscribe. Again, Angular should detect the change automatically. If you need this kind of workaround, it is usually a sign that something is wrong with data flow or architecture.

### markForCheck()
```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() users: User[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  // ❌ WRONG: ARCHITECTURE with OnPush strategy, inputs should be changed outside the component in parent
  addUser(user: User) {
    this.users.push(user);
    this.cdr.markForCheck(); 
  }
}
```
In this example, `ChangeDetectionStrategy.OnPush` is used, but the component mutates the users input internally and then calls `markForCheck()`. This is a poor architecture. With `OnPush`, inputs should be treated as immutable and replaced with new references by the parent component.

```typescript
// ❌ WRONG: OnPush component should receive data via inputs
@Component({
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div>{{ user.name }}</div>'
})
export class UserComponent {
  user: User = { name: 'John', age: 30 };  

  constructor(private service: UserService, private cdr: ChangeDetectorRef) {
    this.service.userNameChanged$.subscribe(userName => {
      this.user.name = userName;
      this.cdr.markForCheck();
    });
  }
}
```
In the example above, we again use `markForCheck()` together with `ChangeDetectionStrategy.OnPush`. Because the `user` is not changing in template, `markForCheck()` is used to force an update. However, a more appropriate solution would be to make `user` an input and update it from the parent component.

`OnPush` works best when components are driven by immutable inputs and unidirectional data flow. Of course, there are valid cases where `markForCheck()` can be used with `ChangeDetectionStrategy.OnPush`. However, if you find yourself calling `markForCheck()` frequently, it is a good time to reconsider whether `OnPush` is the right choice.

## Conclusion
`ChangeDetectorRef` is a powerful tool, but relying on it frequently signals architectural problems. Both `markForCheck()` and `detectChanges()` often mask underlying issues rather than solving them.

Instead, focus on proper data flow: use the `async` pipe for observables, maintain immutability with `OnPush`, and ensure components receive new references when data changes. If you find yourself calling these methods regularly, it's time to step back and redesign your data flow.

As a final piece of advice, treat AI suggestions involving `ChangeDetectorRef` as a starting point, **not a final answer**.  While `ChangeDetectorRef` can in **specific cases solve real problems**, you should always **pause and double-check** whether the issue actually lies in your data flow or component design.