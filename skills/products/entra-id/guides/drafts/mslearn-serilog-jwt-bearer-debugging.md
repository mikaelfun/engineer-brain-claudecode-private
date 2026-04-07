# Serilog JwtBearer Event Debugging for Entra ID Protected Web APIs

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/serilog-protected-web-api-authentication-authorization-errors)

## When to Use

When a .NET 6+ Web API protected by Microsoft Entra ID returns 401 Unauthorized and you need to see the detailed JwtBearer event flow (token validation, authentication failures, challenge events).

## Setup

1. Add Serilog NuGet packages to your Web API project
2. Configure `appsettings.json` with Serilog settings:
   - Set `Microsoft` override to `Debug` level
   - Configure file and console sinks
3. Set `IdentityModelEventSource.ShowPII = true` to see full token details in logs

## Key JwtBearer Events to Log

| Event | Purpose |
|-------|---------|
| `OnTokenValidated` | Confirms token passed validation; log the security token |
| `OnMessageReceived` | Shows incoming Authorization header; detect missing Bearer token |
| `OnAuthenticationFailed` | Captures the exception causing 401; most diagnostic value |
| `OnChallenge` | Fires when authentication is challenged |
| `OnForbidden` | Fires on 403 Forbidden |

## Configuration Example

```csharp
builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidAudiences = new List<string> { "api://<client-id>", "<client-id>" },
        ValidIssuers = new List<string> {
            "https://sts.windows.net/<tenant-id>/",
            "https://login.microsoftonline.com/<tenant-id>/v2.0"
        }
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = ctx => { Log.Error($"Auth failed: {ctx.Exception}"); ... },
        OnTokenValidated = ctx => { Log.Information($"Token: {ctx.SecurityToken}"); ... },
        // ... other events
    };
});
```

## Common Findings

- Missing or wrong `ValidAudiences` → token audience mismatch
- Missing or wrong `ValidIssuers` → issuer validation failure
- Expired signing key → signature validation error
- No Bearer token in Authorization header → no token received

## 21V (Mooncake) Notes

- Replace `login.microsoftonline.com` with `login.partner.microsoftonline.cn`
- Replace `sts.windows.net` with `sts.chinacloudapi.cn`
