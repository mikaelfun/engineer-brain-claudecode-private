---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure AD : Use a SAML 2.0 Identity Provider (IdP) for Single Sign On"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20AD%20%3A%20Use%20a%20SAML%202.0%20Identity%20Provider%20(IdP)%20for%20Single%20Sign%20On"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD: Use a SAML 2.0 Identity Provider (IdP) for Single Sign On

Companion page to public doc: [Use a SAML 2.0 IdP for SSO](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-fed-saml-idp)

## How to Federate a Domain Using SAML 2.0

```powershell
New-MgDomainFederationConfiguration -DomainId "contoso.com" `
  -DisplayName "contoso.com" `
  -IssuerUri "http://contoso.com/adfs/services/trust/" `
  -PassiveSignInUri "https://sts.contoso.com/adfs/ls/" `
  -SignOutUri "https://sts.contoso.com/adfs/ls/" `
  -PreferredAuthenticationProtocol saml `
  -FederatedIdpMfaBehavior "acceptIfMfaDoneByFederatedIdp" `
  -SigningCertificate <base64encoded tokenSigningCert>
```

## Signed SAML AuthnRequests

Entra ID supports signed SAML AuthnRequests via `isSignedAuthenticationRequestRequired` parameter.

```powershell
# Enable during initial federation
New-MgDomainFederationConfiguration ... -IsSignedAuthenticationRequestRequired

# Enable on existing federation
$tdo = Get-MgDomainFederationConfiguration -DomainID contoso.com
Update-MgDomainFederationConfiguration -DomainId contoso.com `
  -InternalDomainFederationId $tdo.Id -IsSignedAuthenticationRequestRequired
```

## Required Claims

| Claim | Description |
|-------|-------------|
| NameID | Must match user ImmutableID. Up to 64 alphanumeric chars. Format: `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent` |
| IDPEmail | User Principal Name (UPN) in email format |
| Issuer | URI of identity provider. Must match per-domain URI setting |

## Known Limitations

### SHA1 Only for Metadata and Signed AuthnRequests

Both FederationMetadata and Signed SAML AuthnRequests are only signed with SHA1 as of October 2024. SHA-256 is not yet configurable.

- ICM: 555588341
- Feature Request: Engineering work item 2799795

### MFA Claims for SAML 2.0

MFA claim behavior for SAML 2.0 differs from WS-Fed. Product team clarifying exact requirements.

- ICM: 556339192
