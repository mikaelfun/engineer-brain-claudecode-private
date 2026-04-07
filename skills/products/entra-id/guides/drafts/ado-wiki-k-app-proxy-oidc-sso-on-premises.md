---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - OpenID Connect (OIDC) Single Sign-On for on-premises applications"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20OpenID%20Connect%20(OIDC)%20Single%20Sign-On%20for%20on-premises%20applications"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - OpenID Connect (OIDC) SSO for On-Premises Applications

Step-by-step guide for securing access to on-premises OpenID Connect (OIDC) applications using Microsoft Entra Application Proxy.

## Overview

OpenID Connect (OIDC) is an authentication protocol built on OAuth 2.0. When combined with Application Proxy, it provides:
- Authenticated traffic reaches internal network via App Proxy
- Users access OIDC apps without VPN
- Access controlled by user assignment, Conditional Access, and MFA

## Architecture

Two applications are required in Entra ID:
1. **OIDC Application**: The OpenID Connect app registered in the tenant, working internally
2. **App Proxy Application**: Non-gallery (on-premises) application used to publish the OIDC app's URL

## Prerequisites

- OpenID Connect application hosted on-premises and working internally
- Entra tenant with Application Proxy plan
- Custom, verified domain matching the OIDC app's Redirect URI suffix
- SSL certificate for custom domain publishing
- On-premises AD users synced via Entra Connect (or cloud-only/B2B users assigned to the apps)
- Application Proxy connector installed and running

## Step 1: Register OIDC Application with Entra

Register the OIDC application in Entra ID. For testing, use the sample app from GitHub:
[Azure-Samples/active-directory-aspnetcore-webapp-openidconnect-v2](https://github.com/Azure-Samples/active-directory-aspnetcore-webapp-openidconnect-v2/tree/master/1-WebApp-OIDC/1-1-MyOrg)

Verify the application works from the internal network before proceeding.

## Step 2: Publish via Application Proxy

1. In Entra portal, open the application and select **Application Proxy**
2. Set the **Internal URL** for the application (upload TLS/SSL cert if using custom domain)
3. Set **Pre Authentication** to **Entra ID**
4. Copy the **External URL**
5. Test access via External URL to validate App Proxy setup

## Testing

1. Open browser and navigate to the **External URL**
2. Sign in with assigned test account
3. Verify SSO works - should load the application without additional sign-in prompts

## Troubleshooting

- If App Proxy setup has issues, see: [Troubleshoot Application Proxy problems and error messages](https://docs.microsoft.com/azure/active-directory/app-proxy/application-proxy-troubleshoot)
- Sample Fiddler traces (internal and external through MEAP) are available for reference
