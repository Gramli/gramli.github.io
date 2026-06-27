---
layout: post
title: "Tower Before Dusk: I Built a Puzzle Game for Humans and AI"
date: 2026-06-18
categories: [experiments, typescript, game-development, webmcp, ai, cloudflare]
description: "A TypeScript puzzle game using WebMCP to let humans and AI solve the same time-limited pathfinding challenge."
canonical_url: "https://dev.to/gramli/tower-before-dusk-i-built-a-puzzle-game-for-humans-and-ai-oao"
---

It's interesting how the most exciting ideas always arrive when I have basically no time to work on them.

A few weeks earlier, I had finished my submission for the GitHub challenge by bringing an old WinForms game back to life. That project turned out to be a lot of fun. Then [Sylwia Laskowska](https://dev.to/sylwia-lask) published a [great article](https://dev.to/sylwia-lask/is-this-how-well-build-websites-soon-webmcp-live-demo--2e33) about [Google's WebMCP](https://developer.chrome.com/docs/ai/webmcp). The idea fascinated me, but I wasn't sure where I could actually use it. Then the June Solstice Game Jam was announced. The idea hit me like a lightning bolt: **What if I made a game that both humans and AI could play?**

Let's do it.

## What I Built

I created a puzzle game with a solstice theme called **Tower Before Dusk**. The goal is simple: reach your home tower before sundown. Every action costs time. Every step brings sunset a little closer. Rivers block your path, rocks force detours and the only way across water is to collect enough wood and build bridges. Move too much, collect unnecessary resources, or choose the wrong path, and night will arrive before you make it home.

The challenge isn't just solving the puzzle. It's solving it efficiently. 

And apparently, that's difficult for both humans and AI.

## Video Demo

In this demo, Gemini 3.1 Flash-Lite tries to solve the level using the exposed game tools. It fails, then I restart the level and solve it manually. That failure is part of the point: the tools worked, but reasoning through the puzzle was still hard for the lightweight model.

https://youtu.be/19rt8mWbjs4

https://tower-before-dusk.gramli.workers.dev

## Code
https://github.com/Gramli/tower-before-dusk 

## How I Built It
Since WebMCP was completely new to me, I didn't want to jump straight into building a game without understanding how it worked first.

So I generated a simple Vite application and experimented with a tiny counter tool:

```ts
const incrementCounterTool = {
  name: "incrementCounter",
  description: "Increments the counter by a specified value.",
  inputSchema: {
    type: "object",
    properties: { value: { type: "number" } },
  },
  execute: async ({ value }: { value: number }) => {
    const counter  = document.getElementById('counter') as HTMLElement;
    if (counter) {
      const currentValue = parseInt(counter.innerText, 10) || 0;
      counter.innerText = (currentValue + value).toString();
    }
  },
  annotations: {
    readOnlyHint: false,
    untrustedContentHint: true
  },
};
```

When the AI successfully incremented the counter and I saw the value changing in the browser, I knew I could continue.

Of course, my game would be a little more complicated than a counter. At first, I considered letting the AI inspect the game state after every move, but then I realized I would burn through tokens incredibly fast. So I came up with another approach.
 
Instead of playing move by move, the AI would receive the entire game state, understand the rules, and generate one complete plan to reach the goal, but then another thought appeared:

"How do I make it look like the AI is actually playing?"

The answer was surprisingly simple. The AI would return a sequence of actions and my game loop would replay them with a short delay between moves. From the player's perspective, it would look like the AI was thinking and playing in real time.

Even better, it fit perfectly with the game's architecture, because human players already interact through keyboard actions that modify the game state.

With that idea in mind, I built the MVP.

I did it the "old-fashioned" way: player first. (Almost like mobile-first, except with fewer trendy conference talks.)

I also have to admit that I stole some core ideas from my previous [EasterGame](https://dev.to/gramli/i-used-my-last-7-of-copilot-tokens-to-bring-a-2014-winforms-game-back-to-life-30mo) project. At this point, I'm starting to suspect I accidentally built the beginnings of a tiny puzzle game engine.

The first playable level looked like this:

![Level MVP](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dh118sjtvripiiee1or8.png)

The game worked, You could reach the tower and win. It was finally time to bring AI into the picture.

Based on the original idea, I created two MCP tools:

- `getGameState`
- `submitPlan`

`getGameState` provides the complete state of the current level, including objectives, rules, available actions, and the visible map:

```ts
export const gameState: GameState = {
  objective:  "Reach G before sunset using as few moves as possible. Do not collect unnecessary wood.",

  legend: {
    P: "player start position",
    ".": "land / walkable tile",
    W: "wood / walkable tile, can be collected",
    "~": "water / blocked unless player has enough wood",
    R: "rock / blocked tile",
    B: "bridge / walkable tile created after entering water",
    G: "goal / walkable tile",
  },

  rules: {
    map:
      "visibleMap is an array of map rows from top to bottom. The first symbol in each row is x=0, and rows start at y=0. Symbols are separated by spaces for readability.",

    movement:
      "The player can move one tile up, down, left, or right. Each movement costs 1 move.",

    rock:
      "Rock tiles marked R are blocked and cannot be entered.",

    wood:
      "Tree tiles marked W are walkable, but entering W automatically collects the tree. This costs 1 extra move, adds 1 wood, and removes W from the map. Because collecting wood costs an extra move, avoid W unless the wood is needed to cross water.",

    water:
      "Water cannot be entered unless the player has at least 2 wood.",

    bridge:
      "When the player moves into a water tile with at least 2 wood, a bridge is built automatically on that single water tile. This costs 1 extra move, consumes 2 wood, and changes only that one water tile to B. Other connected water tiles remain water.",

    bridgeLimit:
      "Each bridge covers only one water tile. If there are multiple water tiles in a row, the player needs enough wood to build one bridge per water tile.",

    strategy:
      "Use the minimum number of actions needed to reach G. Do not collect wood unless it is required to build enough bridges. Avoid stepping on W unless that wood is necessary. Extra wood has no value at the end.",

    goal:
      "The player wins immediately when reaching G using no more than the maximum allowed moves.",

    lose:
      "The player loses if the move budget is exhausted before reaching G, or if no valid action can reach G.",
  },

  actions: [
    "MOVE_UP",
    "MOVE_DOWN",
    "MOVE_LEFT",
    "MOVE_RIGHT",
  ],

  remainingMoves: 30,
  wood: 0,

  visibleMap: [
    "P . W W W W ~ ~ G",
  ],
};
```

The second tool, `submitPlan`, accepts the AI's proposed solution:

```ts
    inputSchema: {
      type: "object",
      properties: {
        actions: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "MOVE_UP",
              "MOVE_DOWN",
              "MOVE_LEFT",
              "MOVE_RIGHT",
            ],
          },
        },
        summary: { type: "string" },
      },
      required: ["actions"],
      additionalProperties: false,
    },
```

The AI returns an array of actions such as:

```ts
["MOVE_UP","MOVE_DOWN","MOVE_LEFT","MOVE_RIGHT"]
```

Then `submitPlan` feeds those actions into the game loop, which replays them with a short delay so players can watch the AI attempt to solve the puzzle.

Pretty neat, right?

Well... It worked. The AI successfully called both tools and then it immediately exposed another problem: my level design was too difficult. Even Level 1 turned out to be surprisingly challenging for the models I tested.

For development and testing, I used the WebMCP Inspector with the Gemini models available through the free API tier:

- Gemini 3 Flash Preview
- Gemini 3.1 Flash-Lite
- Gemini 3.5 Flash

All three models correctly called both tools, but none of them managed to generate a valid solution for just Level 1. At that moment, I realized that perhaps I had been a little too optimistic about my puzzle design, so I lowered the difficulty. Eventually, AI finally managed to reach the tower and complete the first level.

Victory ...Well... a small victory. I'm fairly sure stronger models would perform better on the harder levels, but I also didn't want to discover how much puzzle-solving curiosity could cost in API tokens.

If you'd like to try it yourself, this is the prompt I used:

```text
You are playing Tower Before Dusk.

First call getGameState. Study the objective, legend, rules, remainingMoves, wood, and visibleMap.

Create one complete plan to reach G before sunset. Use only the listed actions. Account for move costs, automatic bridge building, wood collection, rocks, water, and remainingMoves.

Then call submitPlan exactly once with the full action list. Do not submit partial plans.
```

## Interesting Thoughts

Going into this project, I assumed the hardest part would be integrating WebMCP into the game, but it wasn't.

The real surprise was discovering that even simple puzzle levels weren't trivial for AI models. The tools worked almost immediately, but designing levels that felt straightforward to humans while making AI struggle turned out to be an interesting challenge.

It made me realize that puzzles we consider "easy" often rely on intuition and reasoning patterns that aren't as obvious to language models as I had expected.

## The Sunset Arrives

And that's how Tower Before Dusk came to life. I set out to build a game for the June Solstice Game Jam and explore an experimental technology, discovering that simple-looking puzzle games aren't necessarily simple for AI and creating something that humans and language models can both struggle to beat.

Honestly, I think that's a pretty fitting result for a game about racing against the setting sun.
