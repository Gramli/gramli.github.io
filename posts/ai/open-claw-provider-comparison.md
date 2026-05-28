---
layout: post
title: "OpenClaw Sandbox Guide: One-Click .WSB Setup & AI Provider Comparison"
date: 2026-05-07
categories: [ai, openclaw, windows, sandbox, security, providers]
description: "Part 2: Complete OpenClaw setup in Windows Sandbox with automated .wsb configuration and comparison of free and paid AI providers."
canonical_url: "https://dev.to/gramli/openclaw-in-windows-sandbox-full-setup-and-free-vs-paid-model-comparison-3jec"
series: openclaw
series_part: 2
---

*Posted 07/05/2026*

Running OpenClaw in Windows Sandbox is a simple way to test and run it in an isolated environment without affecting your host system. In my [previous article](https://dev.to/gramli/run-openclaw-locally-on-windows-using-windows-sandbox-for-secure-isolation-411b), I showed how to run OpenClaw inside Windows Sandbox and covered the key security considerations.

This article goes a step further by walking through a **complete OpenClaw setup in Windows Sandbox**, with clear explanations of what each step does and why it matters. I tested OpenClaw with both free and paid providers: three free options and one paid to show that **you can get started and use it entirely for free**, along with the performance trade-offs to expect.

**Tested providers**
To compare performance and usability, I tested OpenClaw with the following providers:

- Copilot — (paid) - https://github.com/copilot
- NVIDIA — (free tier - API quota) - https://build.nvidia.com
- OpenRouter — (free tier - API quota) - https://openrouter.ai
- Google — (free tier - API quota) - https://aistudio.google.com

With the basics covered, let’s move on to a streamlined setup that automates the entire process inside Windows Sandbox.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Windows Sandbox Install Config](#windows-sandbox-install-config)
- [OpenClaw Easy Setup](#openclaw-easy-setup)
  - [Security disclaimer](#security-disclaimer)
  - [Setup mode](#setup-mode)
  - [Model/auth provider](#modelauth-provider)
  - [Select channel (QuickStart)](#select-channel-quickstart)
  - [Web search](#web-search)
  - [Skills](#skills)
  - [Hooks](#hooks)
  - [Gateway service runtime](#gateway-service-runtime)
    - [Windows Security Alert](#windows-security-alert)
  - [Control UI](#control-ui)
  - [Completion](#completion)
  - [Start the chat](#start-the-chat)
    - [First-run: Plugin dependency install](#first-run-plugin-dependency-install)
    - [First-run: System prompt generation](#first-run-system-prompt-generation)
    - [Agent personality setup](#agent-personality-setup)
  - [Provider Performance Comparison in Windows Sandbox](#provider-performance-comparison-in-windows-sandbox)
    - [NVIDIA (`moonshotai/kimi-k2.5`)](#nvidia-moonshotaikimi-k25)
    - [NVIDIA (`minimaxai/minimax-m2.5`)](#nvidia-minimaxaiminimax-m25)
    - [OpenRouter (free models)](#openrouter-free-models)
    - [Copilot (Gemini 3.1 Pro Preview) — Paid](#copilot-gemini-31-pro-preview--paid)
    - [Google (`google/gemini-2.5-flash-lite`) — Free with API key](#google-googlegemini-25-flash-lite--free-with-api-key)
- [Summary](#summary)
- [Troubleshooting](#troubleshooting)
  - [Reached a rate limit](#reached-a-rate-limit)
  - [Test that the key and model work](#test-that-the-key-and-model-work)

## Windows Sandbox Install Config

Instead of executing setup commands manually, we’ll automate the entire process using a `.wsb` configuration that runs on sandbox startup.

Create a new file `OpenClawNVIDIA.wsb`, then copy the code below into it:

```xml
<Configuration>
  <Networking>Default</Networking>
  <MemoryInMB>8192</MemoryInMB>
  <LogonCommand>
    <Command>cmd.exe /c start powershell.exe -NoExit -ExecutionPolicy Bypass -Command "Set-Location $env:USERPROFILE; $ProgressPreference='SilentlyContinue'; Write-Host ''; Write-Host '=== OpenClaw Sandbox Setup ===' -ForegroundColor Yellow; Write-Host ''; Write-Host '[1/5] Downloading Node.js (latest)...' -ForegroundColor Cyan; $version = (Invoke-WebRequest -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing | ConvertFrom-Json)[0].version; Write-Host "      Node.js $version" -ForegroundColor Gray; Invoke-WebRequest -Uri "https://nodejs.org/dist/$version/node-$version-x64.msi" -OutFile 'node.msi'; Write-Host '      Done.' -ForegroundColor Gray; Write-Host '[2/5] Installing Node.js (silent)...' -ForegroundColor Cyan; Start-Process msiexec.exe -Wait -ArgumentList '/i node.msi /qn'; Write-Host '      Done.' -ForegroundColor Gray; Write-Host '[3/5] Refreshing environment PATH...' -ForegroundColor Cyan; $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); Write-Host '      Done.' -ForegroundColor Gray; Write-Host '[4/5] Setting PowerShell execution policy for this session...' -ForegroundColor Cyan; Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force; Write-Host '      Done.' -ForegroundColor Gray; Write-Host '[5/5] Installing OpenClaw (this may take a few minutes)...' -ForegroundColor Cyan; npm install -g openclaw@latest; Write-Host ''; Write-Host '=== Setup complete ===' -ForegroundColor Green; Write-Host 'Run: openclaw onboard' -ForegroundColor Green; Write-Host ''"</Command>
  </LogonCommand>
</Configuration>
```

The `LogonCommand` runs automatically when the sandbox starts. Here's what each part does:

| Command | What it does |
|---|---|
| `cmd.exe /c start powershell.exe` | Launches a new visible PowerShell window when the sandbox signs in. Without `start`, the command would run inline instead of opening a separate interactive window. |
| `-NoExit` | Keeps the PowerShell window open after the setup commands finish, so you can review the output and continue working in the same session. |
| `-ExecutionPolicy Bypass` | Temporarily allows PowerShell to run the startup command without being blocked by the system execution policy. |
| `Set-Location $env:USERPROFILE` | Changes the working directory to the sandbox user profile (`C:\Users\WDAGUtilityAccount`) instead of the default `C:\Windows\System32`. |
| `$ProgressPreference='SilentlyContinue'` | Suppresses PowerShell's progress UI so downloads do not flood the terminal with progress updates. |
| `$version = = (Invoke-WebRequest ... )` | Fetches the latest Node.js version from the official release feed. |
| `Write-Host "      Node.js $version"` | Prints the exact Node.js version being downloaded so you can see which installer the script selected. |
| `Invoke-WebRequest -Uri "..." -OutFile 'node.msi'` | Downloads the 64-bit Windows MSI installer for the selected Node.js version and saves it locally as `node.msi`. |
| `Start-Process msiexec.exe -Wait -ArgumentList '/i node.msi /qn'` | Installs Node.js silently (`/qn` = no installer UI) and waits for the installation to complete before moving to the next step. |
| `$env:Path = [System.Environment]::GetEnvironmentVariable(...)` | Reloads the machine and user `PATH` values into the current PowerShell session so `node` and `npm` are available immediately. |
| `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force` | Sets a less restrictive execution policy for the current PowerShell process only, which helps locally installed scripts such as `npm` wrappers run without prompts. |
| `npm install -g openclaw@latest` | Installs the latest OpenClaw package globally so the `openclaw` command is available from anywhere in the sandbox session. |

Now our sandbox is ready, let’s start the OpenClaw setup.

> **Note:** Although OpenClaw can run with 4096 MB, I recommend running it with 8192 MB, it's noticeably smoother and responds much faster.

## OpenClaw Easy Setup

Run 
```PowerShell
openclaw onboard
```

> **Note**: you can cancel the setup by pressing `ESC`

### Security disclaimer

The first thing you’ll see is a security disclaimer, if you’re running OpenClaw for the first time, I recommend reading the disclaimer but also [https://docs.openclaw.ai/gateway/security](https://docs.openclaw.ai/gateway/security).

If you understand the security implications, you can continue:

```PowerShell
 I understand this is personal-by-default and shared/multi-user use requires lock-down. Continue?
|  > Yes /   No
```
### Setup mode

In setup, you choose between two options:

```PowerShell
  Setup mode
|  > QuickStart (Configure details later via openclaw configure.)
|    Manual
```

**QuickStart** applies sensible defaults and gets you running immediately:

- Gateway runs locally (loopback only)
- Default workspace at `~/.openclaw/workspace`
- Gateway port `18789`
- Auth token auto-generated (even on loopback)
- Tool policy set to `coding` profile (filesystem and runtime tools, no unrestricted access)
- DM isolation scoped per channel peer
- Tailscale exposure off
- Telegram and WhatsApp DMs default to allowlist (you'll be prompted for your phone number)

You can adjust any of these later with `openclaw configure`.

**Manual** (Advanced) gives you full control over every option during setup — model provider, workspace path, port, auth mode, channels, and daemon installation. Choose this if you know what you want or need a non-default configuration from the start.

For experimenting in Windows Sandbox, **QuickStart** is the right choice.

### Model/auth provider

This step configures which AI provider and model OpenClaw will use. The wizard presents a list of supported providers.

For this showcase, we choose **NVIDIA** because it provides an OpenAI-compatible API with open models that **currently offers a free tier**. After selecting NVIDIA, the wizard will ask for your API key.

```PowerShell
|
o  Model/auth provider
|  NVIDIA
|
o  Enter NVIDIA API key
|  YOUR-API-KEY
```

After entering the key, the wizard shows a searchable model picker:

```PowerShell
*  Default model
|
|  Search:
|    Keep current (default: openai/gpt-5.5)
|    Enter model manually
|    nvidia/z-ai/glm5
|  > nvidia/moonshotai/kimi-k2.5 (Kimi K2.5 · ctx 256k)
|    nvidia/minimaxai/minimax-m2.5
|    nvidia/nemotron-3-super-120b-a12b
```

> **Note**: If you just want to experiment with OpenClaw, generate short-lived API keys, like 7 days. After that period the key expires.

### Select channel (QuickStart)

This step asks which chat channel you want to connect to. Options include Telegram, WhatsApp, Discord, Slack, Signal, and more.

```PowerShell
  Channels
|  > Skip for now
|    Telegram
|    WhatsApp
|    Discord
|    Signal
|    ...
```

For experimenting in Windows Sandbox, select `Skip for now`. OpenClaw will still work, you'll chat through the built-in browser dashboard instead.

### Web search

This step asks which search engine the AI can use when it needs to look something up on the web. Available options include Brave, DuckDuckGo, Exa, Perplexity, Tavily, and more.

```PowerShell
*  Search provider
|
|  Search:
|    Gemini (Google Search)
|    Grok (xAI)
|    Kimi (Moonshot)
|    Ollama Web Search
|  > Skip for now (Configure later with openclaw configure --section web)
|  ↑/↓ to select • Enter: confirm • Type: to search
```

You can skip this step, the AI can still answer questions from its own knowledge but won't be able to search the web. You can add a provider later with:

```PowerShell
openclaw configure --section web
```

### Skills

After the search provider step, the wizard shows a skills summary:

```PowerShell
o  Skills status -------------+
|                             |
|  Eligible: 6                |
|  Missing requirements: 38   |
|  Unsupported on this OS: 8  |
|  Blocked by allowlist: 0    |
|                             |
+-----------------------------+
```

**Skills** are pre-built capabilities that extend what the AI can do, things like searching Google Places, reading Notion pages or transcribing audio via Whisper.

The numbers here mean:
- **Eligible: 6** — skills that can run right now with what's already installed
- **Missing requirements: 38** — skills that need additional API keys or packages you haven't provided yet
- **Unsupported on this OS: 8** — skills that don't run on Windows at all
- **Blocked by allowlist: 0** — skills explicitly disabled by your tool policy

When the wizard asks `Configure skills now?`, select **Yes** — it just walks you through the missing ones so you can decide what to set up.

For the next prompt:

```PowerShell
*  Install missing skill dependencies
|  [•] Skip for now (Continue without installing dependencies)
|  [ ] 🔐 1password
|  [ ] 📰 blogwatcher
|  [ ] 🫐 blucli
|  [ ] 📸 camsnap
|  [ ] 🧩 clawhub
|  [ ] 🛌 eightctl
|  [ ] ✨ gemini
|  [ ] 🧩 gh-issues
```

Choose **Skip for now**. Installing all missing packages upfront would pull in a lot of dependencies you may never use.

The wizard then asks for API keys for the skills that need them:

```PowerShell
o  Set GOOGLE_PLACES_API_KEY for goplaces?   → No
o  Set NOTION_API_KEY for notion?            → No
o  Set OPENAI_API_KEY for openai-whisper-api? → No
o  Set ELEVENLABS_API_KEY for sag?           → No
```

Skip all of these for now. You can always enable individual skills later with:
```PowerShell
openclaw configure --section skills
```

### Hooks

The last step in the wizard offers to set up **hooks**:

```PowerShell
o  Hooks ------------------------------------------------------------------+
|                                                                          |
|  Hooks let you automate actions when agent commands are issued.          |
|  Example: Save session context to memory when you issue /new or /reset.  |
|                                                                          |
|  Learn more: https://docs.openclaw.ai/automation/hooks                   |
|                                                                          |
+--------------------------------------------------------------------------+
```

Hooks are scripts or actions that fire automatically when specific agent commands happen — things like session start, reset, or shutdown. The wizard shows four built-in options:

| Hook | What it does |
|---|---|
| 🚀 `boot-md` | Reads a `BOOT.md` file from your workspace on every gateway startup and feeds it to the AI as initial context — useful for giving the agent a standing brief. |
| 📎 `bootstrap-extra-files` | Copies additional files into every new session workspace automatically. |
| 📝 `command-logger` | Writes every command event to a centralized audit log file — handy if you want a record of what the agent did. |
| 💾 `session-memory` | Saves a summary of each session to persistent memory when you run `/new` or `/reset`, so the agent can recall what it worked on before. |

```PowerShell
*  Enable hooks?
|  [•] Skip for now
|  [ ] 🚀 boot-md
|  [ ] 📎 bootstrap-extra-files
|  [ ] 📝 command-logger
|  [ ] 💾 session-memory
—
```

For a first-time setup in Windows Sandbox, select **Skip for now**. All of these are useful for persistent setups but add nothing to a throwaway sandbox session. You can enable them later with:

```PowerShell
openclaw configure --section hooks
```

### Gateway service runtime

The **Gateway** is the background process that sits between your chat interface and the AI model. It handles all communication: receiving your messages, forwarding them to the model API, and returning the responses. Without the Gateway running, OpenClaw has nothing to connect to.

```PowerShell
o  Gateway service runtime --------------------------------------------+
|                                                                      |
|  QuickStart uses Node for the Gateway service (stable + supported).  |
|                                                                      |
+----------------------------------------------------------------------+
|
0  Installing Gateway service….
Installed Scheduled Task: OpenClaw Gateway
Task script: C:\Users\WDAGUtilityAccount\.openclaw\gateway.cmd
o  Gateway service installed.
```

#### Windows Security Alert

![Windows Security Alert](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d7zpseb4nhb1sdyj6u3w.JPG)

Shortly after the Gateway service starts, Windows Defender Firewall will show a dialog saying it has blocked some features of Node.js. This is expected, the Gateway opens a local port (`18789`) so your browser can connect to it, and Windows flags any app that tries to listen on a network port.

> **Note**: In the screenshot, **Public networks** is enabled while **Private networks** is disabled. In Windows Sandbox, this distinction is largely irrelevant due to network isolation (NAT). On a host machine, however, you would typically allow **Private networks** (or both), depending on how you plan to access the dashboard.

Click **Allow access** to let the Gateway communicate. If you accidentally click Cancel or Block, the browser dashboard won't be able to reach the Gateway. You can fix this by opening Windows Defender Firewall settings and adding an inbound rule for Node.js, or by restarting the Gateway with `openclaw gateway restart` to trigger the prompt again.

In Windows Sandbox, the firewall rule only applies to the current session, it is discarded when the sandbox closes.

### Control UI

The wizard now shows your Gateway's connection details. Here is what each line means:

- **Web UI** — the plain browser address for the dashboard. Use this when accessing from the same machine.
- **Web UI (with token)** — the same address with an auth token appended. OpenClaw generates a token even on loopback as an extra layer of protection. Use this URL if the plain one asks you to log in.
- **Gateway WS** — the WebSocket address the browser dashboard uses internally to talk to the Gateway in real time.
- **Gateway: not detected** — the wizard is checking whether the Gateway is already listening. At this point in setup it hasn't started yet, so `ECONNREFUSED` is normal. The Gateway will be available once you run `openclaw dashboard`.

```PowerShell
o  Control UI ---------------------------------------------------------------------+
|                                                                                  |
|  Web UI: http://127.0.0.1:18789/                                                 |
|  Web UI (with token):                                                            |
|  http://127.0.0.1:18789/#token=b23b5e33e109cd4819f7c57ffa98dd88ca62f402ebcd343a  |
|  Gateway WS: ws://127.0.0.1:18789                                                |
|  Gateway: not detected (connect ECONNREFUSED 127.0.0.1:18789)                    |
|  Docs: https://docs.openclaw.ai/web/control-ui                                   |
|                                                                                  |
+----------------------------------------------------------------------------------+
|
o  Start TUI (best option!) ---------------------------------+
|                                                            |
|  This is the defining action that makes your agent you.    |
|  Please take your time.                                    |
|  The more you tell it, the better the experience will be.  |
|  We will send: "Wake up, my friend!"                       |
|                                                            |
+------------------------------------------------------------+
|
*  How do you want to hatch your bot?
|  > Hatch in Terminal (recommended)
|    Do this later
—
```

The **TUI** (Terminal User Interface) is an interactive text-based chat that runs directly in the PowerShell window. It's the recommended way to personalize your agent on first run — you describe yourself and your preferences, and OpenClaw uses that to shape how the AI responds to you going forward.

Select **Do this later**, we want to open the browser dashboard instead, so we will skip the terminal chat for now.

### Completion

The wizard wraps up with a few informational notices:

```PowerShell
o  Later -------------------------------------------+
|                                                   |
|  When you're ready: openclaw dashboard --no-open  |
|                                                   |
+---------------------------------------------------+
|
o  Workspace backup ----------------------------------------+
|                                                           |
|  Back up your agent workspace.                            |
|  Docs: https://docs.openclaw.ai/concepts/agent-workspace  |
|                                                           |
+-----------------------------------------------------------+
|
o  Security ------------------------------------------------------+
|                                                                 |
|  Running agents on your computer is risky — harden your setup:  |
|  https://docs.openclaw.ai/security                              |
|                                                                 |
+-----------------------------------------------------------------+
|
o  Shell completion ----------------------------------------------------------------+
|                                                                                   |
|  Failed to generate completion cache. Run `openclaw completion --install` later.  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

| Notice | What it means |
|---|---|
| **Later** | Reminds you of the command to open the dashboard without auto-launching a browser window. Handy if you want to copy the token URL manually. |
| **Workspace backup** | OpenClaw stores your agent's memory, session history, and configuration in `~/.openclaw/workspace`. On a real machine you'd want to back this up. In Windows Sandbox it doesn't matter — the whole environment is discarded when you close the sandbox. |
| **Security** | A reminder that running an AI agent locally carries real risks (file access, code execution). Worth reading the linked page before using OpenClaw on a machine with sensitive data. |
| **Shell completion** | OpenClaw tried to install tab-completion for the `openclaw` command in your shell but failed. This is a minor convenience feature — it's not required. You can install it later with `openclaw completion --install`. |

### Start the chat

Once setup finishes, open the browser dashboard with:

```PowerShell
openclaw dashboard
```

This starts the Gateway (if it isn't running already) and opens `http://127.0.0.1:18789` in your default browser. The page is OpenClaw's **Control UI** — a web-based chat interface where you type messages and the AI responds, similar to ChatGPT or Claude's web interface.

#### First-run: Plugin dependency install

The very first time the Gateway starts, it installs runtime dependencies for its built-in plugins before it can accept any chat messages. This happens in the background, the browser tab may appear to load but show no response to messages yet. You can watch what's happening by opening a **new** Command Prompt window and running:

```PowerShell
openclaw logs --follow
```

You will see lines like these as each plugin fetches its packages:

```PowerShell
11:15:12 [plugins] document-extract staging bundled runtime deps (1 missing, 29 install specs): pdfjs-dist@^5.6.205
11:15:25 [plugins] document-extract installed bundled runtime deps in 13015ms: pdfjs-dist@^5.6.205
11:15:49 [plugins] microsoft staging bundled runtime deps (1 missing, 30 install specs): node-edge-tts@^1.2.10
11:15:54 [plugins] microsoft installed bundled runtime deps in 4379ms: node-edge-tts@^1.2.10
11:17:01 [plugins] web-readability staging bundled runtime deps (2 missing, 35 install specs): @mozilla/readability@^0.6.0, linkedom@^0.18.12
11:17:09 [plugins] web-readability installed bundled runtime deps in 7254ms: @mozilla/readability@^0.6.0, linkedom@^0.18.12
```

Once the log goes quiet, the plugin install is done.

#### First-run: System prompt generation

After plugins are ready, OpenClaw assembles a **system prompt**, a large block of text that tells the AI who it is, what tools it has access to and how it should behave. This prompt is sent to the model API before your very first message. The time this takes depends heavily on the model and provider, see the [Provider Comparison](#provider-performance-comparison-in-windows-sandbox) section below.

> **Note**: If you send a message and nothing comes back for several minutes, it's almost certainly still processing this initial prompt, not broken. Check `openclaw logs --follow` to confirm activity.

#### Agent personality setup

Once the system prompt is processed, OpenClaw sends its opening message: `"Wake up, my friend!"` and the agent responds by introducing itself and asking you a few questions about who you are and what you want to use it for. This is how OpenClaw personalizes the agent to you. Take a moment to answer, the more context you give, the more useful the agent becomes from the first real conversation.

### Provider Performance Comparison in Windows Sandbox

Results were measured in Windows Sandbox (8 GB RAM) using the default OpenClaw system prompt in the European region. Actual performance may vary depending on provider load, network conditions and prompt size.

The table below summarizes what I observed during testing from each provider on the first run (first message after a fresh gateway start) and for every subsequent message.

| Provider | First run | Per message | Cost |
|---|---|---|---|
| NVIDIA `moonshotai/kimi-k2.5` | ~25 min | ≥3 min | Free (API quota) |
| NVIDIA `minimaxai/minimax-m2.5` | ~2 min | ≥10 sec | Free (API quota) |
| OpenRouter (free models) | ~30 min | ≥3 min | Free (API quota) |
| Google `google/gemini-2.5-flash-lite` | ~3 min | 30–90 sec | Free (API quota) |
| Copilot `Gemini 3.1 Pro Preview` | ~3 min | 30–90 sec | Paid (premium tokens) |

#### NVIDIA (`moonshotai/kimi-k2.5`)

The first run takes around 25 minutes, largely due to slow response times on the free tier. Once you're past that initial response, subsequent messages still take 3 minutes or more, making it impractical for back-and-forth conversation, expect to wait.

> **Note**: Sometimes no response comes at all. You may see: `Embedded agent failed before reply: 410 status code (no body)`

#### NVIDIA (`minimaxai/minimax-m2.5`)

The first run takes around 2 minutes and subsequent messages come back in 10 seconds or more. That's a significant improvement over `kimi-k2.5`, fast enough to have a real conversation without long waits between exchanges. For testing in Windows Sandbox, this model works well, even if its reasoning isn't the strongest.

#### OpenRouter (free models)

OpenRouter routes requests to whichever free model is available at the moment, which means latency is unpredictable. The first run took roughly 30 minutes in testing and individual messages typically ranged from 3 minutes and up, depending on queue depth and the model selected

#### Copilot (Gemini 3.1 Pro Preview) — Paid

This was the best option I tested, it offers strong reasoning and fast response times.

**Token cost**: The initial system prompt consumed roughly 1% of the GitHub Copilot premium token allowance. Each follow-up message cost 0.4–0.6%, so a typical session of 10 messages uses around 5–7% of the monthly allowance.

> **Note**: Tested before June 1, 2026, when GitHub Copilot adjusted multipliers for annual plans. [More info](https://docs.github.com/en/copilot/reference/copilot-billing/model-multipliers-for-annual-plans)

#### Google (`google/gemini-2.5-flash-lite`) — Free with API key

Performance was comparable to Copilot: the first run took around 3 minutes, and per-message responses were in the 30–90 second range. `gemini-2.5-flash-lite` is a lightweight model designed for low latency, which explains why it performs well despite being on a free tier. It works very well in Windows Sandbox, but you can hit the free API quota quite quickly.

## Summary

In this article, we walked through **setting up OpenClaw from scratch** inside Windows Sandbox, an isolated, throwaway environment that's ideal for experimenting safely. We automated the entire Node.js and OpenClaw installation with a single `.wsb` config file, stepped through the `openclaw onboard` wizard section by section and explained what each choice actually does so you're not just clicking through blindly.

We then tested OpenClaw with four different providers to see how they compare in practice.

If you want a usable experience without paying, **Google `gemini-2.5-flash-lite`** was the best free option tested. It's fast and reasons well, but you can hit the free API quota quickly. **NVIDIA** `minimaxai/minimax-m2.5` was also fast and handled reasoning decently. **NVIDIA** `moonshotai/kimi-k2.5` and **OpenRouter free models** were too slow for practical use, first runs took 25–30 minutes and individual messages rarely came back in under 3 minutes. **GitHub Copilot** delivered the best experience overall, but at a cost: a single test session consumed roughly 5–7% of the monthly premium token allowance.

If you're new to OpenClaw, Windows Sandbox is the right place to start. You can experiment freely, make mistakes and close the session with nothing left behind on your host machine.

## Troubleshooting

### Reached a rate limit
While testing multiple models with Google, I eventually hit the free-tier quota. This resulted in rate limiting when using the `google/gemini-3.1-flash-lite-preview model`.

Errors may look like this:

```PowerShell
14:48:14 [diagnostic] lane task error: lane=main durationMs=9001 error="FailoverError: An unknown error occurred"
14:48:14 [diagnostic] lane task error: lane=session:agent:main:main durationMs=9006 error="FailoverError: An unknown error occurred"
14:48:14 [model-fallback/decision] model fallback decision: decision=candidate_failed requested=google/gemini-3.1-flash-lite-preview candidate=google/gemini-3.1-flash-lite-preview reason=timeout next=none detail=An unknown error occurred Embedded agent failed before reply: An unknown error occurred
```

These errors typically indicate that the request was rate-limited or timed out due to quota exhaustion.

**How to fix it:**
- Switch to a different model (e.g. another Gemini variant or a different provider)
- Wait for the quota to reset (depending on your API limits)
- Reduce request frequency or prompt size if you're testing heavily

### Test that the key and model work

If you switch using `openclaw configure --section model`  or add a new model to the configuration you can verify that it works using:

```PowerShell
openclaw infer model run --prompt "Reply with exactly: ok" --json
```

A successful response should look like this:
```PowerShell
{
  "ok": true,
  "capability": "model.run",
  "transport": "local",
  "provider": "nvidia",
  "model": "nvidia/nemotron-3-nano-30b-a3b",
  "attempts": [],
  "outputs": [
    {
      "text": "ok",
      "mediaUrl": null
    }
  ]
}
```

If `ok` is `false` or you see an auth error, double-check that:
- Your API key is valid and correctly set
- The model ref matches exactly what you set during onboarding
- You saved the file and restarted the gateway
```PowerShell
openclaw gateway restart
```
