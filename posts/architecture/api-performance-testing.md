---
layout: post
title: "API Performance Testing: Designing Realistic Tests"
date: 2026-10-05
categories: [architecture, api, performance, testing]
description: "Design realistic API performance tests with representative user journeys, expected load, external dependencies, production-like environments, and meaningful metrics."
---

# API Performance Testing: Designing Realistic Tests

Most of us have heard the term **performance testing**, whether before releasing a big new feature, launching a new application or simply checking whether an application can handle a specific load.

**Performance tests** help us understand how our application behaves under load and whether it can handle the expected pressure. However, they need to be designed properly. Otherwise, the results can be misleading and lead us to the wrong conclusions.

Properly designed performance tests, on the other hand, can help us **identify bottlenecks**, understand the **limits of our application** and give us more **confidence before a release**.

In this article, we will first look at the basic concepts and different types of performance tests. Then we will move to the more practical part: how to design realistic test scenarios, how to determine the load our application should handle, how to deal with external services and how closely our test environment should match production.

The goal is not just to generate a large number of requests, but to create performance tests that actually tell us something useful about how our application will behave in the real world.

## Table of Contents

- [Basic Definition](#basic-definition)
  - [Types of Tests](#types-of-tests)
- [How to Properly Design Performance Tests](#how-to-properly-design-performance-tests)
  - [Defining the Expected Load](#defining-the-expected-load)
- [Performance Testing and External Services](#performance-testing-and-external-services)
- [Environment Configuration](#environment-configuration)
- [Metrics and Results](#metrics-and-results)
- [Summary](#summary)

So, let's start with the basic definition and different types of performance tests.


## Basic Definition

We can summarize **performance testing** as a non-functional software testing method that evaluates an application's speed, stability, scalability and responsiveness under a specific workload.

To simplify it, let's use an API as an example. We prepare tests that call the endpoints we want to test under load, usually in a specific order that represents how the application is actually used. The main idea behind performance testing is to avoid releasing an application that is not prepared for the expected load. 

Poor performance can lead to production outages, slow response times, or situations where the application is unable to process a job within the required time. All of these problems can eventually lead to lost customers, lost revenue, or damage to the product's reputation.

We can divide performance tests into different types depending on their configuration, purpose, and the metrics we want to observe.

### Types of Tests

![Types of Tests](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/egvl188jaine2b5uqetl.png)

I think the picture says it all, but let's briefly describe each type:

**Load tests** verify how the application behaves under an expected or normal level of traffic. The goal is usually to confirm that the system can handle the required number of users or requests while keeping acceptable response times, error rates, and resource usage.

**Stress tests** push the application beyond its expected limits to find out where it starts to degrade or fail. They help us identify the maximum capacity of the system and observe how it behaves when resources such as CPU, memory, database connections, or threads become exhausted.

**Endurance (Soak) tests** run the application under sustained load for a longer period of time. Their purpose is to uncover problems that may not appear during shorter tests, such as memory leaks, connection leaks, resource exhaustion, or performance degradation over time.

**Spike (Peak) tests** simulate a sudden and significant increase in traffic. They help us verify how the application reacts to rapid changes in load and whether it can recover once the traffic returns to normal.

**Volume tests** focus on how the application behaves when it needs to process or work with a large amount of data. For example, we may test how database queries, imports, exports, or batch operations behave when the data volume is much larger than usual.

**Scalability tests** verify how the application's performance changes when we increase the workload and add more resources. The goal is to understand whether the system can scale efficiently, for example by adding more application instances, CPU, memory, or database capacity.

You don't necessarily need to implement a completely different test for each type. In many cases, you can reuse the same performance test scenario and change its configuration depending on what you want to measure, for example, the number of concurrent users, duration, request rate or workload pattern. You then observe different metrics depending on the goal of the test.

Not every application needs every type of performance test either. Some applications may mainly need load and stress tests, while others may benefit more from load and spike tests. It really depends on the application's requirements and, more importantly, on how users actually use it.

## How to Properly Design Performance Tests

Properly designed performance tests are very important because, most of the time, we don't want to simply fire requests at random endpoints. That usually doesn't tell us much about the real behavior of the application or where its bottlenecks are.

What has worked well for me over time is identifying typical user behavior and simulating it in performance tests. For example, imagine an e-commerce application with an ordering system.

A typical user might:

1. Search for a few products.
2. Add products to the shopping cart.
3. Go through the checkout process.
4. Complete the payment.

Instead of testing each endpoint in isolation, I would design a performance test that simulates this whole flow and calls the same endpoints that the frontend normally calls.

Another example could be a business application with multiple types of users, where each user type has different permissions and uses the application differently. In that case, we can design a typical workflow for each user type and call the API endpoints in the same order that the frontend does. The benefit of this approach is that we simulate realistic user behavior. We can then change the test configuration: for example, by increasing the number of concurrent users, while keeping the same realistic workflows.

Another example could be API-to-API communication. Imagine that we have a `POST` endpoint followed by a `GET` endpoint. In that case, we can simulate different input parameters and request patterns under a specific load and observe how the system behaves.

Let's say we have designed our user paths. There are still a few important things we should consider when building the actual test flow. The image below summarizes some of the key ideas:

![User Paths](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/ikgeulw5553509ylonnd.png)

- Real users don't click as fast as a performance test can send requests, so we should introduce realistic think time between operations.
- Not every user follows the same path. In an e-commerce application, some users complete an order, while others only browse products or add items to the cart and return later. We should therefore simulate multiple user paths with different behavior.
- Users usually don't all connect at exactly the same moment, so for a normal load test we should ramp up the load gradually.

A realistic user journey tells us what to test. The next question is how much load the system needs to handle.

### Defining the Expected Load

Designing a realistic workload is only one part of the job. Before running the test, we also need to define what a successful result actually looks like. Not every application needs to handle 1,000 requests per second. Every system has its own expected workload and performance requirements.

For example:
```plaintext
Expected load: 150 RPS

p95 < 400 ms
p99 < 1 s
Error rate < 0.5%
Required throughput maintained
No continuously growing queues/connections
```

So how can we determine those numbers?

Let's return to our e-commerce example. Many applications have periods when traffic is significantly higher than usual. For an e-commerce application, this could be Christmas, Black Friday, or another major sales event. If the company already has good observability, historical production metrics can give us a useful starting point. We can check tools such as Grafana and determine the peak request rate, number of concurrent users, order volume, CPU usage, memory consumption, and other relevant metrics. We can then estimate future load. For example, if we expect traffic to grow by 10% next year, we may decide to test the system with an additional safety margin above that expected load.

Another way to estimate the required load is to start from a business requirement. For example, let's say the business expects our e-commerce application to process 10,000 orders during a two-hour peak period. We can look at a typical order flow and estimate how many HTTP requests are generated while a user searches for products, adds or removes items from the cart, goes through checkout and completes the order. If one completed order generates, for example 20 requests on average, then 10,000 orders mean roughly 200,000 requests during those two hours.

From there, we can calculate the average request rate:

> 200,000 requests / 7,200 seconds ≈ 28 requests per second

This gives us an average of roughly 28 RPS. It does not mean that 28 RPS should automatically become our test target. This calculation only estimates the traffic generated by completed order flows. Real application traffic will usually be higher because browsing, abandoned carts, background requests and other user journeys also contribute to the total workload. Real traffic is also rarely distributed evenly, so we should account for shorter traffic peaks and add an appropriate safety margin.

This approach gives us another way to estimate the required load when reliable production metrics are not available, showing that we can derive performance targets from both technical data and business requirements.

## Performance Testing and External Services

External services require special attention during performance testing.

In some cases, we can mock an external service because we simply don't need or want to test it for several reasons. A good example is a paid API behind our endpoint, such as an LLM API or another paid third-party service. Cost is a valid concern because during performance testing our application may generate a large number of requests in a relatively short period of time.

Another scenario is when we simply don't need to call the external API at all. For example, it could be a simple reference-data API or a payment provider whose performance is outside the scope of our test. Instead, we can replace it with a controlled dependency using a tool such as WireMock and return the responses we expect during the test. This allows us to focus on the performance of our own application without having the external service's performance, rate limits or availability influence the results and make it harder to identify the actual bottleneck.

On the other hand, if communication with the external service is an important part of the system's real-world performance, we may want to test it separately or include it in the performance test.

So, whether we mock an external service should depend on the behavior we want to simulate and what exactly we want to measure.

## Environment Configuration

Environment configuration is another important part of performance testing because, ideally, we want our performance test environment to be as close to production as possible. If the environment differs significantly from production, the results can become misleading, especially when we want to estimate how the application will behave under real production load.

So, what should we configure?

First, the application itself should use the same or very similar configuration as production. The server or cluster where the API is running should also have comparable CPU, memory, scaling rules and other resource limits.

The same applies to the database. It is not only about using similar database resources, though. We should also avoid testing against an almost empty database. The amount and distribution of data can have a significant impact on performance. Under high load, CRUD operations, joins, filtering, and sorting can behave very differently when tables contain millions of rows compared to just a few test records. Indexes, query execution plans, statistics and caching can all behave differently depending on the size and structure of the data.

For that reason, the test database should contain a realistic amount of representative data whenever possible.

We should also pay attention to caching configuration, for example Redis or in-memory caching. A different cache configuration, or testing with a permanently warm cache, can produce results that do not represent real production behavior.

Network conditions are another important factor. For example, if an external service is mocked locally, requests may complete almost instantly, while the real service in production could add tens or hundreds of milliseconds of network latency. Depending on what we want to measure, we may need to simulate this latency to get more realistic results.

And finally, there is the load generator itself. This one is easy to forget. The machine generating the load must have enough CPU, memory, network capacity and available connections to generate the required workload. Otherwise, the load generator can become the bottleneck instead of the application we are actually testing.

## Metrics and Results

Once we run our performance tests, we need to evaluate the results and usually create some form of report. The metrics we focus on depend on the type of test, because different test types answer different questions.

Let's return to our e-commerce application and say that we decided to run both load and stress tests.

For a **load test**, we already know the expected workload, for example a specific number of requests per second or concurrent users. Now we want to verify that the application can handle this load while maintaining acceptable performance.

Some of the most important metrics are:

* **Response time**, especially percentiles such as p95 or p99.
* **Error rate** — what percentage of requests failed.
* **Throughput** — whether the application actually processed the expected number of requests.
* **Resource usage** — CPU, memory, database connections, connection pools and other relevant resources.

For example, if the p95 response time of a particular endpoint is much higher than expected, we can start investigating where the bottleneck is. Similarly, if the error rate exceeds our acceptable limit, we need to find out which requests are failing and why.

For a **stress test**, our goal is slightly different. We intentionally increase the load beyond the expected level and try to find the point where the application starts to degrade. Here, we watch how response times and error rates change as the load increases, together with CPU, memory, database connections, queues and other limited resources. We are looking for the point where the system becomes saturated, starts producing too many errors or can no longer maintain the required throughput.

It is also useful to observe how the application behaves after the load decreases. A system that slows down under extreme load but recovers afterwards behaves very differently from one that remains stuck or requires a restart.

The image below shows the metrics we monitored in our examples and highlights why we need to look at multiple graphs together to identify a specific bottleneck or saturation point.

![Performance test metrics](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/sx43kib761bm9xmykil8.jpg)

The final report should therefore not contain only a single number such as average response time. It should connect the generated workload with latency, throughput, errors and resource utilization so that we can understand not only whether the application failed to meet our expectations, but also why.

## Summary

In this article, we covered some performance testing basics and then focused on how to design tests for real-world scenarios.

The key is to understand how the application is actually used, prepare a realistic test environment, generate a representative workload and monitor the right metrics. When these parts are designed properly, performance tests can give us useful information about bottlenecks, system limits and overall application behavior under load.

There are already many great articles explaining performance testing theory and individual test types. My goal here was not to repeat all of that, but to look at performance testing from a more practical point of view and show how I approach designing realistic tests.

In the end, a performance test is only useful when its workload, environment and metrics are realistic enough to make the results meaningful.
