---
layout: post
title: "How AI Endpoints Change the Traditional API Flow"
date: 2026-07-26
categories: [dotnet, architecture, rest, ai, api, webdev]
description: "How AI-powered endpoints turn a traditional API flow into an orchestration pipeline requiring output validation, controlled retries, and cost tracking."
canonical_url: "https://dev.to/gramli/how-ai-endpoints-change-the-traditional-api-flow-3773"
---

As a backend developer, I have built hundreds of endpoints, so the typical endpoint flow is deeply ingrained in how I think about web applications. But when I started building AI-powered endpoints, I noticed an interesting shift.

At first, AI endpoints looked like simple proxy endpoints with some configuration for connecting to a model:

```text
API receives request
↓
send prompt to model
↓
receive response
↓
return it to the client
```

And it worked well until I found out that passing a prompt directly from the client was not a good idea. The endpoint could be misused for a completely different purpose, allowing someone else to consume my AI usage credits.

Then I realized that the input also needed limits. Sending a large context for a specific task costs more and may produce unexpected results.

So when I started looking closer, especially when I needed reliable structured output and predictable application behavior, I quickly realized that it was not that simple. Validation was no longer only guarding execution, it had also become a post-processing step. AI models are probabilistic. Even with the same input, they may return different outputs, omit required information, misunderstand instructions or return something that is technically valid but logically wrong. And because every token has a price, I cannot simply retry the request and hope for a better result.

