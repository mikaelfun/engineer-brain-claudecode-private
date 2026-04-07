# Convert ADFS-AAD Federation from WS-Fed to SAML

## Overview
Steps to convert an existing ADFS-AAD federation from WS-Fed protocol to SAML protocol. Useful when testing SAML IDP federation with 3rd-party IdPs.

## Applicable Environment
- Azure China (21Vianet/Mooncake)
- ADFS server federated with AAD

## Steps

### Part 1: AAD (Service Provider) Configuration

```powershell
# 1. Connect and export current federation settings
Connect-MsolService -AzureEnvironment AzureChinaCloud
$saml = Get-MsolDomainFederationSettings -DomainName contoso.com
Get-MsolDomainFederationSettings -DomainName contoso.com | Export-Clixml ADFS-wsfed.xml

# 2. Convert domain to managed (unfederate)
Set-MsolDomainAuthentication -DomainName contoso.com -Authentication Managed

# 3. Re-federate with SAML protocol
Set-MsolDomainAuthentication -DomainName contoso.com -Authentication Federated `
    -SigningCertificate $saml.SigningCertificate `
    -LogOffUri $saml.LogOffUri `
    -PassiveLogOnUri $saml.PassiveLogOnUri `
    -ActiveLogOnUri $saml.ActiveLogOnUri `
    -IssuerUri $saml.IssuerUri `
    -FederationBrandName $saml.FederationBrandName `
    -PreferredAuthenticationProtocol Samlp

# 4. Verify
Get-MsolDomainFederationSettings -DomainName contoso.com
```

### Part 2: ADFS (Identity Provider) Configuration

1. **Add SAML Endpoint**: In ADFS, find "Microsoft Office 365 Identity Platform" relying party → Add SAML endpoint with URL `https://login.partner.microsoftonline.cn/login.srf`

2. **Fix RPID**: Remove extra identifiers, keep only `urn:federation:partner.microsoftonline.cn`

3. **Fix Claim Rules**:
   - **Rule 1**: Change `http://schema.xmlsoap.org/claims/UPN` to `IDPEmail` (so IDPEmail attribute is passed with UPN value)
   - **Rule 2**: Change NameID format from `urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified` to `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent`

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| AADSTS500082: SAML assertion is not present | ADFS returns InvalidNameIDPolicy — NameID format mismatch | Fix Rule 2: use persistent NameID format |
| InvalidNameIDPolicy in SAML response | ADFS cannot provide persistent NameID | Fix claim rules as above |

## Revert (SAML → WS-Fed)

```powershell
# 1. Unfederate
Set-MsolDomainAuthentication -DomainName contoso.com -Authentication Managed

# 2. On ADFS server: delete the relying party
# 3. Re-federate with WS-Fed
Convert-MsolDomainToFederated -DomainName contoso.com
Update-MsolFederatedDomain -DomainName contoso.com
```

> Note: Relying party will be auto-configured with default claim rules. Manually add RP identifier and claim rules if you have device registration.

## References
- https://docs.azure.cn/zh-cn/active-directory/hybrid/how-to-connect-fed-saml-idp
- https://support.pingidentity.com/s/article/Office-365-Switching-the-federation-protocol-to-SAML-from-WS-Federation

## Source
- OneNote: MCVKB/VM+SCIM/11.6 [ADFS] How to convert ADFS-AAD federation protocol from WS-fed to SAML
