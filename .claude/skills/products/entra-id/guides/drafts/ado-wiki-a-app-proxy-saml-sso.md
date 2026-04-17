---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy SAML Single-sign On"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20SAML%20Single-sign%20On"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - SAML Single-Sign On

> **This feature is in preview - expect gaps and changes until it ships**

## Feature Overview

Entra Application Proxy now offers native SAML SSO support. Previously, a workaround required two applications (one SAML SSO app + one App Proxy app), which was sub-optimal due to:
- Poor application management experience with two separate apps
- Increased likelihood of configuration errors
- Multiple login prompts for users

With native support, users configure SAML SSO in a single application. Application Proxy focuses on SAML SSO with Entra as the IDP, encouraging customers to modernize their applications' authentication.

## Limitations

**SAML support for ADFS** is not supported. This feature supports moving application authentication to Entra, aligning with the application migration strategy.

## Case Handling
Supported by AAD - Authentication Professional and AAD - Authentication Premier queues.

## Prerequisites
- The on-prem application must be able to consume SAML tokens issued by Entra

## Configuration Steps

### Step 1: Publish Application with Application Proxy
1. Sign into the Entra portal
2. Follow standard "Publish applications using Azure AD Application Proxy" steps
3. Copy the External URL for use in SAML configuration
4. Assign a user

### Step 2: Configure SAML SSO
1. Follow "Enter basic SAML configuration" steps
2. **Critical:** The **Reply URL** root must match or be a path under the **Application Proxy External URL**
   - If the back-end application expects the Reply URL to be the internal URL, install the **My Apps Secure Sign-In Extension** for automatic client-side redirect

### Step 3: Testing
Navigate to the **external URL** in the browser. Sign in with the test account.

#### Using the Application Proxy Test Button
After publishing, use the test button on the settings page to verify configuration. Requires **My Apps Secure Sign-In Extension**.

The diagnostic report follows the hops between:
1. **Entra ID authentication** - pre-auth, user assignment issues
2. **Connector setup** - connector reachability, ports, signaling
3. **Application server** - response status, timeout issues
4. **Application authentication** - Kerberos errors
5. **Application content** - rendering, unreachable links

## Troubleshooting
Follow standard Microsoft Entra Application Proxy documentation. For SAML-specific issues, Kusto queries to determine if the app is configured to use SAML SSO are available (supplied by PG).
