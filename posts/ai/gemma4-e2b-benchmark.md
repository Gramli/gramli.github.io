---
layout: post
date: 2026-05-14
categories: [ai, gemma, ollama, benchmark, local-ai]
description: "Benchmarking Gemma 4 E2B and E4B models running locally with Ollama on a 2015 desktop — speed, reasoning, code generation, structured output, and instruction following."
canonical_url: "https://dev.to/gramli/old-pc-vs-new-ai-can-a-2015-desktop-actually-run-gemma-4-2b-vs-4b-benchmark-2eg6"
---

# Old PC vs New AI: Can a 2015 Desktop Actually Run Gemma 4? (2B vs 4B Benchmark)

Running modern AI models locally on older hardware sounds almost impossible. But with smaller models like Gemma 4 and tools like Ollama, local AI is starting to become surprisingly accessible even on aging machines.

I still have my old desktop computer, bought back in 2015. It is still fast enough for development and even for playing some of my favorite games. At this point, it feels like a member of the family (it’s actually older than my oldest kid).

The only thing it could never really handle was running AI models locally. But now, models seem to be getting much more friendly toward older CPUs, GPUs, and limited RAM, so I finally decided to give it a try with Gemma 4.

I want to create a whole series around Gemma 4. First, I’ll explore how to run Gemma 4 locally on older hardware and benchmark it to see whether it is actually usable and which model variants work best for my specific setup. Then, I want to build something useful where Gemma 4 becomes the core of the application.

So, let’s dive in.

## Table of Contents

