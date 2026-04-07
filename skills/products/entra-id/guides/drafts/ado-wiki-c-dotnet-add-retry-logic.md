---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet Add Retry logic"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20Add%20Retry%20logic"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Create a retry handler for .NET MS Graph SDK / MSAL

## Create the RetryHandler (DelegatingHandler)

```csharp
public class RetryHandler : DelegatingHandler
{
    private const int MaxRetries = 5;

    public RetryHandler(HttpMessageHandler innerHandler)
        : base(innerHandler) { }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        HttpResponseMessage response = null;
        for (int i = 0; i < MaxRetries; i++)
        {
            response = await base.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode) return response;
            Thread.Sleep(1000 * i); // Incremental backoff
        }
        return response;
    }
}
```

## Add to GraphServiceClient

```csharp
var handlers = GraphClientFactory.CreateDefaultHandlers();
handlers.Add(new RetryHandler());
var httpClient = GraphClientFactory.Create(handlers);
var graphServiceClient = new GraphServiceClient(httpClient);
```

## Add to MSAL (via CustomMsalHttpClientFactory)

Reference: https://learn.microsoft.com/en-us/entra/msal/dotnet/advanced/httpclient

```csharp
var client = new HttpClient(new RetryHandler());
PublicApp = PublicClientApplicationBuilder
    .Create(ClientId)
    .WithRedirectUri(RedirectUri)
    .WithAuthority(Authority)
    .WithHttpClientFactory(new CustomMsalHttpClientFactory(httpClient))
    .Build();
```
