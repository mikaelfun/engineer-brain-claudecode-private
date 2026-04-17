---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application App Proxy Header based authentication"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20App%20Proxy%20Header%20based%20authentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra App Proxy - Header Based Authentication

## Background

Header-based authentication allows App Proxy to authenticate users via Entra ID and pass user attributes to the backend application as HTTP headers. App Proxy provides external access, authenticates users, and forwards the required headers.

## Configuration Steps

### 1. Install App Proxy Connector
- Install connector per [docs](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-add-on-premises-application)
- Ensure connector has connectivity to the target backend application

### 2. Publish Application via App Proxy
- Add on-premises app to Entra ID
- Set Pre-Authentication to **Entra ID**
- Assign the application to the connector group with line of sight to the app
- Assign a test user and verify basic App Proxy connectivity (expect access denied before headers are configured)

### 3. Configure Headers
- Navigate to: `https://portal.azure.com/?feature.claimeditorpreview=true`
- Go to the application > **Claims (preview)** > **Add new claim**
- Header name format: `appproxy_<HEADERNAME>` (e.g., `appproxy_ps_sso_dept`)
- Select Source type and Source attribute from dropdown
- Default claims in the list can be ignored or deleted

### 4. Test and Verify
- Navigate to External URL with test user
- Empty header values will not be included in the request
- Use fresh/private browser session when making changes (headers may cache)

## Hints for Customizing Claims

1. Send **JWTClaimType**, not SamlClaimType in the policy (AppProxy gets claims from id_token)
2. Claim name must use prefix: `appproxy_<desired claim name>`
3. Set `"acceptMappedClaims": true` in the application manifest
4. Test claim issuance using JWT.ms test app

## Test Sample App

A sample NodeJS app is available that prints all request headers:
1. Install NodeJS on connector server
2. Download PrintRequestApp.zip
3. Run `npm install` then `node index.js`
4. Test at http://localhost:8085/

## Troubleshooting

- Use ASC to check Published App and Connector configuration
- Main troubleshooting index: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/393136/Azure-AD-App-Proxy

## ICM Escalation

Template: https://icm.ad.msft.net/imp/v3/incidents/create?tmpl=M1x3g3

## External Documentation

Header-based SSO for on-premises apps with Microsoft Entra App Proxy: https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-headers