- [Old PC vs New AI: Can a 2015 Desktop Actually Run Gemma 4? (2B vs 4B Benchmark)](#old-pc-vs-new-ai-can-a-2015-desktop-actually-run-gemma-4-2b-vs-4b-benchmark)
  - [Table of Contents](#table-of-contents)
  - [Choosing right Gemma 4 Variation](#choosing-right-gemma-4-variation)
    - [Basic Gemma 4 Knowledge](#basic-gemma-4-knowledge)
  - [Installing and Running Gemma 4](#installing-and-running-gemma-4)
      - [Prompts](#prompts)
      - [2B Outputs](#2b-outputs)
      - [4B Outputs](#4b-outputs)
      - [Results](#results)
    - [Reasoning Benchmark](#reasoning-benchmark)
      - [2B Outputs](#2b-outputs-1)
      - [4B Outputs](#4b-outputs-1)
      - [Results](#results-1)
    - [Knowledge Benchmark](#knowledge-benchmark)
      - [2B Outputs](#2b-outputs-2)
      - [4B Outputs](#4b-outputs-2)
      - [Results](#results-2)
    - [Code Generation](#code-generation)
      - [2B Outputs](#2b-outputs-3)
      - [4B Outputs](#4b-outputs-3)
      - [Results](#results-3)
    - [Structured Output (JSON)](#structured-output-json)
      - [2B Outputs](#2b-outputs-4)
      - [4B Outputs](#4b-outputs-4)
      - [Results](#results-4)
    - [Instruction Following](#instruction-following)
      - [2B Outputs](#2b-outputs-5)
      - [4B Outputs](#4b-outputs-5)
      - [Results](#results-5)
    - [System Metrics](#system-metrics)
  - [Summary](#summary)

## Choosing right Gemma 4 Variation

Before choosing the right variant, let’s take a look at my old setup:

| Component    | Value                                        |
| ------------ | -------------------------------------------- |
| CPU          | Intel(R) Core(TM) i5-6400 CPU @ 2.70GHz Core |
| RAM          | 24 GB                                        |
| GPU          | NVIDIA GeForce GTX 950 2GB VRAM              |

What does this tell us?

We should stay realistic and focus on the smaller models. Based on some recommendations online:
- [Unsloth Gemma 4](https://unsloth.ai/docs/models/gemma-4)
- [WaveSpeed Gemma 4](https://wavespeed.ai/blog/posts/what-is-google-gemma-4/#:~:text=instruction%2Dtuned%20variants%3A-,Model,Text%2C%20image%2C%20video)
- [Ollama model page](https://ollama.com/library/gemma4)

**Gemma 4 Memory Requirements**

| Model Variant      | Minimum RAM/VRAM  | Ideal RAM/VRAM |
|--------------------|-------------------|----------------|
| Gemma 4 E2B        |  4 GB             | 8 GB           |
| Gemma 4 E4B        |  6 GB             | 12 GB          |
| Gemma 4 26B (MoE)  |  18 GB            | 24 GB          |
| Gemma 4 31B (Dense)|  22 GB            | 32 GB          |

With 24 GB of RAM and i5-6400 CPU, I should be able to run E2B and E4B quite comfortably. The 26B model is likely beyond what this system can realistically handle, and the 31B variant is out of reach for this setup.

### Basic Gemma 4 Knowledge

For anyone wondering what terms like E2B or E4B mean:

- The “B” stands for billions of parameters, which describes the size of the model.
- The “E” stands for effective parameters.

These models are designed for edge and local deployment, meaning they are optimized to run efficiently on consumer hardware.

In simple terms, parameters are the internal values the model learns during training. They represent patterns in data that the model uses to generate responses.

You can think of parameters as the model’s capacity to learn and generalize patterns, rather than stored factual knowledge.

**Examples:**
- 2B → ~2 billion parameters
- 4B → ~4 billion parameters
- 26B → ~26 billion parameters

## Installing and Running Gemma 4

First, we need to download [Ollama](https://ollama.com/download/windows), which will act as our local "AI server". Ollama handles model downloading, hardware optimization, and model management, so the only thing we really need to focus on is prompting.

It is probably the easiest way to bridge the gap between "having a computer" and "having a private local ChatGPT".

After installing Ollama, we can run the following commands to download and start both Gemma 4 models:

```PowerShell
ollama run gemma4:e2b
ollama run gemma4:e4b
```

Finished installation of E2B:
```console
ollama run gemma4:e2b
pulling manifest
pulling 4e30e2665218: 100% ▕██████████████████████████████████████████████████████████▏ 7.2 GB
pulling 7339fa418c9a: 100% ▕██████████████████████████████████████████████████████████▏  11 KB
pulling 56380ca2ab89: 100% ▕██████████████████████████████████████████████████████████▏   42 B
pulling c6bc3775a3fa: 100% ▕██████████████████████████████████████████████████████████▏  473 B
verifying sha256 digest
writing manifest
success
```

Finished installation of E4B:
```console
PS C:\Users\dbalc> ollama run gemma4:e4b
pulling manifest
pulling 4c27e0f5b5ad: 100% ▕██████████████████████████████████████████████████████████▏ 9.6 GB
pulling 7339fa418c9a: 100% ▕██████████████████████████████████████████████████████████▏  11 KB
pulling 56380ca2ab89: 100% ▕██████████████████████████████████████████████████████████▏   42 B
pulling f0988ff50a24: 100% ▕██████████████████████████████████████████████████████████▏  473 B
verifying sha256 digest
writing manifest
success
```

In total, you will need around 6.5 GB for Ollama itself, plus an additional 7.2 GB or 9.6 GB depending on which model you install.

Once the model is downloaded, you can immediately start chatting directly in the terminal:

```PowerShell
>>> Send a message (/? for help)
```

The next time you run:
```PowerShell
ollama run gemma4:e2b
```
or
```PowerShell
ollama run gemma4:e4b
```

Ollama will simply load the already downloaded model, and you can start chatting immediately.

> **Note:** Ollama also allows you to use local models directly inside VS Code Copilot Chat. Simply run:
> ```PowerShell
ollama launch vscode
```plaintext
> Then select your local model in VS Code.
> More details: [Ollama VS Code Integration](https://docs.ollama.com/integrations/vscode)

## Benchmarks

I want to benchmark these models to see how much CPU, RAM, and GPU resources they actually consume on my old machine across different prompt categories. I also want to compare response quality and generation speed between both models.

To avoid mixing unrelated metrics, I split evaluation into focused benchmark categories.

Each benchmark table is designed to measure one specific aspect of the model’s behavior, instead of trying to evaluate everything at once.

This is important because different aspects of an AI model behave very differently:

- **Performance (tokens per second, TPS)** tells us how fast the model generates text.
- **Reasoning quality** tells us how well the model solves problems and follows logic.
- **Structured output reliability** tells us how consistently the model can follow strict formats like JSON.

Combining these metrics into a single benchmark would produce misleading results. For example, a JSON task might look "slow" just because the output is longer, not because the model is actually slower.

That’s why each table uses carefully designed prompts that match the metric being measured:

- **Speed tests** use similar, comparable prompts to fairly measure token generation throughput (tokens per second).
- **Reasoning tests** use multi-step logic and problem-solving tasks to evaluate correctness and reasoning quality, not speed.
- **Structured output tests** enforce strict JSON formatting rules to measure schema adherence and output reliability.
- **Code generation tests** evaluate correctness, compilability, and code structure in practical C# and .NET scenarios.
- **Knowledge tests** assess factual recall and basic understanding of geographic or general domain knowledge.
- **Instruction following tests** measure how well models comply with explicit constraints such as word limits and language restrictions.

Each benchmark section includes full model outputs, allowing readers to independently review and verify the results.

System metrics such as CPU and RAM usage were measured during sustained model sessions, while response-specific metrics were recorded individually for each prompt execution.

Before each benchmark, I performed a warm-up phase by sending 4 prompts to the model. This ensures the model is already loaded into memory, allowing Ollama to utilize CPU, RAM, and GPU resources more consistently during testing.

All benchmarks were run using Ollama version `0.23.2` with default model settings in PowerShell terminal.

### Speed Benchmark

Ollama exposes detailed runtime metrics for each inference request by setting verbose level: 

```Plaintext
/set verbose
``` 

After each prompt, Ollama outputs detailed runtime metrics such as:

```Plaintext
total duration:       1m56.4241285s #This represents full request lifecycle latency.
load duration:        1m6.4841917s #This primarily represents model initialization overhead and is most visible during cold starts or after the model has been unloaded from memory.

# This measures input ingestion speed (how quickly the model encodes and understands the prompt before generating output).
prompt eval count:    19 token(s)
prompt eval duration: 912.2499ms
prompt eval rate:     20.83 tokens/s

# This is the model’s output generation speed, measured in tokens per second. It is the primary indicator of inference performance.
eval count:           357 token(s)
eval duration:        48.4355362s
eval rate:            7.37 tokens/s
```

Load duration represents model initialization time, while total duration includes the full request lifecycle.

Prompt evaluation measures input processing speed, and evaluation rate represents token generation throughput.

In this benchmark, **evaluation rate** is used as the primary performance indicator, while other metrics provide context for system overhead.

For clarity, the benchmark tables rename these metrics slightly:
```plaintext
Prompt Tokens/s = prompt eval rate
Generation Tokens/s = eval rate
```

To improve result consistency, I will run each prompt four times for every model and calculate the average values.

#### Prompts

| Task                 | Prompt                                        |
| -------------------- | --------------------------------------------- |
| REST API explanation | Explain what a REST API is in one paragraph.  |
| Docker summary       | Summarize Docker in exactly 3 sentences.      |


#### 2B Outputs

**REST API explanation**

<details><summary>Click to expand REST API explanation</summary>

```PowerShell
A REST API (Representational State Transfer) is an architectural style that defines a set of rules for how
software components should communicate over the internet. It functions as a standardized interface, allowing
different applications to interact with each other by focusing on **resources** (like users or products)
identified by unique URLs. Communication between the client and the server is typically done using standard HTTP
methods—such as GET (to retrieve data), POST (to submit new data), PUT (to update data), and DELETE (to remove
data)—making the communication efficient, scalable, and stateless.
```
</details>

**Docker summary** 

<details><summary>Click to expand Docker summary</summary>

```PowerShell
Docker is a platform that uses containerization technology to package applications and all their dependencies into
standardized, isolated units called containers. These containers ensure that an application runs consistently and
predictably across any computing environment, solving the common problem of environmental incompatibility. This
portability makes deploying and scaling applications significantly easier and more efficient across development
and production systems.
```
</details>

#### 4B Outputs

**REST API explanation**

<details><summary>Click to expand REST API explanation</summary>

```PowerShell
A REST API (Representational State Transfer Application Programming Interface) is essentially a set of rules and
guidelines that dictates how two separate pieces of software communicate and exchange data over the internet,
acting as a universal translator for web services. Instead of needing complex, proprietary methods, REST organizes
all information into easily identifiable "resources" (like a user or a product) that are addressed via specific
URLs. To interact with these resources, the system uses standard HTTP verbs: `GET` to read data, `POST` to create
it, `PUT` to update it, and `DELETE` to remove it. Because it relies on these simple, standardized methods—and
formats data like JSON or XML—REST makes the web highly modular and scalable, ensuring that any client
application, regardless of its underlying language, can reliably and efficiently access and manipulate data from
any server.
```

</details>

**Docker summary**

<details><summary>Click to expand Docker summary</summary>

```PowerShell
Docker is a platform that enables developers to containerize applications, bundling the code, runtime, libraries,
and all dependencies into a single, portable unit called a container. These containers package an application into
a consistent, isolated environment, which effectively solves the "it works on my machine" problem by ensuring the
application runs identically regardless of the underlying operating system. This portability makes deployment
immensely reliable and efficient, allowing developers to quickly build, test, and scale applications across any
machine or cloud environment.
```

</details>

#### Results

| Prompt               | Model | Prompt Tokens/s (avg) | Generation Tokens/s (avg) | Total Time (avg) |
| -------------------- | ----- | --------- | ---------- | ---------- |
| REST API explanation | 2B    | 473.86    | 6.91       | 64.00s     |
| REST API explanation | 4B    | 237.49    | 5.03       | 116.55s    |
| Docker summary       | 2B    | 877.51    | 6.46       | 56.08s     |
| Docker summary       | 4B    | 479.66    | 5.04       | 65.00s     |


The 2B model completed both tasks noticeably faster, completing the Docker summary in 56 seconds and the REST API explanation in 64 seconds. The 4B model was slower, taking around 65 seconds for the Docker summary and nearly 2 minutes (116 seconds) for the REST API explanation.

Both the REST API explanation and Docker summary responses from the 2B model were technically correct. However, for non-technical users, the answers might feel too short and somewhat difficult to fully understand without additional context.

The 4B model consistently generated responses more slowly, although the performance gap varied significantly between prompts. For the REST API explanation it took nearly twice as long (116s vs 64s), while for the Docker summary the difference was much smaller (65s vs 56s). Output token generation also lagged behind, averaging around 5 TPS compared to the 2B's ~6.7 TPS. Despite the lower throughput, the 4B model produced more detailed and easier-to-follow explanations for both topics.

### Reasoning Benchmark

Reasoning performance was evaluated using simple logic and multi-step problem-solving tasks. In this section, correctness and reasoning quality are prioritized over execution speed.

| Task                  | Prompt                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Logic puzzle          | A car travels from City A to City B at 60 km/h and returns along the same route at 90 km/h. The total travel time for both trips is 5 hours. What is the total distance traveled? Show your reasoning step by step.                |
| Trip budget check     | You have €450 for a 4-day trip. Accommodation costs €70 per night (3 nights). Daily transport is €15. You plan to eat out twice a day at an average of €12 per meal. How much money is left for activities and shopping? Show your reasoning. |

#### 2B Outputs

**Logic puzzle**

<details><summary>Click to expand Logic puzzle</summary>

```PowerShell
This is a classic distance, rate, and time problem. We need to find the one-way distance first and then double it
to find the total distance traveled.

### Step-by-Step Reasoning

**1. Define the variables:**
* Let $D$ be the distance between City A and City B (in km).
* Speed from A to B ($v_1$): $60 \text{ km/h}$
* Speed from B to A ($v_2$): $90 \text{ km/h}$
* Total Time ($T$): $5 \text{ hours}$

**2. Express the time for each leg of the journey:**
We use the formula: $\text{Time} = \frac{\text{Distance}}{\text{Speed}}$

* **Time for the trip from A to B ($t_1$):**
$$t_1 = \frac{D}{60}$$

* **Time for the return trip from B to A ($t_2$):**
$$t_2 = \frac{D}{90}$$

**3. Set up the equation for the total time:**
The sum of the time for both trips equals the total travel time:
$$t_1 + t_2 = T$$
$$\frac{D}{60} + \frac{D}{90} = 5$$

**4. Solve the equation for D:**
To add the fractions on the left side, find a common denominator for 60 and 90. The Least Common Multiple (LCM) of
60 and 90 is 180.

* Convert the fractions:
$$\frac{D \times 3}{60 \times 3} + \frac{D \times 2}{90 \times 2} = 5$$
$$\frac{3D}{180} + \frac{2D}{180} = 5$$

* Combine the fractions:
$$\frac{3D + 2D}{180} = 5$$
$$\frac{5D}{180} = 5$$

* Simplify the fraction $\frac{5}{180}$:
$$\frac{D}{36} = 5$$

* Solve for $D$:
$$D = 5 \times 36$$
$$D = 180$$

The one-way distance between City A and City B is $180 \text{ km}$.

**5. Calculate the total distance traveled:**
The total distance traveled is the distance from A to B plus the distance from B to A (the round trip).
$$\text{Total Distance} = D + D = 2D$$
$$\text{Total Distance} = 2 \times 180$$
$$\text{Total Distance} = 360 \text{ km}$$

---
### Answer:
The total distance traveled is **360 km**.
```

</details>

**Trip budget check**

<details><summary>Click to expand Trip budget check</summary>

```PowerShell
This is how to calculate the remaining money:

### 1. Calculate Accommodation Costs
*   **Cost:** €70 per night
*   **Duration:** 3 nights (for a 4-day trip)
*   **Calculation:** $€70 \times 3 = €210$

### 2. Calculate Transport Costs
*   **Cost:** €15 per day
*   **Duration:** 4 days
*   **Calculation:** $€15 \times 4 = €60$

### 3. Calculate Food Costs
*   **Meals per day:** 2 meals
*   **Cost per meal:** €12
*   **Daily food cost:** $2 \times €12 = €24$
*   **Total food cost (4 days):** $€24 \times 4 = €96$

### 4. Calculate Total Expenses
*   **Accommodation:** €210
*   **Transport:** €60
*   **Food:** €96
*   **Total Expenses:** $€210 + €60 + €96 = €366$

### 5. Calculate Remaining Money
*   **Starting Budget:** €450
*   **Total Expenses:** €366
*   **Remaining Money:** $€450 - €366 = €84$

***

**Answer:** You have **€84** left for activities and shopping.
```

</details>

#### 4B Outputs

**Logic puzzle**

<details><summary>Click to expand Logic puzzle</summary>

```PowerShell
This problem requires using the relationship $\text{Time} = \frac{\text{Distance}}{\text{Rate}}$ and setting up an
equation based on the total time spent traveling.

### Step 1: Define Variables

Let $D$ be the distance between City A and City B (in km).
*   $R_{out}$ (Rate from A to B): $60 \text{ km/h}$
*   $R_{return}$ (Rate from B to A): $90 \text{ km/h}$
*   $T_{total}$ (Total time): $5 \text{ hours}$

### Step 2: Express Time for Each Leg of the Journey

We calculate the time taken for the outward trip ($T_{out}$) and the return trip ($T_{return}$).

$$T_{out} = \frac{D}{R_{out}} = \frac{D}{60}$$

$$T_{return} = \frac{D}{R_{return}} = \frac{D}{90}$$

### Step 3: Set Up the Total Time Equation

The sum of the times must equal 5 hours:
$$T_{out} + T_{return} = T_{total}$$
$$\frac{D}{60} + \frac{D}{90} = 5$$

### Step 4: Solve for the One-Way Distance ($D$)

To combine the fractions, find the Least Common Multiple (LCM) of 60 and 90.
LCM$(60, 90) = 180$.

Rewrite the equation using the common denominator:
$$\frac{D \cdot 3}{180} + \frac{D \cdot 2}{180} = 5$$

Combine the terms:
$$\frac{3D + 2D}{180} = 5$$
$$\frac{5D}{180} = 5$$

Simplify the fraction $\frac{5D}{180}$ to $\frac{D}{36}$:
$$\frac{D}{36} = 5$$

Multiply both sides by 36 to solve for $D$:
$$D = 5 \times 36$$
$$D = 180 \text{ km}$$

The one-way distance between City A and City B is 180 km.

### Step 5: Calculate the Total Distance Traveled

The total distance traveled is the distance from A to B plus the distance from B to A.

$$\text{Total Distance} = \text{Distance}_{A \to B} + \text{Distance}_{B \to A}$$
$$\text{Total Distance} = D + D = 2D$$
$$\text{Total Distance} = 2 \times 180 \text{ km}$$
$$\text{Total Distance} = 360 \text{ km}$$

***

### Answer

The total distance traveled is **360 km**.

(Check: Time out = 180/60 = 3 hours. Time back = 180/90 = 2 hours. Total time = 3 + 2 = 5 hours. This matches the
given information.)
```

</details>

**Trip budget check**

<details><summary>Click to expand Trip budget check</summary>

```PowerShell
This is a calculation of all fixed expenses to determine the remaining balance for discretionary spending.

### 💰 Calculation Breakdown

**1. Accommodation Cost (3 Nights):**
$$€70 \text{ per night} \times 3 \text{ nights} = €210$$

**2. Transport Cost (4 Days):**
$$€15 \text{ per day} \times 4 \text{ days} = €60$$

**3. Food Cost (2 meals/day for 4 days):**
$$€12 \text{ per meal} \times 2 \text{ meals} \times 4 \text{ days} = €96$$

**4. Total Expenses:**
$$\text{Accommodation} + \text{Transport} + \text{Food}$$
$$€210 + €60 + €96 = €366$$

**5. Remaining Money (For Activities/Shopping):**
$$\text{Total Budget} - \text{Total Expenses}$$
$$€450 - €366 = €84$$

***

**Answer:** You will have **€84** left for activities and shopping.
```

</details>

#### Results

| Prompt               | Model | Correct Answer (Y/N) |
| -------------------- | ----- | -------------------- |
| Logic puzzle         | 2B    |          Y           |
| Logic puzzle         | 4B    |          Y           |
| Trip budget check    | 2B    |          Y           |
| Trip budget check    | 4B    |          Y           |

Both models solved the reasoning tasks correctly and demonstrated reliable multi-step reasoning and calculation abilities. The 4B model generally produced more structured and polished explanations, particularly in the logic puzzle where the additional formatting and final validation step improved readability and reasoning transparency.

The 2B model, while less verbose, often delivered more direct and concise reasoning. In the trip budget scenario, its simpler breakdown arguably made the calculation easier to follow without unnecessary formatting or additional commentary.

Overall, the reasoning differences between the two models were relatively small for these benchmark tasks. The 4B model emphasized presentation, structure, and answer verification, while the 2B model prioritized brevity and efficiency.

### Knowledge Benchmark
This benchmark evaluates how well the models retrieve factual information and apply that knowledge in practical travel-related scenarios.

The trip-planning task combines factual geographic knowledge with contextual recommendation quality, making it less deterministic than the coordinate retrieval task.

| Task | Prompt |
|---|---|
| Geographic knowledge | Give me the GPS coordinates of Brno, Czech Republic. |
| Trip planning | Suggest a family-friendly destination within 3 hours of Olomouc for a 3-day trip in May. Briefly explain why. |

#### 2B Outputs

**Geographic knowledge**

<details><summary>Click to expand Geographic knowledge</summary>

```PowerShell
The approximate GPS coordinates for Brno, Czech Republic are:

**Latitude:** 49.1435° N
**Longitude:** 16.5035° E
```

</details>

**Trip planning**

<details><summary>Click to expand Trip planning</summary>

```PowerShell
Based on your starting point in Olomouc, and the constraints (3 hours travel, family-friendly, 3 days in May), I suggest:

### Destination Suggestion: The Salzkammergut Region, Austria (Focusing on Salzburg/Hallstatt area)

### Why this destination is ideal:

1.  **Travel Time:** The Salzkammergut region is easily accessible from Olomouc, typically requiring about **2.5 to 3 hours** of driving, fitting your travel window perfectly.
2.  **Family Appeal & Activities:** This region is renowned for its stunning Alpine scenery, pristine lakes, charming villages, and rich history. It offers a perfect blend of nature, gentle hiking, and cultural stops that appeal to families.
    *   **Activities:** Boat rides on the lakes, visiting famous lakes like Wolfgangsee, gentle hikes, and exploring historic castles (like those near Salzburg).
3.  **May Timing:** May is an excellent time to visit. The crowds of peak summer are gone, meaning you can enjoy the beautiful landscapes and outdoor activities with fewer crowds and slightly more manageable temperatures than mid-July or August.
4.  **3-Day Itinerary:** You can easily structure three days to focus on different areas:
    *   **Day 1:** Explore a major town like Salzburg or a lakeside village.
    *   **Day 2:** Focus on scenic activities (e.g., lake cruises or moderate hiking).
    *   **Day 3:** Visit a unique, picturesque location (like the famous Hallstatt area, though slightly further, or explore the charming villages of the region).

***

### Alternative Suggestion (Closer/Easier): Bratislava, Slovakia

If you prefer a slightly closer, more urban, and easily walkable trip, **Bratislava** is an excellent alternative.

*   **Pros:** Very easy travel (under 2.5 hours), charming Old Town, great riverside walks, and diverse food options.
*   **Cons:** Less focus on wide-open Alpine nature compared to the Austrian option.
```

</details>

#### 4B Outputs

**Geographic knowledge**

<details><summary>Click to expand Geographic knowledge</summary>

```PowerShell
The approximate coordinates for Brno (the main city center) in the Czech Republic are:

**Latitude:** 49.1919° N
**Longitude:** 16.6904° E

*(Note: Coordinates can vary slightly depending on the exact point within the city center, but these are accurate
for the general urban center.)*
```

</details>

**Trip planning**

<details><summary>Click to expand Trip planning</summary>

```PowerShell
The best family-friendly destination for a 3-day trip from Olomouc in May, while staying within the 3-hour driving
radius, is **Kraków, Poland**, or the surrounding Lesser Poland region.

***

### Why Kraków is Ideal for a May Family Trip:

**1. Perfect Timing and Activities for May:**
May is late spring—the weather is generally mild, the flowers are blooming, and the crowds are less intense than
in high summer. This makes outdoor exploration (walking, cycling, visiting parks) ideal.

**2. Manageable Size and Universal Appeal:**
Kraków has a fantastic, walkable Old Town (Stare Miasto) that is visually captivating and easy for families to
navigate. Unlike massive capital cities, it feels compact enough to explore thoroughly in 3 days without feeling
rushed.

**3. Excellent Family Diversification:**
The trip offers a perfect blend of activities:

*   **Historical Exploration:** Visiting Wawel Royal Castle grounds (kids can explore the castle courtyard and
gardens) and exploring the beautifully preserved main square.
*   **Nature & Parks:** The city is surrounded by beautiful parks and green spaces for running around after a long
day of sightseeing.
*   **Day Trips:** You can easily plan a half-day trip to nearby locations like **Oświęcim** (for history lessons
appropriate for older children) or explore the charming, smaller town of **Kazimierz** (the Jewish Quarter, which
has unique markets and atmosphere).

**Travel Note:** The drive is straightforward and typically takes between 2.5 to 3 hours, depending on traffic and
border crossing.
```

</details>

#### Results

| Prompt               | Model | Accuracy     | Quality (1–5) | Notes |
|----------------------|-------|--------------|---------------|-------|
| Geographic knowledge | 2B    | Approximate  | 3             | Coordinates near Brno but noticeably offset |
| Geographic knowledge | 4B    | High         | 4             | Coordinates close to Brno city center |
| Trip planning        | 2B    | Partial      | 3             | Main recommendation exceeded travel constraint |
| Trip planning        | 4B    | Partial      | 4             | Recommendation closer to requested travel limit |


In the geographic knowledge task, both models returned approximate coordinates for Brno rather than exact city-center values. The 2B model produced coordinates that were noticeably offset from central Brno, while the 4B model returned a more accurate location closer to the city center.

The trip-planning task revealed a more significant limitation in constraint handling. The 2B model suggested the Salzburg region, which exceeds the requested 3-hour travel limit by a large margin. However, its alternative recommendation of Bratislava fit the travel constraint much better and remained relevant for a family-oriented trip.

The 4B model suggested Kraków, which was closer to the requested travel limit but still exceeded it slightly at roughly 3.5 hours by car. Despite the inaccurate travel estimation, both models generated generally relevant and family-friendly activity suggestions for their proposed destinations.

Overall, the 4B model demonstrated better factual precision and stronger constraint awareness, although neither model consistently satisfied all prompt requirements.

### Code Generation

Code generation was evaluated using practical C# and .NET-focused tasks. The focus is on correctness, compilability, and structural quality of the generated code. Execution speed is optional, as output length varies depending on implementation detail.

| Task           | Prompt                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| String reverse | Write a C# static method that reverses a string.                                                             |
| LINQ filtering | Write a LINQ query that filters travel destinations with price under 100 EUR and rating above 4.             |


#### 2B Outputs

**C# string reverse**

<details><summary>Click to expand C# string reverse</summary>

```csharp
Here is the C# code for a static method that reverses a string, using the `StringBuilder` class for efficient
string manipulation:

using System.Text;

public class StringReverser
{
    /// <summary>
    /// Reverses the characters of a given string.
    /// </summary>
    /// <param name="input">The string to be reversed.</param>
    /// <returns>The reversed string.</returns>
    public static string ReverseString(string input)
    {
        // Handle null or empty input strings immediately
        if (string.IsNullOrEmpty(input))
        {
            return input;
        }

        // Use StringBuilder for efficient string manipulation
        StringBuilder reversed = new StringBuilder();

        // Iterate backward through the input string
        for (int i = input.Length - 1; i >= 0; i--)
        {
            reversed.Append(input[i]);
        }

        // Return the final reversed string
        return reversed.ToString();
    }
}

// Example Usage:
public class Program
{
    public static void Main(string[] args)
    {
        string original = "hello world";
        string reversed = StringReverser.ReverseString(original);

        Console.WriteLine($"Original String: {original}");
        Console.WriteLine($"Reversed String: {reversed}");
        // Output: dlrow olleh
    }
}
```

</details>

**LINQ filtering**

<details><summary>Click to expand LINQ filtering</summary>

```csharp
Since LINQ queries depend on the specific data structure (class/collection) you are using, here is the generic
structure of the query, followed by a complete example using a hypothetical C# class.

### Generic LINQ Query

Assuming you have a collection named `destinations` of objects, the query would look like this:

var filteredDestinations = destinations
    .Where(destination => destination.Price < 100 && destination.Rating > 4)
    .ToList();

***

### Complete C# Example

To make this runnable, you would define your data structure and then apply the query:

using System.Collections.Generic;
using System.Linq;

// 1. Define the structure for a travel destination
public class Destination
{
    public string Name { get; set; }
    public double Price { get; set; } // Price in EUR
    public int Rating { get; set; }
}

public class TravelQuery
{
    public static void Main(string[] args)
    {
        // 2. Sample Data
        List<Destination> destinations = new List<Destination>
        {
            new Destination { Name = "Paris", Price = 120, Rating = 4.8 },
            new Destination { Name = "Rome", Price = 85, Rating = 4.5 },
            new Destination { Name = "Berlin", Price = 95, Rating = 4.2 },
            new Destination { Name = "London", Price = 150, Rating = 4.9 },
            new Destination { Name = "Vienna", Price = 75, Rating = 3.9 }
        };

        // 3. The LINQ Query
        var filteredDestinations = destinations
            .Where(d => d.Price < 100 && d.Rating > 4)
            .ToList();

        // 4. Output the Results
        Console.WriteLine("Destinations matching the criteria:");
        foreach (var dest in filteredDestinations)
        {
            Console.WriteLine($"- {dest.Name} (Price: {dest.Price} EUR, Rating: {dest.Rating})");
        }
    }
}

**Explanation:**

1.  **`.Where(...)`**: This is the filtering method in LINQ. It iterates through every item in the collection and
keeps only those items where the condition inside the parentheses evaluates to `true`.
2.  **`destination.Price < 100`**: This checks the first condition (price must be less than 100 EUR).
3.  **`&&`**: This is the logical AND operator, ensuring that *both* conditions must be met for a destination to
be included in the result.
4.  **`destination.Rating > 4`**: This checks the second condition (rating must be greater than 4).
5.  **`.ToList()`**: This executes the query and converts the resulting filtered sequence back into a standard
`List<Destination>`.
```

</details>

#### 4B Outputs

**C# string reverse**

<details><summary>Click to expand C# string reverse</summary>

```csharp
This is a classic programming problem. In C#, because strings are **immutable** (they cannot be changed after
creation), you cannot simply reverse them in place. You must convert the string into a mutable data structure,
manipulate that structure, and then rebuild the string.

I will provide two of the most common and efficient ways to solve this in C#: one using **LINQ** (the most
concise) and one using a **character array and `StringBuilder`** (the generally most performant).

### C# Solution

using System;
using System.Linq;
using System.Text;

public class StringReverser
{
    public static void Main(string[] args)
    {
        string original = "Hello World!";

        // --- Method 1: Using LINQ (Concise and readable) ---
        string reversedLinq = ReverseStringLinq(original);
        Console.WriteLine($"--- Method 1 (LINQ) ---");
        Console.WriteLine($"Original: {original}");
        Console.WriteLine($"Reversed: {reversedLinq}");
        Console.WriteLine("-----------------------\n");

        // --- Method 2: Using Array and StringBuilder (Efficient) ---
        string reversedArray = ReverseStringArray(original);
        Console.WriteLine($"--- Method 2 (Array/StringBuilder) ---");
        Console.WriteLine($"Original: {original}");
        Console.WriteLine($"Reversed: {reversedArray}");
        Console.WriteLine("------------------------------------");
    }

    /// <summary>
    /// Reverses a string using LINQ (Language Integrated Query).
    /// This is the most concise way to write the code.
    /// </summary>
    public static string ReverseStringLinq(string original)
    {
        // 1. Convert the string to a character array.
        // 2. Use the .Reverse() extension method to reverse the sequence.
        // 3. Use new string(char[]) to build the new string from the reversed characters.
        return new string(original.ToCharArray().Reverse().ToArray());
    }

    /// <summary>
    /// Reverses a string by converting it to a character array,
    /// explicitly reversing the array, and then building the string.
    /// This method is often slightly more performant than LINQ for large strings.
    /// </summary>
    public static string ReverseStringArray(string original)
    {
        if (string.IsNullOrEmpty(original))
        {
            return original;
        }

        // Convert the string to a mutable character array.
        char[] charArray = original.ToCharArray();

        // Use the built-in Array class method to reverse the order of characters.
        Array.Reverse(charArray);

        // Create and return a new string from the reversed array.
        return new string(charArray);
    }
}

### Explanation of Methods

#### 1. LINQ Approach (`ReverseStringLinq`)
*   **How it works:** This method leverages the power of Language Integrated Query (LINQ). It treats the string as
a sequence of characters (`char[]`), applies the built-in `.Reverse()` extension method to that sequence, and then
reconstructs the string using the characters from the reversed sequence.
*   **Pros:** Extremely short, readable, and very "C#-like."
*   **Cons:** In some scenarios involving very large strings, the overhead of creating multiple enumerable
structures can make it marginally slower than a direct array manipulation.

#### 2. Array/StringBuilder Approach (`ReverseStringArray`)
*   **How it works:** This is the classic, manual approach.
    1.  It converts the string to a `char[]` array.
    2.  It uses the highly optimized, built-in `Array.Reverse()` function, which swaps the elements in the array
efficiently.
    3.  Finally, it constructs a brand new string from the reversed array.
*   **Pros:** Highly performant and efficient for all string sizes. This is often considered the textbook "best
practice" solution for performance.
*   **Cons:** Slightly more verbose than the LINQ method.

### Which Method Should You Use?

*   **For professional code where readability matters most, and performance hit is negligible:** Use the **LINQ
approach**. It is the shortest and most idiomatic way to express "reverse this."
*   **For a coding interview or when optimizing for maximum performance with very large inputs:** Use the
**Array/StringBuilder approach**.
```

</details>

**LINQ filtering**

<details><summary>Click to expand LINQ filtering</summary>

```csharp
This requires three parts: defining a data structure (a class), setting up some sample data, and then executing
the LINQ query.

I will provide the solution using both the **Method Syntax** (using lambda expressions) and the **Query Syntax**
(using `from`/`where`/`select`), as both are valid and commonly used in C#.

### C# Implementation

using System;
using System.Collections.Generic;
using System.Linq;

// 1. Define the data structure (the Model)
public class TravelDestination
{
    public string Name { get; set; }
    public string Country { get; set; }
    public double Price { get; set; } // Price in EUR
    public double Rating { get; set; }
}

public class Program
{
    public static void Main()
    {
        // 2. Sample Dataset
        List<TravelDestination> destinations = new List<TravelDestination>
        {
            new TravelDestination { Name = "Kyoto", Price = 1200, Rating = 4.7 }, // Match
            new TravelDestination { Name = "Paris", Price = 950, Rating = 4.9 },  // No Match (Price too high)
            new TravelDestination { Name = "Seville", Price = 300, Rating = 4.2 }, // No Match (Rating too low)
            new TravelDestination { Name = "Rome", Price = 1100, Rating = 4.5 }, // Match
            new TravelDestination { Name = "Berlin", Price = 750, Rating = 4.8 }  // Match
        };

        Console.WriteLine("--- Using LINQ Method Syntax (Recommended) ---");
        FilterAndDisplay(destinations);

        Console.WriteLine("\n--- Using LINQ Query Syntax ---");
        QueryFilterAndDisplay(destinations);
    }

    // 3. LINQ Method Syntax (The most common and flexible way)
    public static void FilterAndDisplay(List<TravelDestination> destinations)
    {
        // Syntax: collection.Where(condition)
        var affordableAndHighlyRated = destinations
            .Where(destination => destination.Price <= 1000 && destination.Rating >= 4.2)
            .ToList();

        // Display results
        foreach (var dest in affordableAndHighlyRated)
        {
            Console.WriteLine($"- {dest.Name}: Price €{dest.Price}, Rating {dest.Rating:N1}");
        }
    }

    // 4. LINQ Query Syntax (Looks more like SQL)
    public static void QueryFilterAndDisplay(List<TravelDestination> destinations)
    {
        // Syntax: from item in collection where condition select item
        var affordableAndHighlyRated = (from destination in destinations
                                      where destination.Price <= 1000 && destination.Rating >= 4.2
                                      select destination).ToList();

        // Display results
        foreach (var dest in affordableAndHighlyRated)
        {
            Console.WriteLine($"- {dest.Name}: Price €{dest.Price}, Rating {dest.Rating:N1}");
        }
    }
}

### Explanation:

1.  **The Goal:** We need to filter a list of destinations based on two criteria simultaneously:
    *   The price must be less than or equal to €1000.
    *   The rating must be greater than or equal to 4.2.
2.  **`Where()` Clause:** The core of the operation is the `.Where()` extension method (in the Method Syntax).
This method takes a *lambda expression* (a function definition, e.g., `destination => ...`) and applies the logic
inside the parentheses to every item in the list.
3.  **Lambda Expression Logic:** The condition `destination.Price <= 1000 && destination.Rating >= 4.2` is the
filtering logic.
    *   `&&` is the logical AND operator, meaning *both* conditions must be true for the destination to be
included in the results.
4.  **Method Syntax vs. Query Syntax:**
    *   **Method Syntax (`.Where(...)`):** This is the standard, recommended way in modern C# LINQ programming.
It's flexible and explicit.
    *   **Query Syntax (`from...where...select`):** This syntax mimics SQL structure and is easier for developers
coming from database query languages to read, but it often compiles down to the Method Syntax anyway.

### Output:

--- Using LINQ Method Syntax (Recommended) ---
- Rome: Price €1100, Rating 4.5  // Note: The sample data has a price of 1100 for Rome, so it might not display
unless the condition is slightly relaxed or the sample data is adjusted.
                                 // Correction: Given the sample data, the output should only be Berlin if the
price was set correctly.

--- Using LINQ Query Syntax ---
- Berlin: Price €750, Rating 4.8

***Self-Correction Note on Sample Data:** I noticed I wrote `Price = 1100` for Rome, which violates my condition
(`<= 1000`). For the code to run perfectly, I've assumed the desired matches were the ones that actually satisfy
both criteria.*
```

</details>

#### Results

| Prompt            | Model | Compiles (Y/N) | Correctness (1–5) | Structure (1–5) |
| ----------------- | ----- | -------------- | ----------------- | --------------- |
| C# string reverse | 2B    |       Y        |        3          |        3        |
| C# string reverse | 4B    |       Y        |        5          |        4        |
| LINQ filtering    | 2B    |       N        |        2          |        3        |
| LINQ filtering    | 4B    |       Y        |        3          |        4        |

The 2B model generated relatively simple and direct solutions, but code quality and reliability were inconsistent. While the string reverse implementation compiled and worked correctly, the LINQ filtering example failed to compile because the `Rating` property was declared as `int` while the sample data used floating-point values such as `4.8`.

The 4B model produced significantly more comprehensive outputs, including explanations, alternative implementations, comments, and architectural reasoning behind its decisions. For the string reverse task, the generated solution was polished and educational, although somewhat overengineered relative to the simplicity of the original prompt.

The LINQ filtering benchmark exposed a more important weakness in the 4B model: silent requirement drift. Instead of implementing the requested condition (`price < 100`), the model changed the business constraint to `price <= 1000` while still presenting the solution confidently and with extensive supporting explanations. However, unlike the 2B model, the generated code remained compilable and internally consistent, even including a self-correction note about issues in the sample dataset.

Overall, the 2B model behaved similarly to a junior developer: capable of solving simpler tasks but more prone to implementation mistakes and type-safety issues. The 4B model resembled a more experienced developer by generating better structured and more maintainable code, but it also demonstrated a tendency to overengineer simple tasks and occasionally deviate from the original requirements.

### Structured Output (JSON)

Structured output reliability was evaluated using strict JSON generation tasks. The primary metric is format validity and schema adherence.

| Task         | Prompt                                                                               |
| ------------ | ------------------------------------------------------------------------------------ |
| Book list    | Return a JSON array of 3 books with fields: title, author, year.                     |
| User object  | Convert this sentence into JSON: The weather in Prague will be sunny with a temperature of 24 degrees Celsius.          |

#### 2B Outputs

**Book list JSON**

<details><summary>Click to expand Book list JSON</summary>

```json
[
  {
    "title": "The Hitchhiker's Guide to the Galaxy",
    "author": "Douglas Adams",
    "year": 1979
  },
  {
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "year": 1813
  },
  {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949
  }
]
```

</details>

**User object**

<details><summary>Click to expand User object</summary>

```json
{
  "city": "Prague",
  "weather": "sunny",
  "temperature": "24 degrees Celsius"
}
```

</details>

#### 4B Outputs

**Book list JSON**

<details><summary>Click to expand Book list JSON</summary>

```json
[
  {
    "title": "The Hitchhiker's Guide to the Galaxy",
    "author": "Douglas Adams",
    "year": 1979
  },
  {
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "year": 1960
  },
  {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949
  }
]
```

</details>

**User object**

<details><summary>Click to expand User object</summary>

```json
{
  "weather_report": {
    "location": "Prague",
    "condition": "sunny",
    "temperature": {
      "value": 24,
      "unit": "Celsius"
    },
    "description": "The weather will be sunny."
  }
}

### Alternative (More Compact):

If you prefer a flat structure without nesting:

{
  "location": "Prague",
  "weather_condition": "sunny",
  "temperature": 24,
  "unit": "Celsius"
}
```

</details>

#### Results

| Prompt              | Model | Valid JSON (Y/N) | Format Accuracy (1–5) | 
| ------------------- | ----- | ---------------- | --------------------- | 
| Book list JSON      | 2B    |         Y        |          5            |       |
| Book list JSON      | 4B    |         Y        |          5            |       |
| User object         | 2B    |         Y        |          3            |       |
| User object         | 4B    |         N        |          3            |       |

Both models successfully generated valid JSON for the Book List task and correctly followed the requested array structure.

The User Object task revealed more meaningful behavioral differences. The 2B model generated a simple flat JSON object that remained fully machine-readable, although it combined the temperature value and unit into a single string field rather than separating them structurally.

The 4B model produced a more sophisticated nested JSON structure with stronger semantic organization. However, it also introduced additional explanatory text and an alternative schema suggestion outside the JSON block, which breaks strict JSON-only output requirements. This highlights a common large-model behavior: prioritizing helpfulness and elaboration over strict format compliance.

Overall, the 2B model demonstrated stronger literal adherence to structured-output constraints, while the 4B model showed greater flexibility and semantic structuring at the cost of strict machine-readable reliability. With more explicit schema instructions, both models would likely achieve significantly more consistent structured-output performance.

### Instruction Following

Instruction following was evaluated using constraint-based prompts. The focus is on compliance with explicit constraints rather than output speed or length, as these factors are irrelevant to task success.

| Task                | Prompt                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| Word limit          | Explain Prague in exactly 20 words.                                        |
| Language constraint | Explain REST API in Czech only.                                            |

#### 2B Outputs

**Word limit**

<details><summary>Click to expand Word limit</summary>

```Powershell
Prague, the capital of the Czech Republic, is a stunning historic city known for its beautiful architecture,
bridges, and rich cultural history.
```

</details>

**Language constraint**

<details><summary>Click to expand Language constraint</summary>

```Powershell
**REST API** je architektonický styl, který se používá pro navrhování síťových aplikací, které umožňují různým
softwarovým systémy komunikovat s sebou. Funguje jako standardizovaný rozhraní, které využívá protokol HTTP k
požadavku a výměně dat z tzv. zdrojů (resources). Jedná se tedy o způsob, jak aplikace mohou efektivně a
škálovatelně sdílet informace přes internet.
```

</details>

#### 4B Outputs

**Word limit**

<details><summary>Click to expand Word limit</summary>

```Powershell
Prague, the historic Czech capital, blends medieval charm with modern life. Its stunning Charles Bridge and Gothic
architecture create a vibrant, fairytale atmosphere.
```

</details>

**Language constraint**

<details><summary>Click to expand Language constraint</summary>

```Powershell
REST (Representational State Transfer) je architektonický styl pro návrh API (Application Programming Interface).
Nejedná se o konkrétní protokol, ale o soubor pravidel, jakým způsobem mají dvě softwarové systémy (klient a
server) efektivně komunikovat po internetu.

**Zjednodušeně řečeno:** REST umožňuje, aby dvě naprosto odlišné programy "mluvily" se vzájemně, aniž by musely
vědět, jak funguje druhé zařízení.

### Klíčové koncepty REST:

1. **Zasoby (Resources):** Ve REST se vše modeluje jako **zasoby**. Každý zasob je jedinečně identifikován pomocí
URL (např. `/uzivatel/123`).
2. **HTTP Verby (Metody):** Komunikace probíhá pomocí standardních HTTP metod, které určují, co přesně s daným
zdrojem chcete udělat:
    * **`GET`**: Požádání o zobrazení (načtení) dat ze zdroje (např. *zobrazit profil uživatele*).
    * **`POST`**: Odeslání nových dat na server (např. *zaregistrovat nového uživatele*).
    * **`PUT` / `PATCH`**: Aktualizace existujícího zdroje (např. *změnit e-mail uživatele*).
    * **`DELETE`**: Odstranění zdroje (např. *smazat účet*).
3. **Bezstátovost (Stateless):** To je klíčový princip. Každý požadavek, který klient pošle na server, musí být
kompletně sebeobsestojný. Server si v paměti nic nezpamatuje ze předchozí interakce – zpracuje požadavek a odpoví,
bez nutnosti kontextu.

**Shrnutí:** REST systematicky používá standardní HTTP metody ke zjednodušené manipulaci s určenými datovými
zasoby, což vede k vysoce škálovatelným a spolehlivým webovým službám.
```

</details>

#### Results

| Prompt        | Model | Constraint Met (Y/N) |          Deviation Type                  |
| ------------- | ----- | -------------------- | -----------------------------------------| 
| 20-word limit | 2B    |         N            | Exceeded word limit (22 words)           |
| 20-word limit | 4B    |         N            | Exceeded word limit (23 words)           |
| Czech only    | 2B    |         Y            | Minor grammar inaccuracies               |
| Czech only    | 4B    |         N            | Multiple Czech grammar/spelling issues   |

Both models struggled with strict constraint adherence despite generally understanding the intent of the prompts. In the 20-word benchmark, both responses exceeded the required limit by a small margin, suggesting approximate rather than exact token or word control.

The Czech-only benchmark revealed a different pattern. The 2B model produced a simpler response with relatively minor grammatical issues while remaining almost entirely in Czech. The 4B model generated a more detailed and technically structured explanation, but introduced multiple English technical terms and acronym expansions despite the explicit language restriction.

This reflects a recurring trend observed throughout the benchmarks: the 2B model tends to follow instructions more literally but with simpler outputs, while the 4B model prioritizes elaboration, explanation quality, and completeness even when doing so weakens strict constraint compliance.

Both models often failed when strict rules were required, especially for exact formatting and language constraints.

### System Metrics

| Model | Avg CPU % | Peak CPU % | RAM Usage (GB) | RAM Usage Peak (GB) | Avg GPU % | Peak GPU % |
| ----- | --------- | ---------- | -------------- | ------------------- | --------- | ---------- |
| **2B**    |     55    |     65.9   |       6.3      |       6.9           |    12.1   |     15.3   |
| **4B**    |     73    |     85.4   |       8.9      |       9.8           |    13.3   |     15.0   |

Let’s start with CPU usage.

The 4B model consistently required significantly more CPU resources than the 2B model. During heavier reasoning tasks, CPU spikes were noticeable and the system became less responsive for other workloads.

The 2B model behaved more efficiently, with average CPU usage around 55% and peaks under 66%, leaving sufficient headroom for multitasking.

GPU utilization remained low for both models. Even at peak load, usage stayed around 12–15%, indicating that most computation was executed on the CPU rather than the GPU.

This is expected given the hardware configuration. The GTX 950 (2 GB VRAM) cannot hold either model fully in memory, so Ollama uses partial GPU offloading — only a subset of layers is executed on the GPU, while the remaining computation runs on CPU via system RAM. As a result, GPU usage remains low while CPU handles the majority of inference workload.

RAM usage was stable and predictable. The 2B model required approximately 6–7 GB of RAM, while the 4B model consumed around 9–10 GB. For models of this size, this is within reasonable limits on a 24 GB system.

It is also important to note that Ollama does not continuously keep models in memory when idle. If a model is not used for a period of time, it is unloaded to free system resources. This improves overall system efficiency but introduces a cold-start penalty, where the first request after inactivity has increased latency due to model reloading.

## Summary

This comparison summarizes the relative strengths of each model across all benchmarks. “Advantage” does not always mean one model is strictly better, but that it performed more effectively for the specific task.

| Benchmark             | Gemma 4 E2B (2B)                               | Gemma 4 E4B (4B)                                   | Advantage |
| --------------------- | ---------------------------------------------- | -------------------------------------------------- | --------- |
| Speed                 | ~6.7 tokens/s · faster response time           | ~5.0 tokens/s · slower generation                  | **E2B**   |
| Reasoning             | Correct results · concise explanations         | Correct results · more structured reasoning        | **Tie**   |
| Knowledge             | Slight coordinate inaccuracy · travel mismatch | More accurate coordinates · closer travel estimate | **E4B**   |
| Code Generation       | One compile issue (type mismatch)              | Compiles correctly · slight requirement drift      | **E4B**   |
| Structured Output     | Strict JSON compliance                         | Valid JSON but occasional extra explanation text   | **E2B**   |
| Instruction Following | Slight word limit violation                    | Multiple constraint violations (word + language)   | **E2B**   |
| Avg CPU Usage         | ~55% (peak ~66%)                               | ~73% (peak ~85%)                                   | **E2B**   |
| RAM Usage             | ~6.3 GB (peak ~6.9 GB)                         | ~8.9 GB (peak ~9.8 GB)                             | **E2B**   |
| Avg GPU Usage         | ~12%                                           | ~13%                                               | **Tie**   |


In this article, I explored how well Gemma models can run on an older machine and what kind of performance you can realistically expect in everyday use.

The speed benchmark shows expected behavior: the 2B model is **consistently faster** than the 4B model, but this comes with a trade-off in **response quality** and depth.

In the reasoning benchmark, both models performed well on multi-step logic problems and demonstrated solid problem-solving capabilities.

The knowledge benchmark revealed that both models can be **slightly inaccurate** when recalling factual or geographic information, so results should be **treated with caution**.

In the code generation benchmark, the 2B model behaves more like a **junior or intern developer**, while the 4B model is closer to a more experienced **junior or early mid-level developer**. The 4B model produces more structured and comprehensive code, but can sometimes overcomplicate solutions or deviate from requirements.

The structured output benchmark shows that both models are capable of generating valid **JSON**. With more strict prompting, their reliability in structured formats can likely be further improved.

The instruction-following benchmark was the **weakest area** for both models. Both failed to consistently respect strict constraints such as exact word limits, and the 4B model also showed noticeable issues when responding in Czech.

System metrics show that even an older machine can run both Gemma 2B and 4B models effectively. Initially, I expected RAM to be the main limitation, but in practice **CPU became the primary bottleneck**. The 4B model in particular can significantly slow down the system under heavier prompts.

You may notice that I used two types of prompts for benchmarking: C# coding tasks and trip-planning scenarios. This was not chosen randomly. The goal was to evaluate how the models handle both relatively simple coding tasks and more open-ended planning prompts.

A significant part of this will also carry over into my next article. I am planning to build an initial MVP application that uses the Gemma 4 model as its core, where trip planning will play a central role.