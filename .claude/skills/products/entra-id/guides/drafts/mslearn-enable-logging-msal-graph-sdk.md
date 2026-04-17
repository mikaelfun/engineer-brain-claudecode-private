# How to Enable Logging for MSAL.NET and Microsoft Graph SDK

source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/users-groups-entra-apis/enable-logging-for-msal-microsoft-graph

## Overview

When debugging Microsoft Graph API or MSAL authentication issues, enabling detailed HTTP request/response logging can reveal root causes. This guide covers two logging approaches.

## MSAL.NET Logging

- Use `.WithLogging()` on `PublicClientApplicationBuilder` to enable MSAL verbose logging
- Logs can be written to Azure Blob Storage using the Azure Blob Storage client SDK (v12)

```csharp
IPublicClientApplication app = PublicClientApplicationBuilder
    .Create(ClientId)
    .WithTenantId(TenantId)
    .WithLogging(MSALlogger, Microsoft.Identity.Client.LogLevel.Verbose, true)
    .WithRedirectUri("http://localhost")
    .Build();
```

## Microsoft Graph SDK Logging

- Implement a custom `DelegatingHandler` (HttpClient Message Handler) to intercept all HTTP requests/responses
- Use Serilog with sinks for console, file, and/or Azure Blob Storage
- Inject the handler into `GraphClientFactory.Create(handlers)`

```csharp
// Custom logging handler
public class SeriLoggingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage httpRequest, CancellationToken cancellationToken)
    {
        Log.Information("sending Graph Request");
        Log.Debug(GetRequestHeader(httpRequest));
        Log.Debug(GetRequestBody(httpRequest));
        var response = await base.SendAsync(httpRequest, cancellationToken);
        Log.Information("Receiving Response:");
        Log.Debug(GetResponseHeader(response));
        Log.Debug(GetResponseBody(response));
        return response;
    }
}
```

## Prerequisites

1. Register app in Entra ID with redirect URI `http://localhost` (Mobile and desktop platform)
2. Add delegated permissions: `User.Read.All`, `Application.ReadWrite.All`
3. Grant admin consent
4. Create Azure Storage account for storing logs

## Caution

Logs may contain PII and access tokens. Handle with care.

## Sample Code

Full sample: https://github.com/bachoang/MSGraphLoggingSample
