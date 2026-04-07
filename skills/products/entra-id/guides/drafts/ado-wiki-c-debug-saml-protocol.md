---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Integrating B2C with SAML Identity Provider/Debug SAML Protocol"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Integrating%20B2C%20with%20SAML%20Identity%20Provider/Debug%20SAML%20Protocol"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Debug SAML Protocol in Azure AD B2C

## Check SAML Request
1. Fiddler CTRL+F: search "SAMLRequest"
2. Inspectors > Webforms > right-click SAMLRequest value > send to Text Wizard > DeflatedSAML
3. Verify: Destination, AssertionConsumerServiceURL, Issuer, ForceAuthn, ProtocolBinding

## Check SAML Response
1. Fiddler CTRL+F: search "SAMLResponse"
2. Same decode: Inspectors > Webforms > Text Wizard > DeflatedSAML
3. Verify: StatusCode (Success/Error), Issuer matches IDP, Assertion contains expected claims
4. Check signature, certificate, audience restriction

## Key Elements to Verify
- Request Destination matches IDP SSO URL
- Response Destination matches B2C assertion consumer URL
- Issuer in response matches IDP entity ID
- NameID format matches B2C expectation
- Required claims (email, displayName, etc.) present in assertion