That was when I started questioning whether AI endpoints should be designed in the same way as conventional Web API endpoints.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Conventional Web API Endpoint Flow](#conventional-web-api-endpoint-flow)
- [AI-powered Web API Endpoint Flow](#ai-powered-web-api-endpoint-flow)
- [What This Difference Changes](#what-this-difference-changes)
  - [Unpredictable Latency](#unpredictable-latency)
  - [Retry Logic](#retry-logic)
  - [Idempotency and Side Effects](#idempotency-and-side-effects)
  - [Testing AI Endpoints](#testing-ai-endpoints)
  - [The Output Contract](#the-output-contract)
  - [Observability and Cost](#observability-and-cost)
- [Summary](#summary)

## Conventional Web API Endpoint Flow

A conventional Web API endpoint usually follows a similar flow:

```text
validate request
↓
execute business logic
↓
return representation
```

The first phase is request validation. We validate the incoming data against property constraints, API contracts, authorization rules and application-specific business rules.

The second phase is execution. The application processes data, performs I/O operations or executes business logic.

The final phase is returning a representation of the result. The code executed by a conventional endpoint is normally deterministic within a known application state. When the same code runs against the same state, we generally get the same result.

And that is basically it.

The general flow of a conventional Web API endpoint is relatively simple, although the individual steps can, of course, be very complex. But AI models do not work in exactly the same way. They do not simply execute a predefined sequence of instructions and always produce the same result.

## AI-powered Web API Endpoint Flow

The internal flow of an AI-powered endpoint is usually more complicated:

```text
validate request
↓
prepare prompt, tools and context
↓
generate probabilistic output
↓
validate schema, meaning and safety
↓
retry, repair, reject or fall back
↓
return representation
```

We still start by validating the incoming request. Standard property constraints and business rules are still important, but AI endpoints may also require additional controls. The application may need to restrict the requested topic, limit input size, apply controls against suspicious instructions, isolate untrusted retrieved content or decide which tools the model is allowed to call.

The next step is preparing the prompt and settings for the model call. The application prepares the instructions, conversation history, retrieved context, tool definitions and generation settings.

Then the model produces an output. But unlike the result of conventional business logic, we cannot automatically assume that the output is correct just because the model call succeeded. A successful HTTP response from the model provider only tells us that the model generated something. It does not tell us whether the result is complete, safe, grounded or even useful.

So validation appears again after generation. For example, we may validate the JSON schema in a similar way to a response from a conventional external service. But even when the schema is correct, the result may still be logically wrong for the business domain. The model may also omit properties that are not technically required by the schema but should be present based on the provided context.

When the output fails these checks, the application must decide what to do next. It may try to repair the response, ask the model to generate it again, use a fallback model, return a controlled error or send the request for human review. But every decision has its own cost. A retry consumes more tokens, while human intervention costs both time and money.

All of this turns the endpoint into an orchestration pipeline instead of a simple proxy around a model call.

## What This Difference Changes

With a conventional Web API, the application explicitly defines how the result is created. This means that the execution path is controlled by code and we know what result to expect.

With an AI-powered Web API, the application delegates part of the result creation to a probabilistic system. This means that we no longer fully control how the result is generated. To achieve the expected result, we need to add extra steps to the flow, such as post-processing and output validation.

We can simplify it like this:

* **Conventional Web API:** the backend executes the rules.
* **AI-powered Web API:** the backend orchestrates and evaluates the result.

But this difference affects much more than validation. It also changes how we think about latency, retries, idempotency, testing, observability, cost and output contracts.

There are definitely more differences, but let’s have a look at the ones I discovered along the way.

### Unpredictable Latency

The latency of a conventional endpoint is usually determined by business logic, I/O operations, data processing and similar operations. These operations are not always fast or perfectly predictable, but we can usually measure them separately and optimize the slowest parts by improving the code, optimizing database queries or adding caching.

AI endpoints introduce another level of variability.

Generation time may depend on the selected model, prompt and context size, output length, provider load and other factors. One request may finish after a single model call, while another may require several tool calls, validation attempts or regeneration steps.

So latency is no longer determined only by the operations we explicitly execute. It may also depend on decisions made during model generation.

That makes timeouts, cancellation, streaming, asynchronous processing and latency budgets even more important.

One of the easiest ways to improve the latency of an AI-powered endpoint is to improve the prompt. We can make it more specific, reduce unnecessary context and limit the expected output.

Another example is avoiding the need for the model to return full objects.

For example, we may provide data like this:

```json
{
  "data": [
    {
      "id": 1,
      "name": "john doe",
      "address": "Mordor",
      "category": "Nazgûl"
    },
    {
      "id": 2,
      "name": "joe doe",
      "address": "Gondor",
      "category": "soldier"
    }
  ]
}
```

Then we can instruct the model to return only the selected IDs instead of repeating the full objects.

The backend can map those IDs back to the original data after generation. This reduces the number of output tokens and may improve both latency and cost.

The main point is that we approach latency optimization differently. With conventional endpoints, we usually optimize code, database access or caching. With AI endpoints, we also need to optimize prompts, context size, model selection and generated output.

### Retry Logic

In conventional Web APIs, we often retry I/O operations under specific conditions. For example, we may retry when a dependency is temporarily unavailable, a connection is interrupted or an external service returns a transient status code. These retries are usually based on technical failures.

AI endpoints introduce another type of retry. The request may complete successfully at the transport level, but the generated output may still be unusable. For example, it may miss a required field, break the expected schema, contradict the supplied context or fail a business rule.

Every retry increases latency and consumes additional tokens, which means additional cost. The next attempt may return a different but still incorrect response.

Because of that, AI retries should not be treated like ordinary network retries. They need explicit limits, and we should also consider additional constraints such as the token and monetary budget, the reason for the failure, whether another attempt is likely to help, and whether a fallback model or deterministic alternative is available.

Let’s have a look at this C# retry pipeline, which I used with a local model exposed through Ollama:

```csharp
private static class RetryPipeline<T>
{
    public static readonly ResiliencePipeline<Result<T>> Instance = new ResiliencePipelineBuilder<Result<T>>()
        .AddRetry(new RetryStrategyOptions<Result<T>>
        {
            MaxRetryAttempts = 2,
            Delay = TimeSpan.FromSeconds(2),
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,
            ShouldHandle = new PredicateBuilder<Result<T>>()
                .Handle<HttpRequestException>()
                .Handle<JsonException>()
                .Handle<TaskCanceledException>(ex =>
                   !ex.CancellationToken.IsCancellationRequested)
                .HandleResult(r => r.IsFailed)
        })
        .Build();
}
```

The pipeline retries when it receives an `HttpRequestException`, `JsonException` or `TaskCanceledException`. It allows a maximum of two retry attempts and uses exponential backoff with an initial delay of two seconds.

So far, this looks like a typical resilience pipeline for a conventional API endpoint.

The important difference is this condition:

`.HandleResult(r => r.IsFailed)`

It also retries when the operation does not throw an exception but still returns a failed result.

Inside the action executed by this pipeline, I validate the AI output. If the response is technically valid but logically wrong, I return a failed result and let the pipeline try again.

> **Note:** Simply retrying may not be enough. To prevent the model from producing another invalid result, the validation failure should be included in the next generation attempt so that the model knows what was wrong with the previous response. Without this feedback, the model may repeat the same mistake.

This approach may not be ideal when using a paid model provider because every retry consumes additional tokens and increases the cost. But for a local or free model, a small and strictly limited number of retries may be sufficient.

Sometimes the correct decision is not to retry. It may be better to reject the output, return a controlled error or ask the user for more information.

### Idempotency and Side Effects

Idempotency means that executing the same operation multiple times has the same effect as executing it once.

A simple example is a conventional `GET` endpoint:

```http
GET /api/orders/123
```

We can call this endpoint several times without changing the order. The returned representation may change if the underlying data changes, but the request itself does not produce additional side effects.

With AI endpoints, idempotency becomes more complicated when the model can call tools.

Sending the same prompt multiple times may produce different outputs or slightly different wording. For read-only endpoints, this may be acceptable because no server state is changed.

But it becomes much more dangerous when the endpoint can perform actions. For example, the model may create an order, send an email or update data through a tool. If output validation later fails and the whole operation is retried, the model may call the same tool again and create a second order.

That is why actions triggered by AI endpoints should use protections such as idempotency keys, persisted operation results and unique constraints. Repeating the same action with the same operation ID should return the original result instead of executing the side effect again.

### Testing AI Endpoints

Testing conventional endpoints is relatively straightforward when the application state and dependencies are controlled.

We prepare the data, execute the endpoint and assert the expected result, such as the status code, expected response values, an updated application state or whether an external dependency was called.

With AI endpoints, exact-output assertions are often fragile. The same valid answer may be written in many different ways. A model update may also change the wording while keeping the same meaning. But asserting only the response status or checking that fields are not null is too weak.

Instead of always comparing the exact response, we can verify the required properties of the result. Depending on the use case, we may assert that values are within an allowed range, forbidden content is not present, tool calls respect the allowlist and the response follows the expected business rules.

For example, asserting the complete response with `Assert.Equal` would be fragile:

```csharp
var result = await endpoint.GeneratePlanAsync(request);

// Fragile assertion
Assert.Equal("Family Day in Brno", result.Title);
Assert.Equal(
    "Visit the science centre and have lunch nearby.",
    result.Description);
Assert.Equal(1_500, result.TotalCost);
```
The model may return a different title or description while still producing a completely valid plan.

Instead of checking the exact response, we can assert the properties that matter to the application using methods such as `InRange`, `Contains` and `DoesNotContain`:

```csharp
var result = await endpoint.GeneratePlanAsync(request);

Assert.NotNull(result);
Assert.NotEmpty(result.Activities);

//Assert
Assert.InRange(result.TotalCost,0,request.Budget);

Assert.All(
    result.Activities,
    activity =>
    {
        Assert.Contains(
            activity.Type,
            request.AllowedActivityTypes);

        Assert.InRange(
            activity.TravelTimeMinutes,
            0,
            request.MaximumTravelMinutes);

        Assert.False(
            string.IsNullOrWhiteSpace(activity.Name));
    });

Assert.DoesNotContain(result.Activities, activity => activity.IsClosed);
Assert.All(result.Activities,activity => Assert.NotEmpty(activity.SourceIds));
```

The title, description or order of activities may change, but the generated plan must still respect the budget, travel-time limits, allowed activity types and supplied source data.

A large part of the endpoint can still be tested deterministically. Schema validation, authorization, tool permissions, parsing, fallback logic and side-effect handling should still be tested like normal application code, but we should change how we assert the generated result.

### The Output Contract

When a conventional endpoint calls an external service, we usually rely on a JSON parser and a clearly defined contract. When the service returns invalid JSON or a response that does not match the expected schema, deserialization fails and the application handles the error.

AI output creates a more subtle problem.

A model may return perfectly valid JSON that matches the expected schema but is still logically wrong.

For example:

```json
{
  "approved": true,
  "reason": "The customer meets all required conditions.",
  "failedConditions": [
    {
      "name": "age",
      "value": 13,
      "description": "The customer is under the required age."
    }
  ]
}
```

This response is valid JSON and may also match the expected schema. But it contradicts itself. The customer is marked as approved even though one of the required conditions has failed.

So schema validation is necessary, but it is not enough.

AI output may require additional levels of validation, such as business-rule validation, logical consistency checks and safety validation.

The endpoint must be able to tell the difference between a response that can be parsed and a response that can actually be trusted.

### Observability and Cost

Traditional endpoint monitoring usually focuses on metrics such as request count, latency, errors, dependency calls and resource usage.

AI endpoints need these metrics too, but they also introduce model-specific ones:

* input and output token usage
* model and model version
* number of generation attempts
* tool calls
* validation failures
* repair success rate
* estimated cost
* output quality or evaluation score

Without these metrics, it is difficult to understand why an endpoint became slower, more expensive or less reliable.

A provider may change the model behind an alias. Prompts may grow over time, retrieved context may become larger and retry frequency may increase. The endpoint may still return `200 OK` while its cost increases and the quality of its output slowly gets worse.

## Summary

Traditional endpoints execute business logic that is defined and controlled by code.

AI endpoints are different. They orchestrate probabilistic generation, validate the result and decide whether it is reliable enough to return.

That changes how we should think about and design endpoints that use AI models.

An AI endpoint should not be just a thin proxy around a model call. The model generates the output, but the backend still decides whether it should become the final response.

These are some of the biggest differences I discovered while creating, debugging and maintaining AI endpoints. There are definitely more, but even these few examples show that adding an AI model behind an endpoint can significantly change its flow.
