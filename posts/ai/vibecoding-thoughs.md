*Posted 12/03/2025*

# The Reality of VibeCoding - Task Manager & Sticky Notes Dashboard
*Vibecoding” is essentially AI-assisted coding pushed to the extreme—letting AI generate entire features, modules, or files instead of small code snippets. Most of the issues I describe here apply not only to vibecoding, but to AI-assisted development in general.*

I decided to try vibecoding myself because it’s trending everywhere and often praised for its speed. To test its limits, I built a small offline Angular application composed of two modules:
- Task Manager — a basic Kanban board with time tracking
- Sticky Notes — movable notes on a dashboard

Both features share a common IndexedDB storage layer.

[Live demo](https://lively-island-04d71f110.3.azurestaticapps.net/)

### The app worked on the first try — but was full of bugs

I immediately understood the “wow moment.” In a few minutes, the AI generated code that actually ran.
But anyone with engineering experience can also see how fragile that code is and how quickly it becomes unmaintainable.

AI cannot run or test the application.
It only predicts code that resembles something correct.
  
Typical issues:
- incomplete logic paths
- missing null checks
- incorrect reactive flows
- mismatched variable names
- wrong selectors
- missing await/return

**LLM-generated code always requires manual validation and debugging.**

### AI Does Not Follow Best Practices Unless You Force It

Without strict guardrails, AI often produces:
- tightly coupled or spaghetti-like structures
- inconsistent coding styles
- broken separation of concerns
- imperative logic inside Angular components
- oversized components and services
- duplicated logic across multiple files

Even with explicit instructions, the AI frequently drifts away from best practices.
It knows them, but does not reliably apply them.

Examples from this project:
- It defaulted to px everywhere because that is what most training examples use → no responsive design by default.
- It mixed Promises and RxJS despite being asked to follow Angular best practices.
- It often contradicted itself between consecutive answers.

**Even with instructions, code still requires refactoring.**  
**LLMs know best practices but do not consistently apply them.**
  
### Shared Logic – Architecture Concern
The application required shared logic for accessing IndexedDB.
On the first attempt, the AI generated two separate services containing almost identical IndexedDB logic, both managing the same database operations.

This immediately caused:
- duplicated responsibilities
- conflicting state management
- inconsistent updates across features

When I asked it to fix bugs, it tried correcting each service independently, producing more duplication and more conflicts.
I eventually had to force it to create a single shared data-access service — and even then, the structure was flawed.

**AI consistently struggles with shared architecture, cross-cutting concerns, and designing reusable abstractions.**

### Deployment and security require 100% manual review
This part is non-negotiable.
When deploying to Azure, the AI recommended configurations that introduced serious security risks.

Examples of what AI may generate:
- exposed or unnecessary open ports
- insecure or wildcard CORS
- leaked secrets within build pipelines
- outdated or vulnerable packages
- incorrect authentication and authorization configurations

**Security, DevOps, and infrastructure configuration cannot be delegated to AI..**

### Final Composition: 75% Vibecoding, 25% Manual Fixes
For styling, small UI tweaks, and simple code generation, AI is extremely productive.
However, once complexity increases, the quality drops sharply.

AI is excellent at scaffolding, but humans still handle:
Humans still handle:
- architectural consistency
- correctness and reliability
- performance and edge cases
- maintainability
- security
- dependency management
- debugging and testing

**AI-generated code is equivalent to a junior developer's first draft—useful, but never production-grade by itself.**

### Fast Results — Great With Styles
On the positive side, the entire app was built three to four times faster thanks to AI.
Its help with CSS, layout design, and quick prototypes was extremely valuable.

For:
- hobby projects
- internal tooling
- throwaway prototypes
- UI experiments

AI is genuinely great.
It accelerates development dramatically and reduces busywork, as long as you accept that it is not shaping a long-term architecture.

## Tips:
### 1. Tell Copilot to send only changed lines
By default, Copilot rewrites entire files, which leads to:
- regressions
- unnecessary copy-paste
- merge conflicts
- wasted tokens
- lost context

Asking for **diff-based output** avoids almost all of these issues.

### 2. Use High-Quality Prompts
Good prompts follow a simple structure:
- context
- task
- constraints
- output format
- (optional) tone or style

The clearer your structure, the better the results.

For more details:
[General “Prompt Structure” for Clear Results](https://gramli.github.io/posts/ai/valid-prompt)

### 3. Use AI for Small, Isolated Proof-of-Concepts — Then Refactor Manually

The most effective workflow today looks like this:

1. Use AI to quickly generate isolated, low-risk PoCs
2. Refactor manually with proper patterns and architecture
3. Prepare the final version for production

This maximizes speed while maintaining quality.


## Conclusion

Vibecoding delivers impressive speed, removes repetitive boilerplate work, and dramatically accelerates early prototyping. But today’s AI systems lack architectural awareness, produce inconsistent abstractions, and frequently generate code that “looks right” while failing at runtime. They amplify productivity only when paired with experience.

AI is an excellent accelerator — not an engineer.

The real value comes from combining AI-generated drafts with human-driven design, validation, and refinement. Used strategically, it can make teams faster. Used without oversight, it can make codebases fragile.

The future of software development is not AI replacing developers, but developers who know when to let AI accelerate and when to take full control.