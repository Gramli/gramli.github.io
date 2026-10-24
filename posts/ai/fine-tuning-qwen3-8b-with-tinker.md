---
layout: post
title: "Fine-Tuning Qwen3-8B with Tinker: From 50% to 76% Accuracy, and Burning Through My Budget"
date: 2026-10-18
categories: [ai, machine-learning, fine-tuning, qwen, tinker, aspnet]
description: "Fine-tuning Qwen3-8B with Tinker to build Complexity Scorer, improving accuracy from 50% to 76%, and learning lessons about synthetic training data and AI agent budgets."
canonical_url: "https://dev.to/gramli/fine-tuning-qwen3-8b-with-tinker-from-50-to-76-accuracy-and-burning-through-my-budget-48mh"
---

# Fine-Tuning Qwen3-8B with Tinker: From 50% to 76% Accuracy, and Burning Through My Budget

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

Oktoberfest? YES! 🍺 Ah... this one is Hacktoberfest. Okay, still nice! 😁

I couldn't miss Hacktoberfest, and *Side Hustle* sounds like a pretty good challenge name. And with so many prize categories and promo codes, hmm... let's pick something that could save me some money.

Thinking Machines actually sounds interesting (it reminds me of the *Mortal Engines* movie, which makes it even better). So, let's fine-tune a model.

Since this is my introduction to fine-tuning, I wanted to pick something relatively simple, but also useful. Ideally, something that could save me or my fellow developers some money on AI API calls. It should be fast, work with an open-weight model, and actually make sense as a side hustle.

And that's how I came up with **Complexity Scorer**.

## What I Built

So, what exactly is Complexity Scorer?

The idea is simple. Imagine you're using an expensive AI model for every request, even trivial ones like extracting a value from JSON or formatting some text.

Do you really need an expensive reasoning model for that? Probably not.

But your AI application doesn't necessarily know how complex an incoming prompt is, so it might send everything to the same model. That's where **Complexity Scorer** comes in. Before sending a prompt to an AI model, your application calls Complexity Scorer, a lightweight endpoint backed by a fine-tuned open-weight model. It estimates the prompt's complexity and returns a score between **0.00 and 1.00**.

Here are the reference levels:

| Score | Complexity | Description |
|---|---|---|
| 0.00 | Trivial | Almost no reasoning. Extraction, formatting, or deterministic transformations. |
| 0.25 | Easy | Limited interpretation or a few straightforward steps. |
| 0.50 | Moderate | Multiple steps, combining information, some domain knowledge, or several constraints. |
| 0.75 | Hard | Substantial reasoning, non-obvious tradeoffs, domain expertise, or many interacting constraints. |
| 1.00 | Very hard | Deep multi-step reasoning, expert-level analysis, significant uncertainty, or interactions between several complex systems. |

Your application can then use that score to decide which AI model should handle the actual request.

Simple prompt? Use a cheaper model.

Complex problem? Send it to something more capable.

That's it. Of course, it's not limited to API endpoints. You could use it in AI agents, coding tools or any application that needs to choose between different models. And because it's based on an open-weight model, you could even run it locally using something like Ollama, once the fine-tuned model is exported into a compatible format.

The potential customers? Developers and teams building AI-powered applications who want to reduce their API costs without blindly routing everything to cheaper models.

And how would I actually make money from this? Well, the model itself would remain free for anyone to download and use. I'd charge only for the convenience of using my hosted API, probably with a small free tier and monthly subscriptions that include a certain number of requests. Of course, the pricing would have to be low enough that developers actually save money by using Complexity Scorer. Otherwise, what's the point?

## Demo

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.youtube.com/embed/1QYSnGmGVhc" title="Complexity Scorer demo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"></iframe></div>

## Code

