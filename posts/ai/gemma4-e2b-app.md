---
layout: post
title: "How to Use Gemma 4 E2B the Smart Way: Family Trip Advisor"
date: 2026-05-22
categories: [ai, gemma, ollama, aspnet, angular, local-ai]
description: "Building a Family Trip Advisor app with Gemma 4 E2B, ASP.NET backend, and Angular frontend — how smart prompt design and backend orchestration unlock reliable results from small LLMs."
canonical_url: "https://dev.to/gramli/how-to-use-gemma-4-e2b-the-smart-way-family-trip-advisor-1870"
series: gemma4
series_part: 2
---

# How to Use Gemma 4 E2B the Smart Way: Family Trip Advisor

In a [previous article](https://dev.to/gramli/old-pc-vs-new-ai-can-a-2015-desktop-actually-run-gemma-4-2b-vs-4b-benchmark-2eg6#benchmarks), I benchmarked the Gemma 4 E2B and E4B models to see whether they are actually usable on my old 2015 PC, using specific prompt benchmarks for trip planning.

In this article, we will look at an application powered by the Gemma 4 E2B model. It is based on insights from the previous benchmark and reuses several of the tested prompts.

E2B is not the smartest model when it comes to reasoning, but with a well-designed architecture, it can still fit very well into practical applications and provide useful results. That’s why I chose it for this app. Combined with its speed, it can also run on older or less capable hardware while still returning results in a reasonable time.

First, we will look at the application itself. Then we will go through the architecture of the solution and most importantly: how I used the Gemma 4 E2B model in the smart way.

## Table of Contents

- [How to Use Gemma 4 E2B the Smart Way: Family Trip Advisor](#how-to-use-gemma-4-e2b-the-smart-way-family-trip-advisor)
  - [Table of Contents](#table-of-contents)
  - [What I Built](#what-i-built)
  - [Demo](#demo)
  - [Code](#code)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [How I Used Gemma 4](#how-i-used-gemma-4)
    - [Backend Orchestration](#backend-orchestration)
    - [Algorithm pseudocode](#algorithm-pseudocode)
    - [Validation and Resilience](#validation-and-resilience)
    - [Benchmark](#benchmark)
  - [MVP Scope and Next Steps](#mvp-scope-and-next-steps)
    - [Known Limitations](#known-limitations)
  - [Summary](#summary)

## What I Built

For those who often go on trips, especially with kids, you know the drill: How will the weather be? Should we go indoors or outdoors? Where are we going to eat? Will there be enough playgrounds? Is there any parking?

Planning a simple trip often turns into a small chain of decisions that takes more time than expected.

This can be exhausting. That’s why I built **Family Trip Advisor**, a full-stack application that helps plan trips in one place.

Instead of visiting multiple websites to check weather, activities, restaurants, or parking, you can simply write a prompt like:

> “We would like to go on a family trip this Saturday.”

Family Trip Advisor then responds with multiple suggestions for restaurants, activities and parking based on the weather conditions, selected date and your home location.

Sounds good? Let’s take a look at the demo.

## Demo

<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/d7dcb0b3757e4679b33fe96e620a4aba" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


[Gramli/familly-trip-advisor](https://github.com/Gramli/familly-trip-advisor)

To run it locally, check the [HOW-TO-RUN](https://github.com/Gramli/familly-trip-advisor/blob/master/HOW-TO-RUN.md) section in the GitHub repository, as there are prerequisites especially for API keys.

## Code

For the backend, I chose ASP.NET, and for the frontend, Angular. I am already familiar with both frameworks, so I chose them mainly for development speed, but also to show that there are more alternatives than just Python and React when building AI applications.

### Backend

I know that C# and ASP.NET are not currently the hottest language and framework choices on Dev.to or even globally, but I genuinely like the ecosystem, and for many REST APIs they are still an excellent choice. The Microsoft teams behind C# and ASP.NET continuously improve both performance and developer experience every year.

**Architecture**

For the solution architecture, I chose **Vertical Slice Architecture** because it fits very well for fast feature development.

In Vertical Slice Architecture, features are separated into “slices,” where every slice contains everything needed to return a result from the API. This usually includes the endpoint, business services, HTTP clients for third-party APIs and database access.

These slices help implement features more independently, which reduces the risk of introducing bugs or side effects into other parts of the solution. When you follow a good feature structure, understanding the solution is faster and code navigation becomes much easier.

The downside is that some duplication between slices can appear over time, but for smaller and fast-moving applications I consider this tradeoff acceptable.

Structure of the Solution with Vertical Slice Architecture:

```plaintext
familly-trip-advisor           .NET 10 Minimal API
├── Features/                   ← vertical slices live here
│   └── TripPlanner/            one slice = one feature
├── Infrastructure/             shared HTTP clients (cross-cutting)
├── Shared/                     shared utilities (cross-cutting)
└── Program.cs                  composition root
```

**Engineering notes**

When you look at the code more closely, you can spot many best practices applicable across frameworks and programming languages, not only in C# and ASP.NET:

For **control flow**, I chose the Result Pattern instead of using exceptions for expected failures. It returns a structured object containing both the operation result and possible error details. This keeps API responses more predictable and error handling explicit.

For unexpected exceptions, there is **exception middleware**. Having one central point for handling unexpected exceptions helps keep the code clean and predictable instead of catching general exceptions in many different places.

`DateTimeProvider` class - one central point for returning `DateTime`. This is useful for unit testing because time can be mocked easily. Since `DateTime` is often used across the solution, changing its behavior in one place is also much simpler.

**Interfaces and internal sealed classes** - hiding implementation behind interfaces simplifies mocking in unit tests and reduces coupling because implementation details can change without affecting dependent classes.

**Clean endpoints** - this is very important for me. I try to keep endpoints thin and readable, with business logic delegated to handlers or services. This improves maintainability and simplifies testing.

**Immutable DTO and request objects** - I prefer immutable DTO and request objects because they reduce accidental state changes when objects are passed through multiple layers.

Use a **maximum of 3 parameters in public methods** - this improves readability and unit testing. Methods with too many parameters are harder to mock and maintain. Encapsulating parameters into a properly named object makes the code easier to read and test.

I apply these best practices in every API I create, and they have proven very valuable over time. The time spent implementing them has paid off many times in the future.

The application is still relatively small, so I intentionally avoided introducing unnecessary abstractions or enterprise-level complexity. My goal was to keep the architecture simple, feature-oriented, and easy to evolve while still following solid engineering practices.

### Frontend 

The frontend is an **Angular 21 SPA application** designed mainly to show results and allow simple interaction with the user through a chat window. No fancy features yet.

**Architecture**

The frontend architecture follows the same approach as the backend. Features are organized into self-contained folders, and there is also a shared folder for reusable components that can be used across the application.

Structure of the solution similar to the backend:

```plaintext
familly-trip-advisor
└── src/app/                    Angular 21 SPA
    ├── features/               ← vertical slices live here
    │   └── trip-planner/       one slice = one feature
    └── shared/                 reusable UI primitives (cross-cutting)
```

One thing to admit: for styling, I intentionally did not use any CSS framework and instead let AI generate the design based on my preferences. When I use Bootstrap or PrimeNG, the result often feels too generic and lacks personality. UI design has always been my kryptonite 🙂

## How I Used Gemma 4

As the title suggests, Gemma 4 E2B is used in a smart way, but what does that actually mean?

It means I do not rely heavily on the model to orchestrate complex workflows through multiple MCP tools, large schemas or RAG pipelines. Since E2B and even E4B are relatively small models, you should not expect to send a prompt like:

> “Generate a family trip for Saturday” 

and always get a high-quality response.

Instead, a much more reliable solution is to use these models with smaller and more specialized prompts, while letting the backend handle most of the orchestration logic.

This reduces complexity on the model side and makes outputs more predictable and consistent.

### Backend Orchestration

So what does my backend actually do? Let’s say the user writes a prompt like: 

> “Generate a family trip for Saturday near Brno.”

The first thing the backend needs to do is extract the user intent. That means determining the actual date and location of the trip.

This is a perfect first task for E2B, so the backend uses the `BuildIntentionPrompt` method to generate an intention prompt like this:

```csharp
public string BuildIntentionPrompt(string userPrompt)
{
    var home = _options.Value;
    var today = _dateTimeProvider.GetDateOnly();

    return $$"""
        You are a trip intent extractor. Analyze the user message and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

        Today's date is {{today:yyyy-MM-dd}} ({{today:dddd}}).
        Home location: "{{home.HomeName ?? "Home"}}" at latitude {{home.HomeLatitude}}, longitude {{home.HomeLongitude}}.

        Rules:
        - "date": resolve relative expressions like "Saturday", "Friday", "next weekend" to the nearest upcoming date in yyyy-MM-dd format.
        - "destination": the place name the user mentioned, or null if none.
        - "latitude" and "longitude": GPS coordinates of the destination. If no destination is mentioned, use the home coordinates.
        - "isHomeLocation": true if home coordinates are used, false if a destination was detected.
        - "preferredActivity": if the user expresses a preference for indoor or outdoor activities (e.g. "prefer indoor", "something outside", "stay inside"), set this to "Indoor" or "Outdoor". Otherwise set it to null.

        Return exactly this JSON structure:
        {
          "date": "yyyy-MM-dd",
          "destination": "City name or null",
          "latitude": 0.0,
          "longitude": 0.0,
          "isHomeLocation": true,
          "preferredActivity": "Indoor or Outdoor or null"
        }

        User message: {{userPrompt}}
        """;
}
```

And the model should return structured JSON output, from which the backend extracts the trip date and trip location, like this:

```json
{
  "date": "2026-05-23",
  "destination": "Brno",
  "latitude": 49.1951,
  "longitude": 16.6068,
  "isHomeLocation": true,
  "preferredActivity": null
}
```

Next step in the backend is to fetch weather conditions based on the trip location. For weather data, I am using [WeatherBit](https://www.weatherbit.io/) through [RapidApi](https://rapidapi.com/).

In my previous article, I tested E2B and E4B models for extracting GPS coordinates. The results were close to the destination, but not fully precise. However, for weather data this is actually fine, since being off by 5–10 km does not make a significant difference.

Once the weather data is available, the backend determines whether the trip is better suited for indoor, outdoor, or mixed activities. This property is already included in the JSON above, but it is nullable. If the user does not specify it in the prompt, the activity type can be inferred from the weather conditions, which is another task well suited for the model.

Activity prompt:
```csharp
public string BuildActivityPrompt(ForecastWeatherDto forecastWeather)
{
    return $"""
        You are a family trip activity advisor. Based on the weather forecast below, decide whether the trip day is better suited for INDOOR activities, OUTDOOR activities, or BOTH.

        Rules:
        - Prefer OUTDOOR when: temperature avg >= 15°C AND cloud coverage <= 40% AND wind speed <= 10 m/s.
        - Prefer INDOOR when: temperature avg < 15°C OR cloud coverage > 60% OR wind speed > 10 m/s.
        - Prefer BOTH when: temperature avg >= 15°C AND cloud coverage between 40–60% AND wind speed <= 10 m/s.
        - Return ONLY one word: either "Indoor", "Outdoor", or "Both". No explanation, no punctuation.

        Forecast:
          - Date: {forecastWeather.ValidDate:yyyy-MM-dd}, Temp: {forecastWeather.MinTemp}°C–{forecastWeather.MaxTemp}°C (avg {forecastWeather.Temp}°C), Clouds: {forecastWeather.CloudsPercentage}%, Wind: {forecastWeather.WindSpeed} m/s
        """;
}
```

This prompt returns a single word, which I then map to an `Activity` enum:
```plaintext
Indoor
```

This step could also be implemented directly in the backend using simple business rules, but I intentionally kept it as an AI task to test how consistently E2B handles smaller classification prompts.

At this point, the backend has weather conditions, location data and the activity type, but one thing is still missing: places to visit, places to eat and parking options for the car.

For place discovery, the backend uses the [Geoapify places API](https://www.geoapify.com/places-api/). The API has a generous daily request limit, which allows the application to query multiple categories such as activities, restaurants and parking. Since the activity type is already known at this stage, the backend can pre-filter which categories and places should be requested.

At this point, the backend has all required data to generate the final trip plan. I could let the backend orchestrate the final step by pre-filtering the resulting data, but I want to see if E2B is actually capable of handling a larger prompt and returning usable results. So the final prompt is built using `BuildTripPlanPrompt`:

```csharp
public string BuildTripPlanPrompt(BuildTripPlanRequest request)
{
    var sb = new StringBuilder();

    // ── System role ──────────────────────────────────────────────────────────
    sb.AppendLine("You are a family trip planner. Your job is to select the best places from the provided lists and write a short plan summary.");
    sb.AppendLine();

    // ── Trip context ─────────────────────────────────────────────────────────
    sb.AppendLine("## Trip Details");
    sb.AppendLine($"- Destination: {request.Intention.Destination ?? "Home area"}");
    sb.AppendLine($"- Date: {request.Intention.Date:dddd, MMMM d yyyy}");
    sb.AppendLine($"- Activity preference: {request.ActivityType}");
    sb.AppendLine($"- Weather: avg {request.Weather.Temp:F1}°C, min {request.Weather.MinTemp:F1}°C, max {request.Weather.MaxTemp:F1}°C, clouds {request.Weather.CloudsPercentage:F0}%, wind {request.Weather.WindSpeed:F1} m/s");
    sb.AppendLine();

    // ── Candidate places ─────────────────────────────────────────────────────
    AppendPlaceList(sb, "Activities", request.Places.Activities
        .Select((p, i) => $"[A{i + 1}] {p.Name} | {p.Category} | {p.ActivityType} | {p.DistanceMeters:F0} m | {p.Address}"));

    AppendPlaceList(sb, "Restaurants", request.Places.Restaurants
        .Select((p, i) => $"[R{i + 1}] {p.Name} | {string.Join(", ", p.Categories.Take(2))} | {p.DistanceMeters:F0} m | {p.Address}"));

    AppendPlaceList(sb, "Parking", request.Places.Parking
        .Select((p, i) => $"[P{i + 1}] {p.Name ?? "Unnamed parking"} | {p.ParkingType} | {p.DistanceMeters:F0} m | {p.Address}"));

    // ── Output rules ─────────────────────────────────────────────────────────
    sb.AppendLine("## Rules");
    sb.AppendLine("- Pick exactly 2 or 3 activities, 2 or 3 restaurants, and 2 or 3 parking spots.");
    sb.AppendLine("- Prefer places CLOSER to the destination (smaller distance is better).");
    sb.AppendLine($"- For activities, prefer {request.ActivityType} options that match the weather.");
    sb.AppendLine("- For restaurants, prefer variety in cuisine when possible.");
    sb.AppendLine("- For parking, prefer covered or multi-storey on cloudy/rainy days.");
    sb.AppendLine("- Write a 2-3 sentence plain-English summary of the day plan.");
    sb.AppendLine();

    // ── Required output format ────────────────────────────────────────────────
    sb.AppendLine("## Output format");
    sb.AppendLine("Return ONLY a JSON object. No explanation before or after it.");
    sb.AppendLine("Use the exact IDs from the lists above (e.g. A1, R2, P1).");
    sb.AppendLine();
    sb.AppendLine("```json");
    sb.AppendLine("{");
    sb.AppendLine("  \"activities\": [\"A1\", \"A3\"],");
    sb.AppendLine("  \"restaurants\": [\"R2\", \"R4\"],");
    sb.AppendLine("  \"parking\": [\"P1\", \"P2\"],");
    sb.AppendLine("  \"summary\": \"A short description of the trip plan.\"");
    sb.AppendLine("}");
    sb.AppendLine("```");

    return sb.ToString();
}
```

And that’s it. The model returns a JSON response, which I deserialize and send to the frontend.

For places, there is a limit: I pass 10 places for each category, so the model selects from a pool of around 30 places in total.

### Algorithm pseudocode

Above section was about prompts, but to better understand how the backend actually orchestrates the planning endpoint, there is a pseudocode example. This shows a smart way of using smaller LLM models:

```plaintext
FUNCTION HandleAsync(request, cancellationToken):

  // 1. Validate the incoming request
  validationResult = Validate(request)
  IF validation failed:
    RETURN 400 Bad Request with error messages

  // 2. Extract the user's travel intention from the prompt (AI call)
  intentionResult = ExtractIntention(request.Prompt)
  IF extraction failed:
    RETURN 500 Internal Server Error with error messages

  // intention now contains: location (lat/lon), travel date, preferred activity (optional)

  // 3. Get weather forecast for that location and date
  weatherResult = GetWeatherForecast(intention.Latitude, intention.Longitude, intention.Date)
  IF weather fetch failed:
    RETURN 500 Internal Server Error with error messages

  // 4. Determine the activity type (outdoor vs indoor)
  IF user specified a preferred activity:
    activity = intention.PreferredActivity
  ELSE:
    // Let AI decide based on weather conditions
    activitiesResult = GetActivityByWeather(weatherResult)
    IF activity suggestion failed:
      RETURN 500 Internal Server Error with error messages
    activity = activitiesResult.Value

  // 5. Find relevant places near the location for that activity
  placesRequest = { Latitude, Longitude, Activity, RadiusInMeters }
  placesResult = GetTripPlaces(placesRequest)
  IF places fetch failed:
    RETURN 500 Internal Server Error with error messages

  // 6. Generate the final trip plan (AI call)
  planResult = GenerateTripPlan({
    Intention = intentionResult,
    Weather   = weatherResult,
    Activity  = activity,
    Places    = placesResult,
    SessionId = request.SessionId
  })
  IF plan generation failed:
    RETURN 500 Internal Server Error with error messages

  // 7. Return the generated trip plan
  RETURN 200 OK with planResult
```

The prompt for the last step could be more orchestrated, for example, the backend could provide fewer places to choose from, but I think E2B handles it fairly well.

### Validation and Resilience

One last thing I want to highlight is user prompt validation and resilience when calling the model itself. Both are extremely important in real-world AI applications.

Validating user prompts before sending them to the model improves reasoning quality and also helps prevent prompt injection attempts or unsupported input patterns. Below is a simplified example of the validation logic used for incoming prompts:

```csharp
public Result Validate(CreateTripPlanCommand query)
{
    if (string.IsNullOrWhiteSpace(query.Prompt))
    {
        return Result.Fail("Prompt must not be empty.");
    }

    var trimmed = query.Prompt.Trim();

    if (trimmed.Length < MinLength)
    {
        return Result.Fail($"Prompt must be at least {MinLength} characters long.");
    }

    if (trimmed.Length > MaxLength)
    {
        return Result.Fail($"Prompt must not exceed {MaxLength} characters.");
    }

    if (!AllowedCharactersRegex.IsMatch(trimmed))
    {
        return Result.Fail("Prompt contains invalid characters.");
    }

    foreach (var pattern in PromptInjectionPatterns)
    {
        if (trimmed.Contains(pattern, StringComparison.OrdinalIgnoreCase))
        {
            return Result.Fail("Prompt contains content that cannot be processed.");
        }
    }

    foreach (var pattern in OffTopicPatterns)
    {
        if (trimmed.Contains(pattern, StringComparison.OrdinalIgnoreCase))
        {
            return Result.Fail("Prompt contains content that is not related to trip planning.");
        }
    }

    return Result.Ok();
}
```

Once the prompt passes validation, the backend can continue with the model call. However, another important question is: what happens if the model returns an invalid response or the request fails unexpectedly?

For this, I use a resilience pipeline with retries. In C#, this can be implemented using the [Polly library](https://github.com/App-vNext/Polly).

```csharp
private static readonly ResiliencePipeline RetryPipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        Delay = TimeSpan.FromSeconds(2),
        BackoffType = DelayBackoffType.Exponential,
        UseJitter = true,
        ShouldHandle = new PredicateBuilder()
              .Handle<Exception>(ex => ex is not OperationCanceledException)
    })
    .Build();

public async Task<string> GetResponseAsync(string prompt, CancellationToken cancellationToken) =>
    await RetryPipeline.ExecuteAsync(async ct =>
    {
        var builder = new StringBuilder();
        await foreach (ChatResponseUpdate item in
            _chatClient.GetStreamingResponseAsync(
                [new(ChatRole.User, prompt)],
                ModelOptions,
                ct))
        {
            builder.Append(item.Text);
        }
        return builder.ToString();
    }, cancellationToken);

```

This pipeline catches exceptions and retries the request up to 3 times using exponential backoff with delay between attempts. Resilience pipelines are useful not only for model calls, but for any external API or infrastructure dependency, since temporary failures are common in distributed systems.

For LLM integrations specifically, retries can also improve output quality. Besides handling exceptions, the backend can validate the generated output and retry the request if the response is deformed, incomplete, or clearly hallucinated.

Both of these defensive backend patterns are used in the solution. The actual resilience implementation is more advanced, but the example above was intentionally simplified to focus on the core idea.

### Benchmark

Architecture and Orchestration are important, but what really matters is how these decisions perform in practice.

Following the [previous article](https://dev.to/gramli/old-pc-vs-new-ai-can-a-2015-desktop-actually-run-gemma-4-2b-vs-4b-benchmark-2eg6#benchmarks) I couldn’t leave out some reasoning and speed benchmarks. This time, however, the results come from real application usage during testing.

Generation tokens per second were measured using real prompts generated by the API and user requests. The values in the table represent the average of 5 runs for each prompt. Model warm-up was performed using 4 different prompts before benchmarking.

All tests were run using Ollama version `0.23.2` with default model settings on an Intel i5-6400, 24 GB RAM, and an NVIDIA GeForce GTX 950 with 2 GB VRAM.

| | Intention prompt | Activity prompt | Plan prompt |
|---|---|---|---|
| Generation Tokens/s (avg) | 9.64 | 12.65 | 8.65 |

Tested prompts are included below.

**Intention prompt**

<details><summary>Click to expand Intention prompt</summary>

```plaintext
You are a trip intent extractor. Analyze the user message and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Today's date is 2026-05-19 (Tuesday).
Home location: "Brno" at latitude 49.1951, longitude 16.6068.

Rules:
- "date": resolve relative expressions like "Saturday", "Friday", "next weekend" to the nearest upcoming date in yyyy-MM-dd format.
- "destination": the place name the user mentioned, or null if none.
- "latitude" and "longitude": GPS coordinates of the destination. If no destination is mentioned, use the home coordinates.
- "isHomeLocation": true if home coordinates are used, false if a destination was detected.
- "preferredActivity": if the user expresses a preference for indoor or outdoor activities (e.g. "prefer indoor", "something outside", "stay inside"), set this to "Indoor" or "Outdoor". Otherwise set it to null.

Return exactly this JSON structure:
{
  "date": "yyyy-MM-dd",
  "destination": "City name or null",
  "latitude": 0.0,
  "longitude": 0.0,
  "isHomeLocation": true,
  "preferredActivity": "Indoor or Outdoor or null"
}

User message: Plan a family day in Prague next Saturday with kids who love museums
```

</details>

**Activity prompt**

<details><summary>Click to expand Activity prompt</summary>

```plaintext
You are a family trip activity advisor. Based on the weather forecast below, decide whether the trip day is better suited for INDOOR activities, OUTDOOR activities, or BOTH.

Rules:
- Prefer OUTDOOR when: temperature avg >= 15°C AND cloud coverage <= 40% AND wind speed <= 10 m/s.
- Prefer INDOOR when: temperature avg < 15°C OR cloud coverage > 60% OR wind speed > 10 m/s.
- Prefer BOTH when: temperature avg >= 15°C AND cloud coverage between 40–60% AND wind speed <= 10 m/s.
- Return ONLY one word: either "Indoor", "Outdoor", or "Both". No explanation, no punctuation.

Forecast:
  - Date: 2026-05-22, Temp: 12.9°C–16.5°C (avg 14.4°C), Clouds: 70%, Wind: 4.4 m/s
```

</details>

**Plan prompt**

<details><summary>Click to expand Plan prompt</summary>

```plaintext
You are a family trip planner. Your job is to select the best places from the provided lists and write a short plan summary.

## Trip Details
- Destination: Prague
- Date: Saturday, May 23 2026
- Activity preference: Indoor
- Weather: avg 18.8°C, min 11.9°C, max 25.0°C, clouds 24%, wind 2.5 m/s

## Available Activities
[A1] Národní galerie v Praze - Palác Kinských | entertainment.museum | Indoor | 120 m | National Gallery in Prague - Kinský Palace, Old Town Square, 110 00 Prague, Czechia
[A2] Central Gallery | entertainment.museum | Indoor | 140 m | Central Gallery, Old Town Square 15, 110 00 Prague, Czechia
[A3] Sklářské muzeum Moser | entertainment.museum | Indoor | 142 m | Sklářské muzeum Moser, Old Town Square 15, 110 00 Prague, Czechia
[A4] Galerie Zlatá lilie | entertainment.museum | Indoor | 142 m | Galerie Zlatá lilie, Malé náměstí, 116 65 Prague, Czechia
[A5] Sex Machines Museum | entertainment.museum | Indoor | 145 m | Sex Machines Museum, Melantrichova 18, 110 00 Prague, Czechia
[A6] Madame Tussauds | entertainment.museum | Indoor | 182 m | Madame Tussauds, Celetná 6, 110 00 Prague, Czechia
[A7] Choco-Story Muzeum čokolády | entertainment.museum | Indoor | 213 m | Choco-Story Chocolat Museum, Celetná 557/10, 110 00 Prague, Czechia
[A8] Muzeum hlavního města Prahy - Dům U Zlatého prstenu | entertainment.museum | Indoor | 215 m | City of Prague Museum - House at the Golden Ring, Týnská, 110 00 Prague, Czechia
[A9] Památník Jaroslava Ježka (Modrý pokoj) | entertainment.museum | Indoor | 221 m | Jaroslav Ježek Memorial, Kaprova, 115 72 Prague, Czechia
[A10] Czech Beer Museum | entertainment.museum | Indoor | 229 m | Czech Beer Museum, Husova 156/21, 110 00 Prague, Czechia

## Available Restaurants
[R1] Ristorante San Remo | catering, catering.restaurant | 25 m | Ristorante San Remo, Mikulášská 6, 110 00 Prague, Czechia
[R2] Trdelník | catering, catering.fast_food | 28 m | Trdelník, Mikulášská 4, 110 00 Prague, Czechia
[R3] San Nicola | catering, catering.fast_food | 32 m | San Nicola, Mikulášská, 115 72 Prague, Czechia
[R4] Lippert | catering, catering.restaurant | 36 m | Lippert, Mikulášská 2, 110 00 Prague, Czechia
[R5] Trdelník | catering, catering.cafe | 51 m | Trdelník, Franz Kafka Square, 115 72 Prague, Czechia
[R6] Meet Burger | catering, catering.restaurant | 54 m | Meet Burger, Franz Kafka Square, 115 72 Prague, Czechia
[R7] Ambiente Brasileiro | catering, catering.restaurant | 56 m | Ambiente Brasileiro, U Radnice 8, 110 00 Prague, Czechia
[R8] Pauseteria | catering, catering.restaurant | 57 m | Pauseteria, U Radnice, 115 72 Prague, Czechia
[R9] Capriccio | catering, catering.restaurant | 58 m | Capriccio, Franz Kafka Square 7, 110 00 Prague, Czechia
[R10] Kotleta | catering, catering.restaurant | 68 m | Kotleta, U Radnice 2, 110 00 Prague, Czechia

## Available Parking
[P1] Unnamed parking | access | 66 m | Old Town Square, 110 00 Prague, Czechia
[P2] P1-0518 | access_limited | 75 m | P1-0518, U Radnice, 115 72 Prague, Czechia
[P3] P1-0281 | access_limited | 91 m | P1-0281, Kaprova, 115 72 Prague, Czechia
[P4] P1-0277 | access_limited | 94 m | P1-0277, Pařížská, 115 72 Prague, Czechia
[P5] P1-0276 | access_limited | 102 m | P1-0276, Old Town Square, 110 00 Prague, Czechia
[P6] P1-0277 | access_limited | 106 m | P1-0277, Pařížská, 115 72 Prague, Czechia
[P7] P1-0279 | access_limited | 116 m | P1-0279, Maiselova, 115 72 Prague, Czechia
[P8] P1-0319 | access | 124 m | P1-0319, Platnéřská, 115 72 Prague, Czechia
[P9] P1-0323 | access_limited | 127 m | P1-0323, Linhartská, 115 72 Prague, Czechia
[P10] P1-0319 | access | 129 m | P1-0319, Platnéřská, 115 72 Prague, Czechia

## Rules
- Pick exactly 2 or 3 activities, 2 or 3 restaurants, and 2 or 3 parking spots.
- Prefer places CLOSER to the destination (smaller distance is better).
- For activities, prefer Indoor options that match the weather.
- For restaurants, prefer variety in cuisine when possible.
- For parking, prefer covered or multi-storey on cloudy/rainy days.
- Write a 2-3 sentence plain-English summary of the day plan.

## Output format
Return ONLY a JSON object. No explanation before or after it.
Use the exact IDs from the lists above (e.g. A1, R2, P1).

json
{
  "activities": ["A1", "A3"],
  "restaurants": ["R2", "R4"],
  "parking": ["P1", "P2"],
  "summary": "A short description of the trip plan."
}

```

</details>

The results from the intention and activity prompts were consistently correct during testing. Looking at the performance numbers, the intention prompt achieved an average generation speed of 9.64 tokens/s, while the activity prompt reached 12.65 tokens/s. This difference is expected because the activity prompt is simpler and returns only a single-word response.

The planning prompt was the slowest at 8.65 tokens/s, but that was also expected since it is the largest prompt and requires more reasoning to select and summarize relevant places. Despite that, the generated outputs were consistently good and usable in practice.

I also measured the average API response time for the prompts like:

> "Plan a family day in London next Saturday with kids who love museums"

 The average response time was **30.66 seconds**. 

This number can be slightly misleading because it includes the full orchestration pipeline, not just the model reasoning time. The request performs 3 dependent model calls and 4 external API calls, but still I think it is interesting to see how quickly the complete response is generated under real application conditions.


## MVP Scope and Next Steps

As this is still an MVP (Minimum Viable Product), the application is a work in progress, and there is plenty left to improve.

In the next release, I want to focus on long-term memory, where users can tell the application whether they liked a trip and save favorite places. Then, when planning future trips, the model could also recommend places the family already enjoys.

Another area I want to improve is short-term context handling, allowing users to refine the trip plan during the conversation or set preferences such as favorite cuisine.

For long-term memory, I would like to experiment with an MCP server, but I will see whether E2B can handle it well or whether I will end up using backend orchestration again.

I would also like to improve performance and reduce response times.

Most future features will probably come from real usage, since I am already using the application myself and plan to continue using it.

### Known Limitations

Gemma 4 E2B is not deterministic, so outputs may occasionally be invalid or incomplete.

Location resolution and place selection are based on approximate GPS and point of interest data.

Place data quality depends on Geoapify coverage, which may be incomplete in rural or less populated regions.

The current average response time of ~30 seconds is acceptable for an MVP where correctness matters more than speed, but it would need significant reduction before this could feel like a polished product. 

## Summary

In this article, I showed my MVP of the Family Trip Advisor app powered by the Gemma 4 E2B model, implemented using best practices for API design and backend orchestration.

Family Trip Advisor tries to solve a common problem many people face when planning trips by generating useful suggestions from a single, simple prompt.

The core idea behind the app is that you do not need the most advanced reasoning models to build useful AI applications. With a well-designed architecture and proper task decomposition, you can achieve strong results without heavy hardware requirements or expensive models.

This approach relies on keeping the model focused on small, well-defined tasks while the backend handles orchestration and structure.

The main tradeoff of using small models is that output quality depends heavily on how well the backend structures the input data. Because of that, I recommend validating outputs.

I hope this article and the app itself demonstrate that the E2B model is not just “good enough,” but actually excellent for real-world usage when used correctly.

In the next version, I will experiment with MCP for long-term memory and continue improving performance and user experience.