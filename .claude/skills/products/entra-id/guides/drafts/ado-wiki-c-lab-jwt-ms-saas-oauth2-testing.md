---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - using JWT.ms for SaaS OAuth2.0 testing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FLabs%2FLAB%20-%20using%20JWT.ms%20for%20SaaS%20OAuth2.0%20testing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - Using JWT.ms for SaaS OAuth2.0 Testing

## Overview

**JWT.ms** is a web decoder tool ([https://jwt.ms](https://jwt.ms)) that decodes encoded JWT tokens and shows contents in clear text. It is essential for testing and troubleshooting custom OAuth/OIDC token claims issuance and transformations.

## Setup: Register JWT.ms Application

1. Azure AD portal → App Registrations → **New Registration**
2. Name the app (e.g. "JWT-Test"), select account type (single tenant), Redirect URI: **Web** → `https://jwt.ms`
3. After registration, go to **Authentication**:
   - Enable **Implicit grant**: Access tokens ✓, ID tokens ✓
   - Enable **Allow public client flows**
   - Save
4. (Optional) **Token configuration** → Add optional claim for ID token (e.g. `ctry`, `family_name`, `given_name`)
   - Portal will prompt to enable Microsoft Graph profile permissions → Select "Turn on Microsoft Graph profile permissions" → Add
5. **API permissions** → Grant Admin consent
6. **Owners** → Add your Global Admin account

## Getting an ID Token

Build the authorization URL (one line, no spaces):

```
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize
?client_id={appId}
&nonce=defaultNonce
&redirect_uri=https%3A%2F%2Fjwt.ms
&scope=openid+profile+User.read
&response_type=id_token
&prompt=login
```

Browse to the URL → authenticate → redirected to `jwt.ms` with the decoded ID token.
- The `aud` of the ID token will be your JWT app's Application ID.

## Getting an Access Token (for Microsoft Graph)

Replace `response_type=id_token` with `response_type=token` in the URL above. Note: the `aud` will be Microsoft Graph, not your application.

## Getting an Access Token with Custom Application Audience

To get an access token where the `aud` is your own application (enabling optional claims and token lifetime policies in the access token):

### Step 1: Expose an API

- App registration → **Expose an API** → Add a scope (e.g. `AT.Read`)

### Step 2: Add the API to API Permissions

- API Permissions → Add permission → My APIs → find your JWT app → add the exposed scope → Grant Admin consent

### Step 3: Update the Authorization URL

- In API Permissions, click the permission → copy the scope URL
- Replace the `scope` parameter in the URL with the copied scope URL
- Set `response_type=token`

```
Example: &scope=https://yourdomain.com/AT.Read&response_type=token
```

After requesting, the decoded access token should show:
- `aud` = your Application ID URI
- Any optional claims configured for access tokens on your application

## Key Concepts

| Scenario | aud Value |
|---|---|
| ID token | Application (Client) ID |
| Access token for Graph | `https://graph.microsoft.com` |
| Access token for custom API (v2) | Client ID GUID of the Web API |
| Access token for custom API (v1) | `api://{ApplicationID}` URI |

**Why change the access token audience?**
- To apply optional claims (configured on the resource app) to the access token
- To apply token lifetime policies to the access token
- Optional claims appear in the ID token by default; to include in access token, the aud must match the resource app

## Related Links

- [JWT.ms Web Tool](https://jwt.ms)
- [aud values lab guide](ado-wiki-c-lab-aud-audience-values-token-version.md)
