# Customize Middleware Authentication Ticket to Extend User Sign-in Duration

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/customize-authentication-session-expiration)

## Scenario

By default, Microsoft Entra ID tokens (ID tokens, access tokens, SAML tokens) expire after 1 hour. ASP.NET/ASP.NET Core middleware ties authentication ticket to token lifetime, causing frequent re-authentication redirects.

This also helps resolve AJAX-related CORS errors to login.microsoftonline.com when the app serves as both web app and web API.

## Solution: ASP.NET (OWIN)

```csharp
app.UseCookieAuthentication(new CookieAuthenticationOptions()
{
  CookieManager = new Microsoft.Owin.Host.SystemWeb.SystemWebChunkingCookieManager(),
  Provider = new CookieAuthenticationProvider()
  {
    OnResponseSignIn = (context) =>
    {
      context.Properties.ExpiresUtc = DateTimeOffset.UtcNow.AddHours(12);
    }
  }
});

// Decouple token lifetime:
app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
{
    UseTokenLifetime = false,
    // ...
});
```

## Solution: ASP.NET Core

Key steps:
1. Set `UseTokenLifetime = false`
2. Hook `OnTokenValidated` to set custom expiry

```csharp
services.Configure<OpenIdConnectOptions>(AzureADDefaults.OpenIdScheme, options =>
{
    options.UseTokenLifetime = false;
    var onTokenValidated = options.Events.OnTokenValidated;
    options.Events ??= new OpenIdConnectEvents();
    options.Events.OnTokenValidated = async context =>
    {
        await onTokenValidated(context);
        context.Properties.ExpiresUtc = DateTimeOffset.UtcNow.AddHours(12);
    };
});
```

Works with:
- `AddAzureAD` / `AddMicrosoftIdentityWebApp` / custom `OpenIdConnectOptions` / WS-Fed

## Warning

If you extend ticket expiration, users may retain access even after being deleted/disabled in Entra ID until the ticket expires.
