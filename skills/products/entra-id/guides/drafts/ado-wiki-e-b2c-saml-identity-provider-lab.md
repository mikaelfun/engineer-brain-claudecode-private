---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Labs/Azure AD B2C - B2C as a SAML Identity Provider Lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Labs%2FAzure%20AD%20B2C%20-%20B2C%20as%20a%20SAML%20Identity%20Provider%20Lab"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C - B2C as a SAML Identity Provider Lab

In this lab we will build upon the custom policy starter pack lab, and create a custom policy that enables your B2C tenant to respond to SAML authentication requests. This will be an internal walkthrough of the public document [Configure Azure AD B2C as a SAML IdP to your applications](https://learn.microsoft.com/azure/active-directory-b2c/saml-service-provider?tabs=windows&pivots=b2c-custom-policy).

## Prerequisites

1. Created an Azure AD B2C Tenant
2. Deployed the Azure AD B2C Custom Policy Starter Pack

## Step 1. Create and Customize Your B2C_1A_SIGNUP_SIGNIN_SAML Policy

1. Using Visual Studio Code, create a new file named `C:\B2CPolicies\B2C_1A_SIGNUP_SIGNIN_SAML.xml`
2. The policy XML includes:
   - SAML Token Issuer technical profile (`Saml2AssertionIssuer`) with `SamlAssertionSigning` and `SamlMessageSigning` keys referencing `B2C_1A_SamlIdpCert`
   - Session management technical profile (`SM-Saml-issuer`) using `SamlSSOSessionProvider`
   - User Journey `SignUpOrSignInSaml` with 4 orchestration steps (CombinedSignInAndSignUp, SignUp ClaimsExchange, AAD-UserReadUsingObjectId, SendClaims via Saml2AssertionIssuer)
   - RelyingParty with SAML2 protocol outputting displayName, givenName, surname, email, identityProvider, objectId

3. Find and replace:
   - `myb2ctenant.onmicrosoft.com` → your tenant name (3 occurrences)
   - `71f27366-a459-45fe-89fa-6eeb02e96e1c` → your B2C tenant ID (1 occurrence)
4. Upload to Azure AD B2C > Identity Experience Framework

## Step 2. Verify your SAML Policy Metadata URL

Metadata URL format: `https://myb2ctenant.b2clogin.com/myb2ctenant.onmicrosoft.com/b2c_1a_signup_signin_saml/Samlp/metadata`

## Step 3. Create your policy key certificates

1. Use PowerShell to create a self-signed certificate and export to .PFX
2. Upload to B2C tenant > Identity Experience Framework > Policy Keys with name `B2C_1A_SamlIdpCert`

## Step 4. Register a SAML Application In Azure AD B2C for Testing

1. Register new app (e.g., SAMLApp1) in Azure AD B2C
2. Update manifest:
   - `accessTokenAcceptedVersion`: 2
   - `identifierUris`: include `https://myb2ctenant.onmicrosoft.com/samlAPPUITest` and `https://samltestapp2.azurewebsites.net`
   - `samlMetadataUrl`: `https://samltestapp2.azurewebsites.net/Metadata`

## Step 5. Test using https://aka.ms/samltestapp

1. Visit https://aka.ms/samltestapp > Service Provider tab
2. Configure SP Initiated SSO:
   - Tenant Name = `myb2ctenant`
   - B2C Policy = `signup_signin_saml` (auto-prefixes `b2c_1a_`)
   - Issuer = `https://myb2ctenant.onmicrosoft.com/samlAPPUITest`
3. Click Login > Sign up/sign in > Verify SAML response

## Step 6. Debug the SAML Protocol

1. Start a Fiddler capture and repeat the test flow
2. Follow [Debug the SAML Protocol](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1052453/Debug-SAML-Protocol) to find SAML Request/Response in the trace

## References

| Name | Link |
|------|------|
| Public Doc | [Configure Azure AD B2C as a SAML IdP](https://learn.microsoft.com/azure/active-directory-b2c/saml-service-provider?tabs=windows&pivots=b2c-custom-policy) |
| SAML Token Issuer Reference | [SAML issuer technical profile](https://learn.microsoft.com/azure/active-directory-b2c/saml-issuer-technical-profile) |
| SAML 2.0 Core Spec | [saml-core-2.0-os.pdf](http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) |
| SAML Online Tools | [SAML Tools](https://www.samltool.com/online_tools.php) |
