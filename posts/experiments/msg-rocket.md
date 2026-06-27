---
layout: post
title: "msg-rocket: From Diff to Decision with GitHub Copilot CLI"
date: 2026-02-01
categories: [experiments, javascript, nodejs, git, github-copilot, cli]
description: "A dependency-free Node.js CLI that uses GitHub Copilot CLI to generate commit messages, review staged changes, and enforce coding standards."
canonical_url: "https://dev.to/gramli/msg-rocket-from-diff-to-decision-with-github-copilot-cli-1ba8"
---

*This is a submission for the [GitHub Copilot CLI Challenge](https://dev.to/challenges/github-2026-01-21)*

I started thinking about how **GitHub Copilot CLI** could enhance my daily workflow as a developer. The first thing that came to mind was working with Git and consistently complying with team and general coding standards.

When working with git, writing **good commit messages** is a recurring pain point. You know the situation: it’s the end of the day, a feature is half done, you want to commit your work — but you hesitate, unsure how to clearly describe the change.

Another challenge is consistently following team-specific **coding standards** and **clean code principles**. We’re not machines; debug artifacts or small convention mismatches are easy to miss. These issues are often discovered during code review, but not always, and not early.

That’s why I built **msg-rocket** — a command-line tool that uses **GitHub Copilot CLI** as a **decision-making engine** to help address these problems directly in the developer workflow.

## 🛠️ What I Built
<!-- Provide an overview of your application and what it means to you. -->
**Link**: https://github.com/Gramli/msg-rocket

**msg-rocket** is a command-line tool and a wrapper around **GitHub Copilot CLI** and **git** that helps me increase my productivity and improve the quality of code I deliver to my team.

The tool is written in **vanilla JavaScript**—mostly for fun, but it turned out to be quite a ride for someone who usually works with type-safe languages 🙂. Also it uses only **Node.js standard libraries**, with zero external dependencies.

It provides five focused commands:

- 📝 **commit** — Generates commit messages from staged changes. By default, it runs in interactive mode, allowing you to edit the message in your editor before the tool commits the changes or aborts the operation.
- 🔄 **uptodate** - Updates your branch with the latest changes from the remote main branch while preserving your local work.
- 👀 **review** — Reviews staged changes with a specific focus on clean code, performance, or security, selectable via flags.
- ✨ **clean** — Detects obvious debug artifacts (such as `console.log`, `debugger`, etc.) from the staged diff.
- 📏 **standard** — Checks staged changes against team-specific coding standards. The standards are provided via a configurable file (e.g., `.txt`, `.md`).

Each command (except `uptodate`) uses a **specially tailored prompt**, written to a temporary file and passed directly to the `copilot -p` command, making GitHub Copilot CLI a visible and central part of the workflow.

## ▶️ Demo
![demo msg-rocket git flow](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8u1gxw93ufhkj07fm1oi.gif)

- 🚀 [App repo link](https://github.com/Gramli/msg-rocket)
- ▶️ [Demo .gif link](https://github.com/Gramli/msg-rocket/blob/master/assets/demo-uptodate-commit.gif)

### Installation
```bash
npm install -g msg-rocket
```

### Playground App
To test msg-rocket’s capabilities, I created a **playground repository**, **vibe-coded** with GitHub Copilot CLI. Feel free to check it out and test msg-rocket on it.

It is a simple Node.js HTTP server (no frameworks) designed to simulate realistic development scenarios.

## 💻 My Experience with GitHub Copilot CLI
<!-- Explain how you used GitHub Copilot CLI while building your project and how it impacted your development experience. -->
I have used **GitHub Copilot CLI** in two ways. First, as a **code generation tool** for small parts of the project or for generating entire features based on well-defined [prompts](https://github.com/Gramli/msg-rocket/tree/master/.github/prompts). Second, GitHub Copilot CLI became an **integral part** of the tool itself, as it is embedded in almost every command’s workflow.

**Let’s start with the struggles I encountered.**
- As for **premium models**, GitHub Copilot **works like a charm**. With **free models**, however, I have repeatedly **encountered an issue** where the command `copilot -p @path-to-file.prompt.md` does not actually open the file, but instead asks what should be done with it.
- At times, GitHub Copilot CLI **flickers**, especially when selecting *“No, and tell Copilot what to do differently (Esc to stop)”*.
- I also encountered several cases where holding the **Backspace** key caused the CLI to insert the ⌫ Unicode character instead of deleting characters from the input.

**But to avoid being purely critical**, I genuinely enjoyed using **GitHub Copilot CLI** while building **msg-rocket**—not only as a **code generator**, but also as a **collaborator**. In some cases, the interaction felt closer to working with a teammate than issuing one-off commands. That experience even led to a small Easter egg command inspired by a scene from one of my favorite movies. It’s a minor detail, but it reflects how naturally Copilot CLI fit into the process of building the tool.

> **Tip**: *Curious users might want to explore the CLI beyond the documented commands. And for the lazy ones, there’s a link to the [Easter egg GIF](https://github.com/Gramli/msg-rocket/blob/master/assets/matrix_final.gif).*

Overall, working with GitHub Copilot CLI has been both **challenging and rewarding**. While there are occasional quirks, the ability to use it as both a code generator and a collaborator significantly enhanced my workflow. For anyone who enjoys working in the terminal, it’s a powerful addition to your toolkit.
