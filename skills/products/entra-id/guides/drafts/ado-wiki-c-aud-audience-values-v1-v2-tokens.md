---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - aud (audience) values changes based on the token version"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/LAB%20-%20aud%20%28audience%29%20values%20changes%20based%20on%20the%20token%20version"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - aud (audience) values changes based on the token version

**Author: Vandana Appaswami**

## Key Concept

The `aud` claim identifies the intended audience of the token. The audience format in access tokens depends on which endpoint was used and the token version supported by the Web API application (`requestedAccessTokenVersion` in app manifest):

| Token Version | aud Claim Format | Example |
|---|---|---|
| **v2.0 token** | Client ID of the Web API (GUID) | `9165d180-dfa8-47c2-b699-8d94f519da41` |
| **v1.0 token** | AppID URI of the Web API | `api://{ApplicationID}` or domain-based URI |

**Rule**: Before validating claims, the resource application (Web API) must always verify the `aud` claim matches its own identifier.

## Lab Steps to Observe aud Differences

### 1. Register Client App and Web API App

1. Log in to Entra portal → App registrations → New registration
2. Register a **Client application** (get its Application ID)
3. Register a **Web API application** (get its Application ID)
4. In the Web API app → **Expose an API** → Set Application ID URI → Save

### 2. Configure Permissions

- In the Web API app → Expose an API → Add a scope
- In the Client app → API permissions → Add the Web API permission → Grant admin consent
- In the Client app → Certificates and secrets → Create a client secret

### 3. Get v2.0 Token (aud = GUID)

In the Web API app manifest, set `requestedAccessTokenVersion` to `2`:
```json
"requestedAccessTokenVersion": 2
```

Use Insomnia/Postman with Client Credentials flow to get an access token. Decode at jwt.ms → `aud` will be the **GUID** of the Web API app.

### 4. Get v1.0 Token (aud = appID URI)

In the Web API app manifest, set `requestedAccessTokenVersion` to `1` (or `null`):
```json
"requestedAccessTokenVersion": 1
```

Request a new access token. Decode at jwt.ms → `aud` will be in **`api://AppID`** format.

## Troubleshooting: Token Validation Failures Due to Wrong aud

**Symptom**: Web API returns 401 Unauthorized with "audience validation failed"

**Common causes**:
1. Web API validates for `api://appid` format but receives GUID (v2 token) → ensure `requestedAccessTokenVersion` matches API validation logic
2. Client requests token with wrong scope format → use `api://{appId}/.default` for v1-style, or the exposed scope URI for v2-style
3. API validates against Microsoft Graph audience (`https://graph.microsoft.com`) instead of its own app ID URI

## References

- [Microsoft identity platform access tokens](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens)
- [requestedAccessTokenVersion in app manifest](https://learn.microsoft.com/en-us/entra/identity-platform/reference-app-manifest#requestedaccesstokenversion-attribute)
