---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - test SAML application for IdP and SP initiated flows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FLabs%2FLAB%20-%20test%20SAML%20application%20for%20IdP%20and%20SP%20initiated%20flows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - Set Up Test SAML Application for IdP and SP Initiated Flows

> **Compliance note**: This wiki contains test/lab data only.

## What is SAML Tool?

SAML Tool is a service used to debug and troubleshoot problems with SAML sign-in flows. It can reproduce both IdP-initiated and SP-initiated SSO flows, and is useful for troubleshooting claims issuance and transformations.

**SAML Tool URL**: https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/

## Setup: Register SAML Tool Application

1. In Azure AD portal → Enterprise Apps → New → **Non-Gallery Application** (name it e.g. "SAMLTool")

2. Go to **Single sign-on** → select **SAML**

3. Edit **Basic SAML Configuration**:
   - **Identifier (Entity ID)**: `SamlTool`
   - **Reply URL (ACS URL)**: `https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/acs`

4. Save the configuration

5. (Optional) Customize claims in Step 2 of the SAML configuration blade

6. Assign a test user/group to the application (Properties → "Assignment required?" → Yes → Users and groups)

## Testing IdP-Initiated Flow

1. Navigate to the **Single sign-on** blade of the application
2. Click **Test this application** (or **Test** button in the wizard)
3. Click **Test sign in**
4. Observe the **SAML Request Result** in SAML Tool

> **To test as a different user**: Copy the SSO blade URL, open a new tab, sign in as the target user, then click Test.

## Testing SP-Initiated Flow

1. Copy the **Identifier (Entity ID)** from Basic SAML Configuration (`SamlTool`)
2. Copy the **Login URL** from the "Set up SAMLTool" section

3. Navigate to [SAML Tool Generate Request](https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/generateSamlRequest)
   - Enter **Issuer (EntityID)**: `SamlTool`
   - Enter **Destination (IdP SSO URL)**: paste the Login URL

4. Click **Generate SAML Request** → observe SAML Request Result

## Optional: Download SAML Response

If the **My Apps Secure Sign-in Extension** is installed, after sign-in you are redirected to the **Test single sign-on** page where you can:
- Download the SAML Response
- Examine errors with suggested solutions

> **Note**: As of June 2023, the My Apps Secure Sign-in Extension's "One-click SSO" feature was deprecated due to Chromium MV3 changes. The extension may no longer function for automated SSO configuration, but manual SAML testing remains available.

## Related Links

- [SAML claims customization - Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-claims-customization)
- [Debug SAML SSO issues - Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/debug-saml-sso-issues)
