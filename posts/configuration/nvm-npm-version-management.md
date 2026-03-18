---
layout: post
title: "Node.js Dependency & Version Management with nvm, npm ci and Registries"
date: 2026-03-18
categories: [node, nodejs, nvm, npm, webdev]
canonical_url: "https://dev.to/gramli/nodejs-dependency-version-management-with-nvm-npm-ci-and-registries-3o55"
---


*Posted 03/18/2026*

# Node.js Dependency & Version Management with nvm, npm ci and Registries

Working with multiple `Node.js` projects often means switching between different Node versions, reinstalling dependencies and remembering various `nvm` and `npm` commands. This becomes especially painful when moving between legacy and modern codebases.

This article provides a practical overview of my most common `Node.js` workflow tasks: **switching Node versions** using `nvm`, **cleaning and reinstalling dependencies** and using the **correct npm installation strategy** for local development and CI/CD environments.

If you regularly jump between projects and forget the exact commands, this guide provides a simple, repeatable workflow you can reuse every day.

--- 

## Contents

- [Node.js Dependency \& Version Management with nvm, npm ci and Registries](#nodejs-dependency--version-management-with-nvm-npm-ci-and-registries)
  - [Contents](#contents)
  - [Switching to a Different Node Version](#switching-to-a-different-node-version)
    - [Check the required version](#check-the-required-version)
    - [`.nvmrc` approach](#nvmrc-approach)
      - [`.nvmrc` vs `package.json`](#nvmrc-vs-packagejson)
  - [Clean and Reinstall Dependencies](#clean-and-reinstall-dependencies)
    - [Installation Strategy Comparison](#installation-strategy-comparison)
    - [Reinstall with locked versions](#reinstall-with-locked-versions)
      - [Why `npm ci`?](#why-npm-ci)
    - [Full reinstall](#full-reinstall)
      - [`rm -rf node_modules`](#rm--rf-node_modules)
        - [Why delete `node_modules`?](#why-delete-node_modules)
      - [`rm package-lock.json`](#rm-package-lockjson)
      - [`npm i` (`npm install`)](#npm-i-npm-install)
    - [Corrupted npm Cache](#corrupted-npm-cache)
      - [Verify the cache (recommended first step)](#verify-the-cache-recommended-first-step)
    - [Clean the cache](#clean-the-cache)
  - [Change registry](#change-registry)
    - [Log in to a registry](#log-in-to-a-registry)
    - [Set the default registry](#set-the-default-registry)
    - [Show current npm configuration](#show-current-npm-configuration)

---

## Switching to a Different Node Version

First, determine which Node version the project requires.

### Check the required version

`package.json` declares supported Node versions:

``` json
{
  "engines": {
    "node": ">=18"
  }
}
```
Use the terminal to verify which Node.js version is active locally:

``` bash
node -v
# or
node --version
```

Once you know which version is required, list locally installed Node
versions:

``` bash
nvm ls
```

If the required version is not installed locally:

``` bash
nvm install <version>
```

Then switch to the desired version:

``` bash
nvm use <version>
```

### `.nvmrc` approach

Instead of manually checking the required Node version in `package.json`, you can define it using an `.nvmrc` file.

The file contains only the Node version:
```plaintext
18.19.0
```
Once the file exists, switching versions becomes simpler:

```shell
nvm use
```
Running `nvm use` inside a directory containing `.nvmrc` switches to the specified version. Automatic switching requires shell integration (e.g., zsh hooks or tools like avn).

#### `.nvmrc` vs `package.json`

`package.json` and `.nvmrc` solve related but different problems:

- the `engines` field in `package.json` declares supported Node versions
- `.nvmrc` allows `nvm` to automatically switch the runtime version

Using both helps keep development environments consistent across projects and teams.

---

## Clean and Reinstall Dependencies

There are two main approaches to cleaning and reinstalling dependencies, depending on whether you want to **preserve exact versions** or **update them**:

- **Reinstall with locked versions** – Reinstalls `node_modules` while keeping the exact versions specified in `package-lock.json`. This approach is recommended for teams and CI/CD environments, as it ensures reproducible builds.  
- **Full reinstall** – Removes `node_modules` and `package-lock.json` before reinstalling all dependencies. This is useful when performing major dependency upgrades or resolving inconsistencies in the dependency graph.  

Before diving into the commands, here’s a quick table summarizing when to use each strategy:

### Installation Strategy Comparison

| Scenario | Command | Lockfile Behavior |
| :--- | :--- | :--- |
| **Standard CI/CD Build** | `npm ci` | Unchanged (strictly enforced) |
| **Team Development** | `npm ci` | Unchanged (strictly enforced) |
| **Maintenance / Updates** | `npm install` | Updates within semver; rewrites lockfile |
| **Full Reset** | `rm -rf node_modules package-lock.json && npm install` | Fully regenerated |

### Reinstall with locked versions

This approach is preferred for teams and CI/CD pipelines because it preserves exact dependency versions:

``` bash
npm ci
```

#### Why `npm ci`?

-   installs exact versions from `package-lock.json`
-   produces reproducible builds
-   faster and deterministic installs
-   preferred for teams and CI environments
-   removes `node_modules`

> **Note** `npm ci` fails if `package.json` and `package-lock.json` are out of sync, preventing accidental dependency drift.


### Full reinstall
Full reinstall is useful when performing major dependency upgrades, switching Node versions or resolving dependency graph inconsistencies.

``` bash
# Unix/Bash
rm -rf node_modules && rm package-lock.json && npm i
```

To completely reinstall dependencies, remove `node_modules` and `package-lock.json`, then run `npm install`. This regenerates `package-lock.json`, so review the changes carefully before committing them to Git to keep dependencies consistent across the team and CI environments.

In team settings, avoid deleting `package-lock.json` casually, as it updates the entire dependency graph for everyone working on the project.

#### `rm -rf node_modules`

Removes the `node_modules` directory recursively.
##### Why delete `node_modules`?
It may contain:
-   corrupted installs
-   incompatible binaries
-   dependency conflicts
-   leftover versions after upgrades
-   OS‑specific builds

Removing it forces a clean rebuild.

#### `rm package-lock.json`

Deletes the lock file and forces a fresh dependency resolution.

**Why remove it?**

- recompute dependency versions
- resolve a new dependency graph
- potentially upgrade sub-dependencies

> **Note**: Deleting `package-lock.json` triggers a "fresh" resolution of all sub-dependencies. Only do this if you intend to update your entire dependency tree.

#### `npm i` (`npm install`)

This command:
-   reads `package.json`
-   resolves dependencies
-   downloads packages
-   creates a new `node_modules` directory
-   generates a new `package-lock.json`

### Corrupted npm Cache
In rare cases, npm installs may fail due to a corrupted local cache. Typical symptoms include integrity errors, failed package extraction, or repeated installation failures.

#### Verify the cache (recommended first step)

```shell
npm cache verify
```
This checks the cache integrity and removes invalid entries automatically.


### Clean the cache
If problems persist, you can clear the npm cache:
```shell
npm cache clean --force
```
The `--force` flag is required because npm protects the cache by default. After cleaning the cache, run `npm install` again to rebuild dependencies.

> **Note** Clearing the cache is rarely necessary and should only be used when troubleshooting installation issues. The npm cache is stored in `~/.npm` (Linux/macOS) or `%AppData%/npm-cache` (Windows).
In modern npm versions (v7+), cache corruption is uncommon because npm performs strict integrity verification and automatically removes invalid cache entries.

---

## Change registry
In some environments especially when working with private packages or company infrastructure, you may need to configure npm to use a custom registry. This is typically done once when setting up a development machine.

### Log in to a registry
Authenticate against a custom registry:
```shell
npm login --registry=<registry-url> --auth-type=web
```
This stores authentication credentials (usually as an auth token) in your local npm configuration.

### Set the default registry
Configure npm to use a specific registry by default:
```shell
npm config set registry <registry-url>
```
This updates your user-level npm configuration.

You can verify the current registry with:
```shell
npm config get registry
```

### Show current npm configuration
Display the active npm configuration:

```shell
npm config list
```

This shows configuration values from all scopes (global, user, and project).

> **Note** Some projects define a registry inside a project-level .npmrc, which overrides global settings.