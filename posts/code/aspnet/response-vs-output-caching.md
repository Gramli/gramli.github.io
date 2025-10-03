*Posted 10/03/2025*

# Response Caching vs. Output Caching in ASP.NET

| Feature | Response Caching | Output Caching |
|---------|------------------|----------------|
| **Where the cache lives** | On the **client, proxy, CDN** (external to server) | On the **server** (in memory, optionally distributed) |
| **How it works** | Adds HTTP headers (`Cache-Control`, `Vary`) so intermediaries can cache responses | Stores the generated response on the server and serves it directly without re-executing the endpoint |
| **Best use cases** | - Public APIs where proxies/CDNs can cache static or rarely-changing data <br> - Browser caching of GET endpoints (e.g., product catalog, blog posts) | - Expensive server-side computations <br> - Frequently requested responses where execution cost is high (e.g., report generation, user profile rendering) |
| **Example** | [Response Caching in Minimap API](https://gramli.github.io/posts/code/aspnet/response-caching-minimal-api) | [Output Caching  in Minimap API](https://gramli.github.io/posts/code/aspnet/output-caching-with-authorization)  |
| **Pros** | - Offloads server work to client/proxy <br> - Reduces bandwidth | - Skips re-executing controller/endpoint <br> - Works even if client disables caching |
| **Cons** | - Relies on client/proxy honoring headers <br> - No server control once cached externally | - Increases server memory usage <br> - Cache invalidation needed when data changes |

## When to use
- Use **Response Caching** when responses are **static or public** and can safely be cached by browsers/CDNs.  
- Use **Output Caching** when responses are **costly to generate** and you want the server to short-circuit execution.  
- Combine both if you want **server + client/proxy caching**.