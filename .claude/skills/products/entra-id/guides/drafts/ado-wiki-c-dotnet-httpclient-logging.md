---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet HttpClient Logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20HttpClient%20Logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HTTP Logging for Graph SDK and MSAL .NET

Microsoft Graph SDK does not have out-of-box logging. Implement custom DelegatingHandler.

## LoggingHandler (DelegatingHandler)

```csharp
public class LoggingHandler : DelegatingHandler
{
    public LoggingHandler(HttpMessageHandler innerHandler) : base(innerHandler) { }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        String guid = Guid.NewGuid().ToString();
        request.Headers.Add("client-request-id", guid);
        Trace.WriteLine($"{DateTime.UtcNow} client-request-id {guid}");
        Trace.WriteLine($"Request: {request}");
        if (request.Content != null)
            Trace.WriteLine(await request.Content.ReadAsStringAsync());

        Stopwatch sw = new Stopwatch();
        sw.Start();
        HttpResponseMessage response = await base.SendAsync(request, cancellationToken);
        sw.Stop();
        Trace.WriteLine($"took {sw.ElapsedMilliseconds}ms");
        Trace.WriteLine($"Response: {response}");
        if (response.Content != null)
            Trace.WriteLine(await response.Content.ReadAsStringAsync());

        return response;
    }
}
```

## Configure for GraphServiceClient

```csharp
var handlers = GraphClientFactory.CreateDefaultHandlers();
handlers.Add(new LoggingHandler());
// Remove CompressionHandler (required for logging)
var compressionHandler = handlers.Where(h => h is CompressionHandler).FirstOrDefault();
handlers.Remove(compressionHandler);
var httpClient = GraphClientFactory.Create(handlers);
var graphServiceClient = new GraphServiceClient(httpClient);
```

## Configure for MSAL

Reference: https://learn.microsoft.com/en-us/entra/msal/dotnet/advanced/httpclient

## System.Net Tracing (no code changes)

### ASP.NET / .NET Framework
Add `<system.diagnostics>` section to web.config/app.config with System.Net sources at Verbose level.

### ASP.NET Core
In appsettings.json:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "System.Net": "Trace"
    }
  }
}
```
