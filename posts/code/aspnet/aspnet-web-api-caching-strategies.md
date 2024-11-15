# ASP.NET Core caching strategies

<table>
  <thead>
    <tr>
      <th>Cache Type</th>
      <th>Best for</th>
      <th>Benefits of usage</th>
      <th>.Net Tool to Use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>In-Memory Caching</td>
      <td>Single-server</td>
      <td>Fast data retrieve</td>
      <td>
        <a href="https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory?view=aspnetcore-9.0">IMemoryCache</a>
      </td>
    </tr>
    <tr>
      <td>Distributed Caching</td>
      <td>Multi-server</td>
      <td>Faster data retrieve than from db, shared state</td>
      <td>
        <a href="https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed?view=aspnetcore-9.0">IDistributedCache</a>, 
        <a href="https://redis.io/docs/latest/develop/clients/dotnet/">Redis</a>
      </td>
    </tr>
    <tr>
      <td>Output Caching</td>
      <td>Single-server</td>
      <td>for get and head, fast data retrieve </td>
      <td>
        <a href="https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output?view=aspnetcore-9.0">Middleware</a>
      </td>
    </tr>
    <tr>
      <td>Response Caching</td>
      <td>Single-server</td>
      <td>Reduce server calls, data are cached on client side or proxy, id depends on configuration</td>
      <td>
        <a href="https://learn.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-9.0">Options</a>
        <a href="https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware?view=aspnetcore-9.0">Middleware</a>
      </td>
    </tr>
    <tr>
      <td>Query Caching</td>
      <td>Single-server</td>
      <td>Cache db query results</td>
      <td>
        <a href="https://entityframework-classic.net/query-cache">Entity Framework Core Plus</a>
        <a href="https://github.com/VahidN/EFCoreSecondLevelCacheInterceptor">EF Core Second Level Cache Interceptor</a>
      </td>
    </tr>
    <tr>
      <td>Hybrid Caching</td>
      <td>Multi-server</td>
      <td>For example when we use Cache-Aside pattern with Redis, we have Faster data retrieve and shared state</td>
      <td>
        <a href="https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside">Cache-Aside pattern</a>
      </td>
    </tr>
  </tbody>
</table>
