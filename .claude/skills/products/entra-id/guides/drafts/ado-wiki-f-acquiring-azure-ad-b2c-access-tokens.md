---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/B2C Development/Acquiring Azure AD B2C Access Tokens"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Developer/Supported%20Technologies/B2C%20Development/Acquiring%20Azure%20AD%20B2C%20Access%20Tokens"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Acquiring Azure AD B2C Access Tokens

## About Feature
Access Tokens enable the scenario of one application requesting access and permissions against another application in Azure AD B2C. The permissions are predetermined by the Admin of the Azure B2C tenant.

**Prerequisites**: Engineer needs to understand Azure AD B2C identity token and the redirection flow from authorization server to the IDP.

## Key Concepts

### JWT Access Token Structure
An Access Token is in JWT format with 3 parts: Header, Body, and Signature (separated by ".").

Key claims in B2C Access Token:
- **iss** - Issuer (the B2C tenant authorization server)
- **aud** - Audience (Application ID/Client ID of the Web API)
- **scp** - Scopes (granted permissions, space-separated list)
- **azp** - Authorized Party (Application ID of the Web Application client)
- **exp** / **nbf** - Expiration / Not Before times

### Architecture: Web App to Web API Flow

1. User signs up/signs in via the Authorization endpoint of Azure AD B2C
2. Authorization server issues an authorization code to the client app
3. Client app uses auth code to call Token endpoint for an Access Token (via MSAL - Microsoft.Identity.Client library)
4. Token endpoint provides Access Token (optionally with Refresh Token)
5. Client app calls Web API with Access Token in header, specifying requested scopes
6. Web API validates the Access Token (checks aud claim matches its Client ID)

### Important Notes
- Steps 1-2 are same as identity token flow (handled by OWIN middleware)
- Step 3 requires MSAL library (OWIN cannot do this)
- Requested scopes must be a subset of scopes exposed by the Web API
- Requesting a scope not exposed by the Web API results in an error

## JWT Reference
https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-reference-tokens#types-of-tokens
