---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/[Deprecated] Advanced SP-Initiated SAML Lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/%5BDeprecated%5D%20Advanced%20SP-Initiated%20SAML%20Lab"
additionalSourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/[Deprecated] Using SAML Screwdriver for SP-initiated SAML request"
importDate: "2026-04-06"
type: troubleshooting-guide
deprecated: true
deprecationNote: "As of April 2024 the SAML Screwdriver site is not available. Use the updated lab instead: https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/1999649/Set-up-test-SAML-application-for-IdP-and-SP-initiated-flows"
---

# [DEPRECATED] SP-Initiated SAML Lab — Using SAML Screwdriver

> ⚠️ **DEPRECATED**: As of April 2024, the SAML Screwdriver site (https://www.authnauthz.com/samlscrewdriver/) is not available.  
> Use the updated lab instead: [Set up test SAML application for IdP and SP initiated flows](https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/1999649/Set-up-test-SAML-application-for-IdP-and-SP-initiated-flows)

## What is SAML Screwdriver?

[SAML Screwdriver](https://www.authnauthz.com/samlscrewdriver/Index) is a service that can be used to debug and troubleshoot problems with claims issuance for SAML SP-initiated sign in flow. Unlike [Claims X-Ray](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/464228/Using-Claims-X-Ray-for-SaaS-SAML-testing) (designed for IdP-initiated flows), this tool is useful for **SAML SP-initiated sign in flow troubleshooting**.

## Setup Procedure

1. In your AAD portal, navigate to **Enterprise Apps** → create a Non-Gallery Application
2. Navigate to **Single sign-on** → select **SAML**
3. In **Basic SAML Configuration**, fill out:
   - Reply URL: `https://www.authnauthz.com/samlscrewdriver/authnresponse`
   - Identifier (Entity ID): your test app identifier
4. Save and copy the **Login URL**
5. **Assign your user** to the application
6. Navigate to https://www.authnauthz.com/samlscrewdriver/ → Add "Issuer" to the request body → Change IdP SSO Endpoint to the SAML login URL from Step 4 → change issuer to the application identifier from Step 3
7. Click "Submit" and inspect the result

## Troubleshooting Scenarios

### NameID Policy Testing

Test different NameID policy values to see how the SAML response differs:

| NameID Format URN | Behavior |
|---|---|
| `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` | Issues NameID as pairwise identifier |
| `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` | Issues NameID in email address format |
| `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` | Entra ID selects format; issues as pairwise identifier |
| `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` | Issues NameID as randomly generated value unique to current SSO op |

### RequestedAuthnContext Testing

Test application behavior when SAML request contains `RequestedAuthnContext`. Note: Microsoft Entra ID only supports `AuthnContextClassRef` value `urn:oasis:names:tc:SAML:2.0:ac:classes:Password`, even if user signed in with stronger authentication methods.

### ForceAuthn Testing

Test forcing fresh authentication by setting the `ForceAuthn` parameter.

### Multi-Instance Application Testing

For multi-instance applications, the SAML request must be sent to:
```
https://login.microsoftonline.com/<tenantid>/saml2/<issuer>
```
**Note:** Only service principal identifiers in **GUID format** are accepted for the issuer value (use Application ID, not display name).

Reference: https://learn.microsoft.com/en-us/azure/active-directory/develop/configure-app-multi-instancing
