*Posted 11/26/2025*

# Overusing ChangeDetectorRef

- **[ChangeDetectorRef.detectChanges()](https://angular.dev/api/core/ChangeDetectorRef)** - runs change detection immediately.
- **[ChangeDetectorRef.markForCheck()](https://angular.dev/api/core/ChangeDetectorRef)** - schedules the component to be checked later by Angular.

Copilot often suggests using **detectChanges()** or **markForCheck()** as a quick fix for various problems. However, in most cases, these methods do not solve the root cause. The actual issue is usually an incorrect data flow between components or bad architecture.   These methods should be used only in special situations — definitely not as a workaround for misunderstanding or overusing the OnPush change detection strategy.

A good analogy is calling GC.Collect() in C#: **it should be a rare, special-case tool, not something you rely on every day**.

## Key Points
* ChangeDetectorRef is powerful — but leaning on it often means your architecture needs improvement. 
* These methods tend to hide underlying problems.
* Most issues come from mutated objects, async timing issues, or components not receiving new references.
* They should be used only in special cases (e.g. setTimeout, non-Angular event sources, manual performance optimization).