---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - Learning OAuth flows through Azure AD, Insomnia, and Fiddler"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FLabs%2FLAB%20-%20Learning%20OAuth%20flows%20through%20Azure%20AD%2C%20Insomnia%2C%20and%20Fiddler"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - OAuth
  - lab
  - Insomnia
  - Fiddler
  - authorization-code
  - client-credentials
  - app-registration
  - learning
---

# LAB — Learning OAuth Flows through Entra ID, Insomnia, and Fiddler

> **Compliance note**: This wiki contains test/lab data only.

[[_TOC_]]

## Purpose

Provide a lab environment to reproduce and visually observe how OAuth flows work in Microsoft Entra ID. Uses Insomnia (REST client) + Fiddler (traffic inspection) instead of Postman (Postman is no longer permitted in Microsoft lab environments).

**Reference**: [Insomnia Application - Starter Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1572199/Insomnia-application-for-use-with-OAuth-Authentication-flows-Starter-Edition)

## Prerequisites

- **Insomnia** application (replaces Postman — see [Postman Security Risks](https://microsoft.sharepoint.com/teams/RiskReductionTeamCentralBurndownWikis/SitePages/Security-Migi.aspx))
- **Fiddler** — [download and install](https://www.telerik.com/download/fiddler)
- An **Entra ID tenant**

---

## Step 1: Install OAuth Flow Collection into Insomnia

1. Download collection: `Azure AD v2.0 Protocols for Training.postman_collection.json` (from wiki attachments)
2. Open Insomnia > Personal Workspace > **Import**
3. The **Azure AD v2.0 Protocols** collection will now appear in Insomnia

---

## Step 2: Create an Insomnia Demo Application in Azure AD (App Registration)

Reference: [Quickstart: Register an app in the Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

1. Go to `portal.azure.com` > **Azure Active Directory** > **App Registrations** > **New registration**
2. Name the application (e.g., "Insomnia Demo")
3. Leave redirect URI blank for now
4. Click **Register**

---

## Step 3: Configure the Application Object

1. Open the registered app in App Registrations
2. **Record**: Client ID and Tenant ID (needed for Insomnia variables)
3. Click **Endpoints** > record the **OAuth 2.0 authorization endpoint (v2)** URL

### Authentication Setup
4. Go to **Authentication** > **Add a platform** > **Web**
5. Enter redirect URI: `http://localhost/myapp/`
6. Check boxes for **Access tokens** and **ID tokens** (for implicit flow testing)
7. Add second redirect URI: `https://oauth.pstmn.io/v1/callback`
8. Click **Configure** then **Save**

### Client Secret
9. Go to **Certificates & secrets** > **New client secret**
10. Add description and expiry, click **Add**
11. **Record** the Client Secret Value immediately (shown only once)

### API Permissions
12. Go to **API permissions** > **Add a permission** > **Microsoft Graph** > **Delegated permissions**
13. Select: `email`, `offline_access`, `openid`, `profile`
14. Click **Add permissions**
15. Optional: **Grant admin consent** (skipping this will show user consent prompt during auth flows)

---

## Step 4: Set Up Variables in Insomnia Client

Reference: [Environment Variables | Insomnia Docs](https://docs.insomnia.rest/insomnia/environment-variables)

1. Open Insomnia > click top section of your collection > click **Environment**
2. Configure variables:
   - `clientId`: Client ID from App Registration
   - `tenantId`: Tenant ID from App Registration
   - `clientSecret`: Client Secret Value
   - `authorizationEndpoint`: OAuth 2.0 authorization endpoint (v2) URL

---

## OAuth Flows Covered

The collection covers the following flows:

| Flow | Description |
|------|-------------|
| **Authorization Code** | Standard flow for user sign-in with redirect |
| **Client Credentials** | App-only token (no user) |
| **Implicit** | Token returned directly from authorization endpoint (deprecated for new apps) |
| **Device Code** | For devices without browser (CLI tools, IoT) |
| **On-Behalf-Of (OBO)** | Service calls another service on behalf of signed-in user |

---

## Fiddler Usage

Use Fiddler to capture and inspect:
- SAML AuthnRequest and Response (for SAML flow comparison)
- OAuth authorization requests and token responses
- Token content (JWT decode from `https://jwt.ms`)

---

## Challenge Exercises

If you receive an AADSTS error during the lab, read the error documentation and attempt to troubleshoot before reviewing steps:
- [AADSTS error code reference](https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes)
- [Microsoft identity platform documentation](https://learn.microsoft.com/en-us/entra/identity-platform/)
