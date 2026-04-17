---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID Troubleshooting/How to ADD ADFS as a Custom OIDC IDP in Entra External ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20Troubleshooting%2FHow%20to%20ADD%20ADFS%20as%20a%20Custom%20OIDC%20IDP%20in%20Entra%20External%20ID"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Add ADFS as Custom OpenID Connect IDP in Entra External ID

## Prerequisites

- An external tenant
- A registered application in the tenant
- A sign-up and sign-in user flow

## Redirect URIs

Populate the following redirect URIs for your identity provider:
- `https://<tenant-subdomain>.ciamlogin.com/<tenant-ID>/federation/oauth2`
- `https://<tenant-subdomain>.ciamlogin.com/<tenant-subdomain>.onmicrosoft.com/federation/oauth2`

## ADFS Configuration Steps

1. In ADFS Console, right-click Application Group -> Add Application Group
2. Choose "Server application accessing a Web API", give it a name
3. Configure Reply URLs with the redirect URIs above
4. Copy the Client Identifier
5. Generate a shared secret
6. Paste Client Identifier as audience, click Add
7. Select "Permit everyone" for access control
8. Configure Application Permissions: select scope names (allatclaims, openid)
9. Review and create

## Federation Settings Required

- **Well-known endpoint** (OIDC discovery URI)
- **Issuer URI**
- **Client ID** and **Client Secret**
- **Client Authentication Method**: `client_secret_post`, `client_secret_jwt`, or `private_key_jwt` (NOT `client_secret_basic`)
- **Scope**: e.g., `openid profile`
- **Response Type**: must be `code` (id_token and token not supported)
- **Claims mapping**: Sub, Name, Given name, Family name, Email (required), Email_verified, Phone number, etc.

## Entra Admin Center Configuration

1. Sign in to Microsoft Entra admin center as External Identity Provider Administrator
2. Navigate to Identity > External Identities > All identity providers
3. Select Custom tab > Add new > Open ID Connect
4. Enter display name, well-known endpoint, issuer URI, client ID/secret, scope, response type
5. Configure claims mapping
6. Add OIDC identity provider to a user flow

> **Note**: Microsoft recommends OAuth 2.0 Authorization code flow (with PKCE), not implicit grant or ROPC flow.
