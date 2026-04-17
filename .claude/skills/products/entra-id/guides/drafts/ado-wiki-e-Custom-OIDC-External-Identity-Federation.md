---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Custom OIDC External Identity Federation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29%2FEntra%20External%20ID%20for%20Customers%20%28CIAM%29%20-%20Custom%20OIDC%20External%20Identity%20Federation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom OIDC External Identity Federation for Entra External ID

## Feature Overview

Entra External ID supports custom OpenID Connect (OIDC) identity provider federation. Allows customers to sign in with their own OIDC identity providers.

## Update 3/11/2026: Entra ID as Custom OIDC Identity Provider

Starting **April 2026**, Microsoft Entra External ID supports Entra ID as a Custom OIDC Identity Provider. Previously this was blocked.

- Configuring Entra ID as a Custom **SAML** IdP is **NOT** supported.
- Only OIDC federation is supported for Entra ID tenants.

## Prerequisites

- An external tenant
- A sign-up and sign-in user flow
- (For Entra ID as IdP) A Microsoft Entra ID tenant + registered application

## Configuration Details

- **Display name**: Shown to users during sign-in/sign-up
- **Well-known endpoint**: OIDC discovery URI
- **OpenID Issuer URI**: Entity issuing access tokens (case-sensitive)
- **Client ID** and **Client Secret**: Application identifiers
- **Client Authentication**: `client_secret` or `private_key_jwt` (NOT `client_secret_basic`)
- **Scope**: Must include `openid`
- **Response type**: Only `code` is supported

## OIDC Claims Mapping

| OIDC Claim | User Flow Attribute | Description |
|---|---|---|
| sub | N/A | Subject identifier |
| name | Display Name | Full name |
| given_name | First Name | Given name |
| family_name | Last Name | Surname |
| email | Email | Email address (required) |
| email_verified | N/A | Email verification status |
| address | - | Postal address (JSON) |
