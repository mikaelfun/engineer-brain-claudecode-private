---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/Manage Domain Federation Settings with MS Graph"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FManage%20Domain%20Federation%20Settings%20with%20MS%20Graph"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Manage Domain Federation Settings with MS Graph

## Summary

Microsoft Graph API provides public APIs to manage Internal Domain Federation settings via `https://graph.microsoft.com/v1.0/domains/{domain_name}/federationConfiguration`. Key feature: `federatedIdpMfaBehavior` setting that controls MFA behavior with federated IdPs.

## Key Properties

### federatedIdpMfaBehavior (replaces SupportsMfa)

| Value | Effect |
|-------|--------|
| acceptIfMfaDoneByFederatedIdp | Accepts MFA from IdP if sent; otherwise Azure MFA |
| enforceMfaByFederatedIdp | Redirects to IdP for MFA if not sent |
| rejectMfaByFederatedIdp | Ignores IdP MFA; always enforces Azure MFA |

**Important**: Once set, `SupportsMfa` is permanently ignored. No switching back.

### promptLoginBehavior

| Value | Description |
|-------|-------------|
| translateToFreshPasswordAuthentication | Sends wfresh=0 (default, for AD FS 2.0/WS2012R2) |
| nativeSupport | Sends prompt=login (AD FS 2016+) |
| disabled | Sends neither (not recommended) |

## PowerShell Commands

```powershell
# List domains
Connect-MgGraph -Scope "Domain.Read.All, Domain.ReadWrite.All"
Get-MgDomain

# Get federation config
Get-MgDomainFederationConfiguration -DomainId contoso.com | FL

# Create federation
$params = @{
    DisplayName = "sts.contoso.com"
    IssuerUri = "http://contoso.com/adfs/services/trust"
    PassiveSignInUri = "https://sts.contoso.com/adfs/ls"
    SigningCertificate = "<base64>"
    PreferredAuthenticationProtocol = "wsFed"
    FederatedIdpMfaBehavior = "acceptIfMfaDoneByFederatedIdp"
}
New-MgDomainFederationConfiguration -DomainId $domain -BodyParameter $params

# Update
Update-MgDomainFederationConfiguration -DomainId $domain -InternalDomainFederationId $id -BodyParameter @{DisplayName="new"}

# Delete
Remove-MgDomainFederationConfiguration -DomainId contoso.com -InternalDomainFederationId $id
```

## Graph API Endpoints

| Action | Method | URI |
|--------|--------|-----|
| List domains | GET | /domains |
| Get domain | GET | /domains/{domainName} |
| Get federation config | GET | /domains/{domainName}/federationConfiguration |
| Create federation | POST | /domains/{domainName}/federationConfiguration |
| Update federation | PATCH | /domains/{domainName}/federationConfiguration/{objectId} |
| Delete federation | DELETE | /domains/{domainName}/federationConfiguration/{objectId} |

## Required Permissions

- `Domain.Read.All` (read-only) or `Domain.ReadWrite.All` (read/write)
- Roles: Domain Name Administrator, External Identity Provider Administrator, Hybrid Identity Administrator, or Security Administrator

## Known Issues

1. **SupportsMfa vs federatedIdpMfaBehavior conflict**: Once federatedIdpMfaBehavior is set, SupportsMfa is permanently ignored
2. **FederatedIdpMfaBehavior required for new federations**: Creating without it returns error "FederatedIdpMfaBehavior cannot be empty"

## Troubleshooting via ASC

- Check Federation tab under Domains in ASC
- Use ASC Graph Explorer: `/domains/{domainName}/federationConfiguration`
- Kusto: Query `GlobalIfxRestBusinessCommon` in `msodsuswest` cluster, filter by tenantId and `operationName contains "Domain federationConfiguration"`

## Certificate Rollover

Azure AD auto-retrieves new cert from federation metadata 30 days before expiry. Manual rollover via PATCH with `signingCertificate` and `nextSigningCertificate` properties.

## ICM Paths

- PowerShell cmdlets: Microsoft Graph Service / Microsoft Graph Aggregator
- Domains: UMTE / Domain API

## Routing

- ADFS issues: Azure Active Directory Sign-In and Multi-factor Authentication > AD FS > Help configuring other ADFS features
- API issues: Microsoft Graph Other Microsoft Graph APIs > Domain Federation Management
- MFA behavior: Multi-factor Authentication (MFA) > Plan and manage your MFA deployment
