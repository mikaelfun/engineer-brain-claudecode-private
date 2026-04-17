---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - Understanding \u2018prompt=consent\u2019 in OAuth Request"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20Understanding%20%E2%80%98prompt%3Dconsent%E2%80%99%20in%20OAuth%20Request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding `prompt=consent` in OAuth Request

## What is `prompt=consent`?

When developers include `prompt=consent` in an OAuth authorization request, the consent dialog is **always triggered** — even if the user has already consented or admin consent has been granted.

Reference: [Send "Prompt" in the sign-in request](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-implicit-grant-flow#send-the-sign-in-request)

## Lab Steps

### 1. Register an Application

- In Entra portal → App Registrations → New registration
- Supported account types: Accounts in this organizational directory only
- Redirect URI: Web → `https://jwt.ms`
- Under Authentication: enable **Access tokens** and **ID tokens** (Implicit grant flow)
- Grant admin consent for initial setup (API Permissions → Grant admin consent)

### 2. Construct Test URLs

#### Without `prompt=consent` (no consent dialog if already consented)
```
https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
?client_id={client-id}
&nonce=defaultNonce
&redirect_uri=https://jwt.ms
&scope=openid+profile+User.read
&response_type=id_token
```

#### With `prompt=consent` (always shows consent dialog)
```
https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
?client_id={client-id}
&nonce=defaultNonce
&redirect_uri=https://jwt.ms
&scope=openid+profile+User.read
&response_type=id_token
&prompt=consent
```

### 3. Check in Fiddler Trace

Look for requests to `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize`

In Fiddler → select the request → **WebForms tab** → verify `prompt=consent` appears in the parameter list.

## Key Takeaways

- `prompt=consent` forces consent even when previously granted
- Useful for testing consent flows or when an app needs to refresh permissions
- Common source of confusion when developers include it unintentionally — users keep seeing consent prompts repeatedly
