---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======11. AAD=======/11.23 [SamlIdpSso] Integrating Okta (as IdP) with.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Integrating Okta (as IdP) with Azure AD (Mooncake)

Two scenarios for Okta SAML federation with Azure AD in China cloud.

## Scenario 1: Users from on-prem AD

**Key configuration:**
- Okta SAML App settings:
  - Single sign on URL: `https://login.partner.microsoftonline.cn/login.srf`
  - Audience URI: `urn:federation:partner.microsoftonline.cn`
  - Name ID format: Persistent
  - Application username: Custom -> `findDirectoryUser().externalId` (sets ImmutableID as NameID)
  - Attribute: IDPEmail = user.email

**Steps:**
1. Verify custom domain on Azure AD
2. Install Azure AD Connect to sync on-prem AD users
3. Create SAML 2.0 app in Okta console
4. Install Okta AD Agent to sync AD users to Okta
5. Assign SAML app to users
6. Configure domain federation in Azure AD:
   ```powershell
   Set-MsolDomainAuthentication `
     -DomainName $dom `
     -FederationBrandName "Okta" `
     -Authentication Federated `
     -PassiveLogOnUri $LogOnUrl `
     -ActiveLogOnUri $LogOnUrl `
     -SigningCertificate $MySigningCert `
     -IssuerUri $IssuerUri `
     -LogOffUri $LogOffUrl `
     -MetadataExchangeUri $metadataUri `
     -PreferredAuthenticationProtocol Samlp
   ```

## Scenario 2: Users from Okta directly (cloud-only)

**Key difference:** ImmutableID can be specified during user provision.

- Application username: Keep default (Okta username as NameID)
- Provision users via PowerShell:
  ```powershell
  New-MsolUser `
    -UserPrincipalName <UPN> `
    -ImmutableId <same-as-NameID> `
    -DisplayName "<name>" `
    -UsageLocation "<location>"
  ```
- UPN must match IDPEmail claim; ImmutableID must match NameID assertion

## Key URLs for Mooncake
- SSO URL: `https://login.partner.microsoftonline.cn/login.srf`
- Audience URI: `urn:federation:partner.microsoftonline.cn`
- Get LogOnUrl, IssuerUri, SigningCert from: Okta -> Application -> Sign On -> SAML 2.0 -> View Setup Instructions
