---
layout: post
title: "SourceTree: Common Troubleshooting Guide"
date: 2026-02-19
categories: [git, sourcetree, troubleshooting]
description: "A collection of fixes for common SourceTree issues: startup crashes, rebase failures, and password resets."
---

# SourceTree Troubleshooting Guide

This post aggregates solutions for common issues encountered when using Atlassian SourceTree on Windows.

## 1. SourceTree Crashes on Startup

### Symptoms
SourceTree fails to open or crashes immediately upon launching.

### Cause
The most likely reason is a corrupted `user.config` file. If this file is damaged, it often contains a series of `<NULL>` values.

### Resolution
1. Navigate to the local configuration folder:
   ```
   C:\Users\<User>\AppData\Local\Atlassian\SourceTree.exe_<random_string>\<version_number>
   ```
2. Locate the `user.config` file.
3. **Delete** the file.
4. Restart SourceTree. The application will regenerate a fresh configuration file closely matching your previous settings.

*[Original Source](https://confluence.atlassian.com/sourcetreekb/sourcetree-crashes-on-startup-831655339.html)*

---

## 2. Recovery from Failed Rebase (Missing Commits)

### Symptoms
During a rebase with conflicts, SourceTree might fail and seemingly "drop" your last commit or leave the repository in a detached state.

### Resolution
You need to find the commit hash of your state before the rebase started and reset your branch to it.

1. Open the terminal (in SourceTree or external).
2. Show the reference logs to find your previous commit:
   ```bash
   git reflog
   ```
3. Identify the commit ID (SHA) you want to return to.
4. Hard reset the branch to that commit:
   ```bash
   git reset <commitId> --hard
   ```
5. **Recommendation:** For complex rebases involving conflicts, it is safer to perform the rebase using `git bash` or another command-line tool instead of SourceTree's UI.

---

## 3. How to Change or Reset Password

If SourceTree is stuck with old credentials or you need to force a password prompt (e.g., after changing your Bitbucket/GitHub password), follow these steps.

### Resolution
1. Close SourceTree.
2. Navigate to the following directory:
   ```
   %localappdata%\Atlassian\SourceTree\
   ```
3. Delete the following files:
   - `passwd`
   - `userhost`
4. Restart SourceTree. It will prompt you to enter your new credentials when you next attempt a remote operation (fetch/push/pull).
