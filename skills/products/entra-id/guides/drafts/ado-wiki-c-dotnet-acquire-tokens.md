---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet Acquire Tokens"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20Acquire%20Tokens"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to acquire tokens when using .NET

## Using MSAL

* Acquire token from cache (or using Refresh token): https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/acquiretokensilentasync-api
* Acquire token interactively (Authorization Code flow + PKCE): https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/acquiring-tokens-interactively
* Acquire token using Client Credentials: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/client-credential-flows
* Acquire token using OBO: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/on-behalf-of-flow
* Acquire token using ROPC: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/username-password-authentication
* Acquire token using IWA: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/integrated-windows-authentication
* Acquire token using WAM (Broker): https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/wam
* Acquire Token using device code flow: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/device-code-flow
* Acquire token for Managed Identity/Federated workload ID: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/web-apps-apis/workload-identity-federation
* Acquire token with B2C: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/social-identities
* Acquire token with AD FS: https://learn.microsoft.com/en-us/entra/msal/dotnet/acquiring-tokens/desktop-mobile/adfs-support

## Using Azure Identity SDK

```csharp
using Azure.Identity;
using Azure.Core;
var AzureCredentials = new DefaultAzureCredential();
var TokenRequest = new TokenRequestContext(new string[] { "https://management.azure.com/.default" });
var TokenResult = await AzureCredentials.GetTokenAsync(TokenRequest);
String AccessToken = TokenResult.Token;
```
Reference: https://learn.microsoft.com/en-us/dotnet/api/overview/azure/identity-readme

## Using Microsoft Identity Web (ASP.NET Core)

Add `.EnableTokenAcquisitionToCallDownstreamApi()` then inject `ITokenAcquisition`:

```csharp
services.AddMicrosoftIdentityWebAppAuthentication(Configuration)
    .EnableTokenAcquisitionToCallDownstreamApi(new string[] { scopesToRequest })
    .AddInMemoryTokenCaches();
```

In controllers:
```csharp
var result = await _tokenAcquisition.GetAuthenticationResultForUserAsync(_graphScopes);
```

Outside controllers:
```csharp
var _tokenAcquisition = HttpContext.RequestServices.GetRequiredService<ITokenAcquisition>();
string token = await _tokenAcquisition.GetAccessTokenForAppAsync("https://graph.microsoft.com/.default", tenant: "tenantId");
```

## Using Microsoft Identity Web (ASP.NET OWIN)

Reference: https://github.com/AzureAD/microsoft-identity-web/wiki/v2.0

## Using HttpClient (ROPC Flow)

Raw HTTP POST to token endpoint with FormUrlEncodedContent containing resource, client_id, grant_type=password, username, password, scope.

## Using PowerShell (Managed Identity)

Use `$env:IDENTITY_ENDPOINT` with `X-Identity-Header` for system-assigned managed identity token acquisition.
