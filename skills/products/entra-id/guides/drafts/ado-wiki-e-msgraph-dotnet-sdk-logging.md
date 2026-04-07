---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/DotNet/SDK Logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FDotNet%2FSDK%20Logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MS Graph .NET SDK Logging

Two methods to enable request/response logging in MS Graph .NET SDK.

## Method A: Custom LoggingHandler

### Step 1: Implement DelegatingHandler

```csharp
public class LoggingHandler : DelegatingHandler
{
    private readonly ILogger<LoggingHandler> _logger;

    public LoggingHandler(ILogger<LoggingHandler> logger) { _logger = logger; }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage httpRequest, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Sending Graph request", httpRequest);
        HttpResponseMessage response = await base.SendAsync(httpRequest, cancellationToken);
        _logger.LogInformation("Received Graph response", response);
        return response;
    }
}
```

> Important: If your handler throws an exception, drain the response body to release the connection:
> `if (response.Content != null) await response.Content.ReadAsByteArrayAsync();`

### Step 2: Add Handler to GraphServiceClient

```csharp
var authProvider = new AzureIdentityAuthenticationProvider(clientSecretCredential, scopes);
var handlers = GraphClientFactory.CreateDefaultHandlers();
handlers.Add(new LoggingHandler());
var httpClient = GraphClientFactory.Create(handlers);
GraphServiceClient graphServiceClient = new GraphServiceClient(httpClient, authProvider);
```

## Method B: OpenTelemetry HttpClient Instrumentation

### Step 1: Install Package
```shell
dotnet add package OpenTelemetry.Instrumentation.Http
dotnet add package OpenTelemetry.Exporter.Console
```

### Step 2: Enable Instrumentation
```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddHttpClientInstrumentation()
    .AddConsoleExporter()
    .Build();
```

### Step 3 (Optional): Filter to Graph-only Requests
```csharp
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddHttpClientInstrumentation(options =>
        options.Filter = (httpRequestMessage) =>
            httpRequestMessage.RequestUri.Host.Equals("graph.microsoft.com"))
    .AddConsoleExporter()
    .Build();
```

### Step 4 (Optional): Enrich Telemetry
```csharp
options.Enrich = (activity, eventName, rawObject) =>
{
    switch (eventName)
    {
        case "OnStartActivity":
            if (rawObject is HttpRequestMessage request)
                activity.SetTag("httpVersion", request.Version);
            break;
        case "OnStopActivity":
            if (rawObject is HttpResponseMessage response)
                activity.SetTag("responseVersion", response.Version);
            break;
        case "OnException":
            if (rawObject is Exception exception)
                activity.SetTag("stackTrace", exception.StackTrace);
            break;
    }
};
```

## Reference
- Code sample: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/users-groups-entra-apis/enable-logging-for-msal-microsoft-graph
