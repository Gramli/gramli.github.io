*Posted 02/28/2024*

# Tips and Tricks for Copilot in VS Code and VS

GitHub Copilot is getting smarter every month — and both VS Code and Visual Studio offer features beyond simple inline suggestions.
Here’s a collection of practical tips, commands, and best practices to get the most out of it.

## General
**@workspace** – a chat participant that understands your workspace, codebase, and project structure. It’s ideal for explaining code, generating tests, or helping with refactors.

**Slash commands** – shorthand for common tasks:

- /new – create a new file or workspace element

- /fix – suggest a fix for the current issue or error

- /test – generate unit tests for the selected code

- /explain – describe what a method or block of code does

- /optimize – refactor or improve performance and readability

- /doc – create or update documentation and XML comments

Type / in the chat input to see all supported commands.

## Prompting Tips
Copilot performs best when you give it context. Instead of vague prompts like “optimize this code”, try being explicit:

```
// Optimize this method for readability and performance.
// Use LINQ and avoid multiple enumerations.
```

- Start with a short comment or summary describing what you want before you start coding.
- Keep relevant files open – Copilot can only read context from open buffers.
- Use clear, descriptive names for methods and variables; Copilot uses them to infer intent.
- When asking in chat, provide a goal and constraints, e.g.: ```“Refactor this class to use dependency injection but keep public API unchanged.”```

## Workspace Awareness
Copilot can understand your entire workspace when you use @workspace.
This is especially powerful for large projects or when working across multiple files.

- @workspace explain how authentication works
- @workspace find where FileService is used
- @workspace add a new command handler for deleting files

Tip: You can index your workspace in VS Code settings so Copilot can search and reason across the entire solution.

## VS Code Shortcuts

- Inline chat → Ctrl + I or right-click → Ask Copilot
- Chat window → Ctrl + Alt + I
- Trigger suggestion manually → Alt + \
- Cycle through suggestions → Alt + ] and Alt + [
- Accept line suggestion → Tab
- Accept full suggestion → Ctrl + →

You can snooze inline suggestions if you want Copilot to stay silent for a while (Ctrl + . → “Snooze”).

## Visual Studio Shortcuts

- Inline chat → Alt + / or right-click → Ask Copilot
- Chat tool window → View → GitHub Copilot Chat
- Generate code explanations → highlight → Ask Copilot → Explain
- Generate tests → highlight → Ask Copilot → Write unit tests

In Visual Studio, Copilot is tightly integrated with Solution Explorer — you can invoke it directly on classes or files.