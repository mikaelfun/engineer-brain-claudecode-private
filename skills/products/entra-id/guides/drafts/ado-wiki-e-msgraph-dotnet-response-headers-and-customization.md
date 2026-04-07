---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/DotNet/MS Graph Client DotNet Response Headers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FDotNet%2FMS%20Graph%20Client%20DotNet%20Response%20Headers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MS Graph .NET SDK - Response Headers & GraphServiceClient Customization

## Get Response Headers from GraphClient

```csharp
var nativeResponseHandler = new NativeResponseHandler();
await graphClient.Me.GetAsync(requestConfiguration =>
    requestConfiguration.Options.Add(new ResponseHandlerOption()
    {
        ResponseHandler = nativeResponseHandler
    }));

var responseMessage = nativeResponseHandler.Value as HttpResponseMessage;
responseMessage.Headers.TryGetValues("x-ms-client-request-id", out var values);
string clientRequestId = values.FirstOrDefault();
```

## Add Custom Client-Request-ID

Useful for tracking specific requests in MS Graph logs:

```csharp
var msGraphRequestGuid = Guid.NewGuid().ToString();
Console.WriteLine($"{DateTime.UtcNow} DEBUG Ms Graph Request {msGraphRequestGuid}");

var graphResult = await graphClient.Me.GetAsync((requestConfiguration) =>
{
    requestConfiguration.Headers.Add("client-request-id", msGraphRequestGuid);
});
```

## Get Headers from ODataError Exceptions

```csharp
try
{
    User me = await graphClient.Me.GetAsync();
}
catch (Microsoft.Graph.Models.ODataErrors.ODataError ex)
{
    var message = new StringBuilder();
    foreach (var header in ex.ResponseHeaders)
    {
        message.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
    }
    Console.WriteLine(message.ToString());
}
```

## Customize GraphServiceClient

### Set Beta Endpoint
```csharp
var graphClient = new GraphServiceClient(authProvider) { BaseUrl = "https://graph.microsoft.com/beta" };
```

### Set US Government Endpoint
```csharp
var graphClient = new GraphServiceClient(authProvider) { BaseUrl = "https://graph.microsoft.us/beta" };
```

### Set Specific Tenant for Partner Scenarios
```csharp
var graphClient = new GraphServiceClient(authProvider)
{
    BaseUrl = "https://graph.microsoft.com/v1.0/{tenant-id}"
};
```

### Set Custom HttpClient with Proxy
```csharp
var handler = new HttpClientHandler
{
    Proxy = new WebProxy("http://localhost:8888"),
    UseProxy = true
};
var httpClient = new HttpClient(handler) { Timeout = TimeSpan.FromMinutes(5) };
httpClient.DefaultRequestHeaders.Add("Client-Request-ID", Guid.NewGuid().ToString());
var graphClient = new GraphServiceClient(httpClient, authProvider);
```
