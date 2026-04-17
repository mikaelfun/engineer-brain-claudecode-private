---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/AspNet AspNetCore/HttpContext vs IHttpContextAccessor"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FAspNet%20AspNetCore%2FHttpContext%20vs%20IHttpContextAccessor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# When to use HttpContext vs IHttpContextAccessor

## Overview

- **HttpContext**: the actual request context for this HTTP request.
- **IHttpContextAccessor**: a DI service that lets you access HttpContext when you normally wouldn't have it.

Rule: If your class already receives HttpContext, use it directly. If not, use IHttpContextAccessor.

## HttpContext (preferred)

Use HttpContext directly when inside the ASP.NET Core request pipeline:
- API controllers
- MVC controllers
- Razor PageModels
- Minimal API handlers
- Middleware (Invoke/InvokeAsync receives HttpContext)
- Filters (ActionFilter, AuthorizationFilter, etc.)
- SignalR hubs
- gRPC services

```csharp
var header = HttpContext.Request.Headers["Authorization"];
```

**Why preferred**: No DI needed, no AsyncLocal overhead, cleaner, faster, more testable.

**When NOT to use**: Singleton services, background workers, hosted services, repositories, service layers, utility/helper classes.

## IHttpContextAccessor

Use only when outside the request pipeline but still need request context:
- Background services needing user info or correlation IDs
- Logging components needing request metadata
- Authorization handlers
- Custom services needing headers or claims
- Telemetry enrichers
- Middleware registered before routing

```csharp
public class MyService
{
    private readonly IHttpContextAccessor _accessor;

    public MyService(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public string? GetCorrelationId()
    {
        return _accessor.HttpContext?.Request.Headers["Authorization"];
    }
}
```

**Why not preferred everywhere**: Uses AsyncLocal (small overhead), encourages leaking HttpContext into layers that shouldn't depend on it, makes unit testing harder.
