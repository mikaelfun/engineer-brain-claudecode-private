---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/DotNet/DotNet Custom Authentication Provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FDotNet%2FDotNet%20Custom%20Authentication%20Provider"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Create a Custom Authentication Provider for MS Graph SDK (.NET)

## Overview

When the out-of-the-box authentication providers from Microsoft Graph SDK don't fit your needs, you can create a custom one by extending `IAccessTokenProvider` from Kiota.

Reference: https://learn.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=csharp
Reference: https://learn.microsoft.com/en-us/openapi/kiota/authentication?tabs=csharp

## Custom Authentication Provider Implementation

Extend `IAccessTokenProvider` and implement `GetAuthorizationTokenAsync`:

```csharp
using Microsoft.Identity.Client;
using Microsoft.Kiota.Abstractions.Authentication;

public class CustomTokenProvider : IAccessTokenProvider
{
    private readonly IPublicClientApplication _pca;
    private readonly string _accessToken;

    public CustomTokenProvider(IPublicClientApplication pca)
    {
        _pca = pca;
        AllowedHostsValidator = new AllowedHostsValidator();
    }

    public CustomTokenProvider(string accessToken)
    {
        _accessToken = accessToken;
        AllowedHostsValidator = new AllowedHostsValidator();
    }

    public AllowedHostsValidator AllowedHostsValidator { get; }

    public async Task<string> GetAuthorizationTokenAsync(
        Uri uri,
        Dictionary<string, object> additionalAuthenticationContext = null,
        CancellationToken cancellationToken = default)
    {
        if (_accessToken != String.Empty)
            return _accessToken;

        var accounts = await _pca.GetAccountsAsync();
        var account = accounts.FirstOrDefault();
        string[] scopes = new[] { "User.Read" };

        try
        {
            var result = await _pca.AcquireTokenSilent(scopes, account)
                .ExecuteAsync(cancellationToken);
            return result.AccessToken;
        }
        catch (Exception)
        {
            var result = await _pca.AcquireTokenInteractive(scopes)
                .WithAccount(account)
                .ExecuteAsync(cancellationToken);
            return result.AccessToken;
        }
    }
}
```

## Initialize GraphServiceClient

```csharp
var pca = PublicClientApplicationBuilder.Create("your-client-id")
    .WithRedirectUri("http://localhost")
    .Build();

var authProvider = new BaseBearerTokenAuthenticationProvider(new CustomTokenProvider(pca));
var graphClient = new GraphServiceClient(authProvider);
```
