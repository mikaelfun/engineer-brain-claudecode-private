---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - aud (audience) values changes based on the token version"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FLabs%2FLAB%20-%20aud%20%28audience%29%20values%20changes%20based%20on%20the%20token%20version"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - aud (audience) Values Changes Based on Token Version

> **Compliance note**: This wiki contains test/lab data only.
> **Author**: Vandana Appaswami

## Overview

The `aud` claim identifies the intended audience of a token. Applications validating access tokens must always verify the `aud` value matches the expected resource (Web API).

**The `aud` value differs by token version:**

| Token Version | `aud` Value Format |
|---|---|
| **v2.0** | Client ID of the Web API (GUID, e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) |
| **v1.0** | AppID URI declared in the Web API (e.g. `api://{ApplicationID}` or domain-based name) |

## How to Control Token Version

Set `requestedAccessTokenVersion` in the **Application Manifest** of the Web API application:
- `requestedAccessTokenVersion: 2` → V2 token (aud = GUID)
- `requestedAccessTokenVersion: 1` → V1 token (aud = api://AppID URI)

## Lab Steps

### 1. Register Client Application

- Navigate to Entra ID → App Registration → New Registration
- Set Redirect URI to `https://jwt.ms` (Web type)
- Copy the Application (Client) ID

### 2. Register Web API Application

- Register a second application (the resource/Web API)
- Navigate to **Expose an API** → Set the Application ID URI (default: `api://{AppID}`)

### 3. Add API Permissions to Client App

- In the client app → API Permissions → Add permission → My APIs → select the Web API
- Grant Admin consent

### 4. Create Client Secret

- Client app → Certificates & Secrets → New client secret
- Copy and store the secret value immediately (not shown again)

### 5. Getting the V2.0 Token

1. In the Web API app **Manifest**, set `requestedAccessTokenVersion: 2`
2. Use Insomnia (Client Credentials flow) to get an access token targeting the Web API
3. Decode the token at `jwt.ms` → **aud** claim will be the **GUID** of the Web API

### 6. Getting the V1.0 Token

1. In the Web API app **Manifest**, set `requestedAccessTokenVersion: 1`
2. Re-request token using Client Credentials flow
3. Decode at `jwt.ms` → **aud** claim will be in **`api://{AppID}`** URI format

## Troubleshooting: Wrong aud Value

If the application is rejecting the token due to an unexpected `aud` value:

1. Decode the token at [jwt.ms](https://jwt.ms) and check the `aud` claim
2. Compare with `requestedAccessTokenVersion` in the Web API manifest
3. If `aud` is a GUID but the app expects `api://` URI format → change manifest to `requestedAccessTokenVersion: 1`
4. If `aud` is `api://` URI but app expects GUID → change manifest to `requestedAccessTokenVersion: 2`

## Key Reference

- For **optional claims** and **token lifetime policies** to apply: the `aud` of the access token must match the application where the policy/claims are configured.
  - Optional claims configured on the resource app only appear in the access token if the access token audience is that resource app.

## Related Links

- [Learning OAuth flows through Azure AD, Insomnia, and Fiddler](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/610705/Learning-OAuth-flows-through-Azure-AD-Insomnia-and-Fiddler)
