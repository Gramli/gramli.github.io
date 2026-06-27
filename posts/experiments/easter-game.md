---
layout: post
title: "I Used My Last 7% of Copilot Tokens to Bring a 2014 WinForms Game Back to Life"
date: 2026-06-02
categories: [experiments, typescript, csharp, game-development, html5-canvas, github-copilot]
description: "Modernizing a 2014 C# WinForms puzzle game as a responsive TypeScript canvas game with help from GitHub Copilot."
canonical_url: "https://dev.to/gramli/i-used-my-last-7-of-copilot-tokens-to-bring-a-2014-winforms-game-back-to-life-30mo"
---

Originally, I didn't plan to join this challenge because I'm moving away from Copilot due to its recent pricing changes.

Don't get me wrong, I’m not upset with the provider at all. I used Copilot on hobby projects for a long time and was generally very satisfied with it. However, it has simply become too expensive for the way I use it.

But I still had 7% of my premium tokens left before June 1st and one free afternoon. Then an idea came to mind: Challenge accepted. (Sorry, Gemma 4 article, you'll have to wait a little longer.)

And honestly, I'm glad I did it.

## What I Built

This project is less about the code and more about nostalgia, bringing an old university student game into the modern era.

I originally created this game for a developer community competition in my country. The original version is still available online: [www.itnetwork.cz - EasterGame](https://www.itnetwork.cz/csharp/winforms/csharp-windows-forms-zdrojove-kody/hra-eastergame).

The game actually ended up as one of the winners. I won a few stickers and wore them proudly 😄

So I decided to spend my remaining Copilot tokens bringing this nostalgic game back to life and making it accessible to a much wider audience.

What is the game about?

It's a puzzle game where a rabbit must collect all the Easter eggs and reach the exit door. The catch is that after every move, the ground behind the rabbit turns into water, so you need to plan your route carefully or you'll get stuck.


![Old WinForms App](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/smv5bxp6mheru2pdjlqi.JPG)


There are also a few additional mechanics:

- Teleports connected in pairs
- Carrots that grant the ability to jump over rocks
- Obstacles that force you to think several moves ahead

The original version contained seven levels, and even back then the code was designed to make adding new levels relatively easy.


<!-- Provide an overview of your project, where it started, and what it means to you. -->

## Demo
<!-- Share a link to your project and include a video walkthrough or screenshots showing your application in action. -->

{% embed https://eastergame-768859394911.europe-west1.run.app/ %}

## Try Both Versions

If you're curious how close the browser version is to the original, I've included the original WinForms executable in the repository.

- Original WinForms version (2014): [GitHub Repository](https://github.com/Gramli/EasterGame/tree/master/Assets)
- Browser version (2026): [Play Online](https://eastergame-768859394911.europe-west1.run.app/)

Feel free to compare them side by side.

## The Comeback Story
Well... my original project was a Windows Forms game written in .NET Framework 4.5:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
    <startup> 
        <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.5" />
    </startup>
</configuration>
```

That's from around 2014 😊

Back then I wasn't even using English for class names or methods. The entire project was written in Czech. Looking at it today, I don't think the code I produced as a university student was actually that bad. I built the project mainly to better understand object-oriented programming, and looking back, I think that goal was achieved.

What surprised me most, however, was the architecture I designed back then.

I introduced inheritance for both game objects and levels, which made it surprisingly easy to add new entities and levels. The game state itself was managed by a single central class of roughly 430 lines of code. 

It wasn't perfect, but looking back, simplicity was one of its strengths. It worked, and more importantly, it was easy to extend.

So what did I do?

First, I ported the game to TypeScript, keeping both the good and the bad parts of the original design. Then I gradually refactored it to better fit a browser environment.

### Architecture Change

The original WinForms version was already largely event-driven. Keyboard events updated the game state and refreshed the form, while a one-second timer updated the elapsed-time display.

I kept that turn-based model in the browser. Player input updates the game state and redraws the canvas, while a lightweight timer updates the elapsed-time display. There is still no need for animations, delta-time calculations, or a requestAnimationFrame loop.

The browser version follows almost the same approach:

- Player input updates the game state and triggers rendering
- A one-second timer updates the elapsed-time display and refreshes the UI
- No gameplay logic runs between turns

This works because EasterGame is a purely turn-based puzzle game. The gameplay state changes only when the player makes a move. There are no animations, physics calculations, or continuously moving objects that require continuous updates between turns.

As a result, there is no need for:

- a frame budget
- delta-time calculations
- an Update() / Draw() game loop
- requestAnimationFrame

In the browser, `addEventListener('keydown', ...)` maps naturally to the original input-driven design. Rendering only occurs in response to player actions or periodic UI updates, which keeps the implementation simple and avoids the overhead of a continuous rendering loop.

### Responsive Design & Game Control

The second biggest improvement was making the game responsive across all screen sizes while keeping it fully playable.

In the original WinForms application, I rendered everything using `System.Drawing.Graphics`, while the browser version uses `HTMLCanvasElement`. Since I wanted to preserve the look and feel of the original game, I reused the same PNG tiles. To make the game responsive, I calculate the optimal tile size based on the available screen space and then derive the canvas dimensions from it.

I also needed to detect whether the game was running on a touch device and introduce a separate input layer for touch controls. Movement is handled through on-screen controls, while starting a new game or level only requires a tap on the main menu.

One problem I actually struggled with was the embedded preview on DEV. My algorithm detected small devices and displayed touch controls, but the game grid was large enough to cause a vertical scrollbar to appear. 

The solution was to use `window.self !== window.top;` to detect whether the game was running inside an embedded frame and adjust the controls accordingly.

<!-- Tell us where the project was before and what you changed, fixed, or added to finish it up. -->

## My Experience with GitHub Copilot
<!-- Explain how GitHub Copilot supported your process. -->

I started this project with an unusual constraint: only 7% of my premium tokens were left before my subscription reset.

That meant I couldn't simply throw prompts at the problem and hope for the best. Every request had to count.

My first step was asking Copilot to analyze the original .NET Framework solution and create a migration plan for a TypeScript browser version. Surprisingly, this worked very well. Instead of immediately generating code, Copilot helped me understand the project structure and identify the pieces that needed to change.

The actual conversion was a different story.

When I asked Copilot to convert the entire game based on the migration plan it generated, it repeatedly hit response length limits:

```plaintext
Sorry, the response hit the length limit. Please rephrase your prompt.
```

At that point I had already spent some of my remaining tokens, so seeing that message wasn't exactly encouraging.

Instead of trying to convert the whole solution at once, I changed the prompt and asked Copilot to ignore most of the level definitions and focus on converting the core game together with the simplest level.

That worked much better, and it led to the biggest lesson of the migration: Copilot didn't struggle with converting the codebase itself; it struggled with the level definitions.

Once I had a working browser version with a single level, it became much easier to continue. The game architecture was already in place, so adding the remaining levels was mostly straightforward work.

Since Copilot struggled with level design, I decided to give it one last chance. I created a new level called Copilot Level and gave it complete freedom to design it, as long as the puzzle remained solvable and followed the existing game rules.

The struggle was real, though. Copilot managed to generate a valid level, but honestly? The Copilot Level is really easy to finish 😄


![Copilot Level](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2jg2ofh65rskf2um737b.JPG)


At that point I had a working browser version, but bringing it into the modern era also meant supporting touch devices. But wait, I only had 3% left. Time for one carefully crafted prompt to handle responsive tile sizing and touch controls.

The result wasn't bad at all. After a few manual fixes, Copilot even helped me solve issues related to the embedded DEV preview.

Copilot was at its best when acting as a coding assistant rather than a game designer.

It helped me modernize a project that was over a decade old, but the architectural decisions, validation, and final review still required a human in the loop.

In the end, I'm glad I brought this old desktop game into the browser era. And yes, I spent every remaining premium token doing it. It turned out to be a surprisingly fun farewell project for a tool I used for a year. 😊
