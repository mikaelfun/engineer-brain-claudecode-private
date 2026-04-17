---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - using JWT.ms for SaaS OAuth2.0 testing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/LAB%20-%20using%20JWT.ms%20for%20SaaS%20OAuth2.0%20testing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - Using JWT.ms for SaaS OAuth2.0 Testing

## What is JWT.ms?

JWT.ms is a web-based JWT decoder tool at https://jwt.ms that decodes encoded JWT tokens and displays their contents in clear text. Useful for testing and troubleshooting:
- Custom OAuth/OIDC token claims issuance
- Optional claims configuration
- Token audience (aud) values
- Token lifetime policies

## Setup: Register JWT.ms App in Entra ID

### 1. App Registration

1. Azure AD portal → **App registrations** → **New registration**
2. Name: (e.g., `JWT-Test-App`)
3. Supported account types: Single tenant
4. **Redirect URI**: Web → `https://jwt.ms`
5. Click **Register**

### 2. Enable Implicit Grant (for browser-based testing)

App → **Authentication** → Enable both:
- ✅ Access tokens (used for implicit flows)
- ✅ ID tokens (used for implicit and hybrid flows)

Also enable: Allow public client flows (Yes)

### 3. Configure Optional Claims (example)

App → **Token configuration** → **Add optional claim** → ID token:
- Select: `ctry`, `family_name`, `given_name`
- Enable "Turn on the Microsoft Graph profile permissions" when prompted
- Grant admin consent for the added permissions

### 4. Grant API Permissions

App → **API permissions** → grant admin consent

## Building the Authorization URL

### ID Token URL Template
```
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize
  ?client_id={appId}
  &nonce=defaultNonce
  &redirect_uri=https%3A%2F%2Fjwt.ms
  &scope=openid+profile+User.read
  &response_type=id_token
  &prompt=login
```

### Access Token URL Template
Change `response_type=id_token` to `response_type=token` and update scope to your API.

## Configuring JWT App as Both Client AND Resource (for Access Token Optional Claims)

To see optional claims in **access tokens** (not just ID tokens), the token audience must be your app's own ID URI:

### 1. Expose the API

App → **Expose an API** → Add Scope (e.g., `AT.Read`) → Save

### 2. Add API Permission to Self

App → **API permissions** → Add permission → My APIs → select your JWT app → select the exposed scope → Grant admin consent

### 3. Update Access Token URL

Replace `scope` in the URL with the exposed scope URI:
```
...&scope=https://yourdomain.com/AT.Read&response_type=token
```

After authentication, the access token `aud` claim will be your Application ID URI (not Microsoft Graph).

## Key Concepts

| Scenario | aud Value | Optional Claims in Access Token? |
|---|---|---|
| scope=User.read (MS Graph) | `https://graph.microsoft.com` | ❌ No (audience is Graph, not your app) |
| scope=api://yourAppId/.default | Your app's GUID or appID URI | ✅ Yes |

**Why change aud?** Optional claims and token lifetime policies are applied per application. Access token audience must be your application (not Graph) for those settings to take effect.

## Saving the URL

Save your built URL as a browser bookmark or add to the App's **Branding** → Home Page URL for easy access from MyApps portal.