[Complexity Scorer API on GitHub](https://github.com/Gramli/complexity-scorer-api)

[Complexity Scorer training project on GitHub](https://github.com/Gramli/complexity-scorer)

[Complexity Scorer model adapter on Hugging Face](https://huggingface.co/Gramli/complexity-scorer)

## How I Built It

Okay, let's start with the model training process, because this was probably the most interesting part of the whole project.

To use Tinker, I first needed to set up a Python environment. I'm mostly a .NET developer, and I only use Python on rare occasions, so I had to install Python, the Tinker packages, and authenticate with Tinker. Fortunately, with a little help from ChatGPT, it was pretty straightforward. I ran into some trouble with Microsoft C++ Build Tools along the way, but nothing too dramatic.

With the environment ready, I moved on to what might be the most important decision of the project: **choosing the model to fine-tune.**

### Choosing the model

The open-weight model is the core of Complexity Scorer. My first selection criterion was simple: **training cost on Tinker**. After comparing the available models, I narrowed my options down to two of the cheapest candidates that seemed suitable for this task.

| Model | Context | Type | Parameters | Prefill / 1M | Sampling / 1M | Training / 1M |
|---|---|---|---|---|---|---|
| Qwen3-8B | 32K | Hybrid | 8B | $0.195 | $0.60 | $0.44 |
| GPT-OSS-20B | 32K | Reasoning | 21B / 3.6B active | $0.18 | $0.45 | $0.396 |

[Source: Tinker Models & Pricing](https://tinker-docs.thinkingmachines.ai/tinker/models/)

**GPT-OSS-20B** is actually cheaper on paper, but there's a catch: it's a reasoning model that always generates chain-of-thought tokens before answering. That's not ideal for a classifier that's supposed to return a single number as quickly and cheaply as possible.

**Qwen3-8B**, on the other hand, is a Hybrid model. It supports both thinking and non-thinking modes, which means we can disable reasoning for faster classification.

So I picked **Qwen3-8B** for three reasons:

- **Hybrid architecture:** We can disable reasoning to reduce unnecessary tokens and latency.
- **No unnecessary vision capabilities:** We're classifying text prompts, not images.
- **Task-specific fine-tuning:** Tinker specifically recommends starting with Hybrid models for this type of task.

And with a 32K context window, it should be more than enough for the prompts I want to classify.

Now comes the interesting part: can I actually teach it to estimate prompt complexity?

### Smoke Tests

Okay, I didn't jump straight into fine-tuning. First, I started with a simple Python script (`test_tinker.py`) just to check whether I could actually call Tinker. Once that worked, I prepared a small evaluation dataset with 50 examples (`eval.jsonl`) and a `baseline.py` script to evaluate the selected model against it.

My first evaluation was against the original **Qwen3-8B**, without any fine-tuning.

The result? **50% accuracy**. Not bad for a starting point.

Next, I prepared 50 training examples (different from the evaluation dataset), saved them in `train.jsonl`, and ran my `train.py` script. After fine-tuning finished, I evaluated the model again using the same 50 evaluation examples.

And the result? **86% accuracy!**

That was a little shocking, but also pretty exciting. Just 50 training examples and such a big improvement? Naturally, I thought that more training data would give me even better results. So I prepared another dataset with 500 training examples and trained the model again.

Well... I couldn't have been more wrong. 🤣

The accuracy actually **dropped to 74%**.

Hmm... not exactly what I expected.

I tried experimenting a little with the hyperparameters, but the accuracy stayed around 74%. And since I'm definitely not an ML engineer, I decided to stop experimenting with smoke tests and move on to the full fine-tuning run.

### Fine-Tuning

At this point, I had everything prepared. The scripts worked, the evaluation dataset was ready, and I knew the model could learn the task.

The last thing I needed was more training data.

I chose **2,500 training examples** as a balance between dataset diversity, generation effort, and training cost. With five complexity levels, that meant 500 examples per class, which sounded like a reasonable starting point.

So I prepared a prompt and gave it to GPT-6.1 Sol with high thinking effort.

And then it happened...

I asked Sol to generate 2,500 training examples for my LLM. It started working, and I left it alone. Previously, generating 500 examples had taken around 30 minutes, so I expected this to take a while. But after approximately 47 minutes, things started looking suspicious. Still, I thought, well, 2,500 examples is a lot of data. Maybe it just needs more time. Meanwhile, I was browsing the web and randomly opened the billing tab on Tinker.

**$2.47?! WHAT?!**

I immediately stopped Sol and checked what it was actually doing. Instead of just generating training examples, it had started running model training in the background. There were 18 sessions involving different models, including `deepseek-ai/DeepSeek-V3.1`, `moonshotai/Kimi-K2.6`, and `Qwen/Qwen3.5-397B-A17B`.

Oh my... I asked for training **data**, not for an AI training marathon..

By the time I stopped it, my remaining Tinker balance was down to **$2.11**.

Well, there's a nice little lesson about giving AI agents access to paid services. Maybe I should write another article about that someday.

Anyway, back to the dataset.

This time, I decided to be a little more careful. I switched to Luna with medium thinking effort and prepared a prompt to generate just **200 training examples at a time**. Then I manually ran it ten times, each time focusing on different types of prompts to improve dataset diversity, and added another 500 examples from my previous Sol generation run.

Why manually? Well, after the previous incident, I wasn't exactly eager to let another AI agent run wild with my budget. And thinking about it now, I probably should have used Luna for data generation from the beginning. Sol was a bit overkill for this task.

So after that incident, I finally managed to run the fine-tune with all 2,500 training examples successfully. This time, the model achieved **76% accuracy**. That's a 26-percentage-point improvement over the original Qwen3-8B, which achieved only 50% accuracy on the same evaluation dataset.

### What's interesting?

More training data didn't meant better results on my evaluation dataset. The model trained on just 50 examples still performed best, with **86% accuracy**, beating the 2,500-example model by 10 percentage points.

But why? Well, there are a few possible explanations how i explain it (again i am not ML engineer)

First, all my training data was AI-generated, and AI doesn't always judge complexity consistently. One example might be labeled `0.50`, while a very similar one might get `0.75`. With more generated examples, there are also more opportunities for inconsistent labels, which can confuse the model during training.

And Second, my evaluation dataset contained only 50 examples. That's pretty small, and it's possible the first fine-tuned model simply happened to perform particularly well on those specific examples. A larger and more diverse evaluation dataset might tell a different story.

Still, the 2,500-example model learned to recognize all five complexity levels pretty well. The final model's accuracy across the five complexity levels looked like this:

| Complexity score | Level | Correct | Accuracy |
|---|---|---|---|
| 0.00 | Trivial | 8/10 | 80% |
| 0.25 | Easy | 6/10 | 60% |
| 0.50 | Moderate | 7/10 | 70% |
| 0.75 | Hard | 7/10 | 70% |
| 1.00 | Very hard | 10/10 | 100% |
| **Total** | | **38/50** | **76%** |

All 12 incorrect predictions were off by just one complexity level, so even when the model was wrong, it wasn't completely wrong.

And increasing the dataset from 500 to 2,500 examples only improved accuracy from **74% to 76%**. That's just one additional correct prediction out of 50, which is too small a difference to draw any meaningful conclusions.

So, what did I learn? More training data doesn't automatically mean a better model. The quality of the training data matters, and so does how you evaluate the results.

You can see the accuracy results for all four models I tested below:

![accuracy results](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/6157ldlr0lmae8ivdqg8.jpg)

### Bringing It to Life

So, the model was finally trained. The next step was to publish it somewhere so other developers could download and use it.

I was a little worried about this step, but fortunately, Tinker supports pushing fine-tuned model adapters directly to Hugging Face. And it turned out to be surprisingly easy, just one command:

```powershell
tinker checkpoint push-hf "tinker://c2148695-43ab-5758-aaff-bd78ddda980d:train:0/sampler_weights/final" --repo Gramli/complexity-scorer --public
```

And that's it. My fine-tuned adapter was available on [Hugging Face](https://huggingface.co/Gramli/complexity-scorer).

Now, the last thing was to build the API.

As a backend developer, this was probably the most boring part of the project. I simply created a .NET Minimal API with the usual API stuff like API key authentication, rate limiting, exception handling, etc.

Then I added a service to communicate with Tinker API. Yep, Tinker has its own API endpoint:

```plaintext
https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1/
```

So you can actually call your fine-tuned model without deploying it yourself, which is great for experimenting. Of course, these inference requests still cost money.

I also added a simple Svelte playground so developers can enter their own prompts and see the complexity scores directly in the browser.

## Why Does Open Innovation Matter?

Well, I could have built Complexity Scorer by simply calling some powerful closed AI model and asking it to classify prompt complexity. That would probably have been much easier. But then every request would depend on that provider's API, availability, and pricing.

With an open-weight model like Qwen3-8B, I can actually fine-tune it for my specific task, experiment with different training datasets, and share the result with other developers, potentially at a fraction of the cost (or maybe not if you use Sol like I did 🤣). Sure, it cost me some time, but that's part of open innovation.

And here's the biggest advantage: anyone can download my fine-tuned adapter from Hugging Face, combine it with the base model, and run it on their own hardware with a compatible runtime. No need to use my API or pay Tinker for every request.

Other developers can also improve the project, train their own versions, or integrate it into their applications. Of course, running a model locally still requires hardware and electricity, but at least you're not tied to a single API provider.

And that's what I like about open innovation. I'm not just building an API that other developers can call. I'm sharing what I learned while building it and giving them something they can actually build upon.

## Prize Categories

I'm entering the **Best Use of Tinker** category because, as a good old backend developer, I got to tinker with the world of ML engineering, learn something new, share my journey, and actually build and deploy something useful.

Not bad for my first fine-tuning experiment! 😁
