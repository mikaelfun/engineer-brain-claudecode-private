---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - test SAML application for IdP and SP initiated flows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/LAB%20-%20test%20SAML%20application%20for%20IdP%20and%20SP%20initiated%20flows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - Test SAML Application for IdP and SP Initiated Flows

## What is SAML Tool?

SAML Tool is a service for debugging and troubleshooting SAML sign-in flows. It acts as a Service Provider (SP) that you can use to test custom claim issuance, transformations, and SAML requests/responses.

**SAML Tool URL**: https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/

> ⚠️ **Note**: As of end of 2024, this SAML Tool is the **recommended replacement** for the retired ADFS Claims X-Ray tool.

## Setup: Register SAML Tool as Enterprise Application

1. In Azure AD portal → **Enterprise Apps** → **New application** → Create Non-Gallery Application

2. Navigate to **Single sign-on** → select **SAML**

3. Edit **Basic SAML Configuration**:
   - **Identifier (Entity ID)**: `SamlTool`
   - **Reply URL (ACS)**: `https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/acs`

4. Save configuration

5. (Optional) Edit claims in Step 2 if testing custom claim transformations. See [SAML claims customization docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-claims-customization).

6. Assign test user/group: **Users and Groups** → Add user/group

## Testing IdP-Initiated Flow

1. In the app's **Single sign-on** blade → click **Test** button
2. Select **Test sign in** (for currently logged-in user) or browser extension option for different user
3. Observe the "SAML Request Result" in SAML Tool

## Testing SP-Initiated Flow

1. Copy the **Identifier (Entity ID)** from Basic SAML Configuration: `SamlTool`
2. Copy the **Login URL** from "Set up SAML tool" section of Single sign-on blade
3. Navigate to [SAML Tool Generator](https://samlrequestgenerator-shmiki-test-gtbecvfhczbrcvcp.japaneast-01.azurewebsites.net/generateSamlRequest)
4. Enter:
   - **Issuer (EntityID)**: `SamlTool`
   - **Destination (IdP SSO URL)**: the Login URL from step 2
5. Click **Generate SAML Request** → authenticate → observe SAML Response

## What to Look For in Results

The SAML Tool displays the full SAML response including:
- All issued claims and their values
- Token validity period
- Assertion attributes

Use this to validate:
- Custom claim transformations are working correctly
- Required claims are present
- Claim values match expected values

## Useful for Troubleshooting

- SAML SSO login failures → view actual SAML response to identify missing/incorrect claims
- Custom claims not appearing → verify claim rules in Entra ID match expected output
- ForceAuthn behavior → use SP-initiated flow with ForceAuthn parameter set to true/false

## Related

- [ForceAuthn lab](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/LAB%20-%20Understanding%20The%20ForceAuthn%20Parameter%20In%20A%20SAML%20Request)
- [Test SAML settings button guide](ado-wiki-c-test-saml-settings-button.md)
