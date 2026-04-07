---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/Using Claims X-Ray for SaaS SAML testing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FLabs%2FUsing%20Claims%20X-Ray%20for%20SaaS%20SAML%20testing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using Claims X-Ray for SaaS SAML Testing (DEPRECATED)

> ⚠️ **DEPRECATED**: As of end of 2024, the ADFS Help portal hosting Claims X-Ray has been retired.
> **Recommended replacement**: Use the new SAML Tool instead.
> See: [Set up test SAML application for IdP and SP initiated flows](ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md)

## What is Claims X-Ray?

Claims X-Ray was a service from ADFS Help that could be used to debug and troubleshoot problems with claims issuance for SAML IdP-initiated sign-in flows. It interacted with a Service Principal to help validate the claims issued to applications.

## Setup: Register Claims X-Ray Application (Historical Reference)

1. Azure AD portal → Enterprise Apps → New → **Non-Gallery Application**

2. Navigate to **Single sign-on** → select **SAML**

3. Edit **Basic SAML Configuration**:
   - **Identifier**: `urn:microsoft:adfs:claimsxray`
   - **Reply URL**: `https://adfshelp.microsoft.com/ClaimsXray/TokenResponse`

4. Save the configuration

5. (Optional) Customize claims in Step 2 of the SAML configuration

6. Assign a test user to the application

7. Test SSO using the **Test** button on the Single sign-on blade

### Test Results

After sign-in with My Apps Secure Sign-in Extension installed, users would be redirected to the **Test single sign-on** page to:
- Download the SAML Response
- Examine errors with suggested solutions

## Migration Note

Since Claims X-Ray is retired, for SAML claims troubleshooting:
1. Use the **SAML Tool** ([guide](ado-wiki-c-lab-saml-tool-idp-sp-initiated-flows.md)) to reproduce the SAML flow
2. Use the **Test SAML SSO wizard** in Azure Portal for validating claims
3. Use **Azure Support Center (ASC) → Advanced Troubleshooting** to analyze sign-in logs and SAML request/response details

## Related Links

- [ADFS Diagnostics Analyzer (retirement notice)](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/troubleshooting/ad-fs-diagnostics-analyzer)
- [SAML claims customization](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-saml-claims-customization)
- [Debug SAML SSO issues - Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/debug-saml-sso-issues)
