---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/DotNet/DotNet Using HTTP Client"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FDotNet%2FDotNet%20Using%20HTTP%20Client"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using raw HttpClient for OAuth token acquisition

## Set access token to Authorization header

```csharp
HttpClient httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", msalAuthenticationResult.AccessToken);
HttpResponseMessage response = httpClient.GetAsync("https://app.domain.com").Result;
```

## Acquire token using Client Credentials (raw HTTP)

```csharp
var authority = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token";
using (var client = new HttpClient())
{
    var result = await client.PostAsync(new Uri(authority), new FormUrlEncodedContent(new[]
    {
        new KeyValuePair<string, string>("client_id", clientId),
        new KeyValuePair<string, string>("client_secret", clientSecret),
        new KeyValuePair<string, string>("grant_type", "client_credentials"),
        new KeyValuePair<string, string>("scope", $"{resourceId}/.default"),
    }));
    var content = await result.Content.ReadAsStringAsync();
    return JsonConvert.DeserializeObject<OAuthResult>(content);
}
```

## OAuth flow references

* ROPC: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth-ropc
* Client Credentials: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
* OBO: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow
* Refresh Token: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#refresh-the-access-token
