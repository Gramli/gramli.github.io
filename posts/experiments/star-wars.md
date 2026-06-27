---
layout: post
title: "A Silly Idea: A Star Wars Lightsaber Duel in the Terminal with GitHub Copilot CLI"
date: 2026-02-09
categories: [experiments, dotnet, csharp, github-copilot, cli, animation]
description: "Building a Star Wars-inspired lightsaber duel entirely in the terminal with .NET, Unicode animation, and GitHub Copilot CLI."
canonical_url: "https://dev.to/gramli/a-silly-idea-a-star-wars-lightsaber-duel-in-the-terminal-with-github-copilot-cli-1ki7"
---

## 🎬 What I Built
<!-- Provide an overview of your application and what it means to you. -->
In a previous submission for a [productivity tool](https://dev.to/gramli/msg-rocket-from-diff-to-decision-with-github-copilot-cli-1ba8), I sneaked in a small Easter egg inspired by **The Matrix**. That led to a slightly silly thought, what if I built an actual movie scene using **GitHub Copilot CLI**, rendered **entirely in a terminal** with Unicode characters?

That idea stuck with me. **It sounded unnecessary, impractical…** and kind of **awesome** 🙂

So I decided to create a **Star Wars inspired lightsaber duel in pure CLI.** My very first idea was the Lord of the Rings “Ride of the Rohirrim” scene 🐎🐎, but I quickly realized I should keep the scope smaller — after all, it’s still just a terminal and Unicode characters. :laughing:

## 📽️ Teaser
<!-- Share a link to your project and include a video walkthrough or screenshots showing your application in action. -->

*The full animation is a bit too long for this post, so I prepared a short “teaser” instead.*

![Duel of the CLI - Teaser](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vr46bo9ajojducqrqj4a.gif)

#### [View the complete version (~65 seconds) on GitHub](https://github.com/Gramli/star-wars-animation/blob/master/Assets/star-wars-animation-full.gif)


#### 🏃‍♂️ Run it locally
```shell
git clone https://github.com/Gramli/star-wars-animation.git
cd star-wars-animation
dotnet run
```
**Note:**
- You’ll need **.NET 10 SDK** installed.
- Use a font with good Unicode support (e.g., **Cascadia Code**).
- The **Visual Studio Console** or **VS Code terminal** render the block characters best -> they’re true Jedi-level terminals 😄

> ⚠️ Running in classic `cmd.exe` or other limited terminals may break the animation. Consider it a **training exercise for Padawans**, only the worthy (and properly equipped) terminals will experience the duel in all its glory.

## :movie_camera: My Experience with GitHub Copilot CLI
<!-- Explain how you used GitHub Copilot CLI while building your project and how it impacted your development experience. -->

I brought the idea and created several [detailed prompts](https://github.com/Gramli/star-wars-animation/tree/master/.github/prompts). Copilot handled most of the code generation and quickly produced a nice draft version. However, something was missing — it lacked soul.

At that point, **Copilot stopped being just a code generator** and became a **Creative Director.** I kept refining prompts, pushing for stronger visuals, better animation flow, and more cinematic moments.

Here’s a real example of how our “conversation” looked:
- **Me:**
*The animation works and we already have some nice effects, but we need to take it to the next level an Oscar-movie level. We need a real wow effect that makes this animation stunning. Can you suggest 3–5 ideas?*

- **Copilot:**
```text
Here are a few ways to push the animation toward a more cinematic feel, even within CLI constraints:

1. Lightsaber motion trails to make fast swings feel fluid and powerful  
2. Gradient-based lighting to simulate glow and light falloff  
3. Impact shockwaves that briefly distort the screen on heavy clashes  
4. Molten damage on walls and floors that cool over time  
5. Cinematic letterboxing during key moments to focus attention  

I’d start with motion trails and molten damage for the biggest visual impact.
Which one would you like me to implement first?
```

Copilot responded with ideas like motion trails for lightsabers, gradient lighting, shockwave effects, molten damage on walls, and even cinematic letterboxing. Some of them made it into the final version, others stayed on the cutting-room floor, but the **process itself was surprisingly fun**.

I was genuinely impressed. Copilot helped transform a simple ASCII-style drawing into a small but entertaining show. Sure, it’s not an Oscar-winning movie, but for a playful, slightly ridiculous idea, I think it turned out pretty cool.

### 💥 When We Failed (And Pivoted)

Things went smoothly… until I had a **very bad idea**:

**“What if we add a camera rotation illusion?”** 😅

Yeah. That was ambitious.

This turned out to be a real challenge, even for Copilot. After many new sessions and repeatedly reworking prompts, we eventually had to pivot. A full Y-axis camera rotation just wasn’t readable with simple ASCII silhouettes, so we ended up experimenting with X-axis rotation and a top-down view instead.

At that point, the silhouettes are so minimal that the viewer has to mentally accept the perspective shift, but that’s part of the charm (and limitation) of doing cinematic nonsense in a CLI.

And honestly? That experimentation, even when it didn’t fully work was one of the most fun parts of the project.

## 💭 Final Thoughts

I really enjoyed this ride. Using **GitHub Copilot CLI** for something completely **non-practical, visual, and slightly absurd** turned out to be a **great experience**. It pushed me to think differently about prompts, iteration, and collaboration with an AI, not just as a tool, but as a **creative partner**.

**May the Source be with you!**
