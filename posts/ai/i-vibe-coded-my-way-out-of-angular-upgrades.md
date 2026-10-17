---
layout: post
title: "I Vibe-Coded My Way Out of Angular Upgrades"
date: 2026-10-15
categories: [ai, angular, open-source]
canonical_url: "https://dev.to/gramli/i-vibe-coded-my-way-out-of-angular-upgrades-4fkh"
description: "Creating and refining an Angular Update Skill for Codex to handle migrations, clean-install validation, and publishing requirements across three open-source projects."
---

# I Vibe-Coded My Way Out of Angular Upgrades

Do you also hate upgrading Angular versions? Because I do. I maintain a few open-source projects, and upgrading Angular is probably my least favorite maintenance task. That's also why my frontend updates often get postponed for far too long.

But we have AI now, right? It should be able to handle this with some instructions. So I decided to create (or rather vibe-code) an **Angular Update Skill for Codex**.

## Creating the skill

Upgrading Angular isn't just about running `ng update`. There are several things I normally have to take care of, so I created a prompt describing what the skill should do:

- Follow the official [Angular Update Guide](https://angular.dev/update-guide).
- Create a separate Git branch for the upgrade.
- Handle migrations and dependency updates.
- Validate that everything still builds and works.
- Follow the same good practices I would use when upgrading Angular manually.

(Updating NuGet packages in .NET feels so much simpler.)

Codex generated the first version of the skill, and surprisingly, it worked!

Well... locally.

### First problem: npm ci

After pushing my changes to GitHub, the CI pipeline failed with:

```plaintext
npm ci can only install packages when your package.json and package-lock.json are in sync.
```

Classic "works on my machine" problem. The skill had managed to update Angular, but it hadn't properly validated that a clean installation would work. So I added another validation step: run `npm ci` before considering the upgrade complete. This way, the agent can catch problems with the lock file before they reach CI.

### Second problem: npm publishing

Then I ran into another issue when trying to publish my Angular library to npm:

```plaintext
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/gramli-angular-mydatepicker - Not found
```

At first, the error wasn't particularly helpful. After some investigation, I found that my publishing environment was using Node.js 22 with npm 10.

However, according to the [npm trusted publishing documentation](https://docs.npmjs.com/trusted-publishers), trusted publishing requires:

- Node.js 22.14.0 or higher
- npm 11.5.1 or higher

So I updated the skill again to prefer the latest Node.js LTS version compatible with the target Angular version, while also making sure the npm version meets any publishing requirements.

### Third problem: the skill was getting too big

After all these improvements, the skill was becoming quite large. That might not matter much with generous token limits, but I also wanted it to be usable by people working with more limited AI budgets. So I shortened the instructions, removed unnecessary repetition, and kept the important validation steps. The main skill went from 1,252 words to 701 words, with the complete bundle becoming approximately 40% shorter.

## Testing it on real projects

Of course, generating a skill is one thing. Actually using it is another. So far, I've used the current version on three of my open-source projects:

- **Angular 21 → 22:** [angular-mydatepicker PR #12](https://github.com/Gramli/angular-mydatepicker/pull/12)
- **Angular 19 → 22:** [FileApi PR #13](https://github.com/Gramli/FileApi/pull/13)
- **Angular 21 → 22:** [AuthApi PR #113](https://github.com/Gramli/AuthApi/pull/113)

The Angular 19 → 22 upgrade was especially interesting because it required migrations across three major versions. In the AuthApi project, the upgrade also involved replacing PrimeNG with Optimus UI because of the PrimeNG licensing changes.

All three upgrades have now been merged.

## Three Projects Later

The current version works pretty well, at least on my smaller projects. It's not perfect, though. Some Angular projects are much more complicated than mine, so the skill would probably need to be adapted for them. But it already helped me upgrade three projects, and I learned a few things along the way.

The best part? I finally updated my Angular projects in just ONE WEEK instead of postponing them again. 😁

I wanted to share this with the community because it might help someone else. If you want to try the skill or improve it, you can find it here:

**[Angular Update Skill on GitHub](https://github.com/Gramli/Gramli.Framework/tree/main/src/angular-skills/angular-update)**
