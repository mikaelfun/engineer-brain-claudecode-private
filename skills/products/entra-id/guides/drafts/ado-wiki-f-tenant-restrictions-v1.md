---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Tenant Restrictions/Azure AD Tenant Restrictions V1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Tenant%20Restrictions%2FAzure%20AD%20Tenant%20Restrictions%20V1"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD Tenant Restrictions V1

## Summary

Tenant Restrictions V1 enables organizations to control access to SaaS cloud applications based on the Entra ID tenant. It uses HTTP headers (`Restrict-Access-To-Tenants` and `Restrict-Access-Context`) injected by an on-premises proxy to signal Entra ID which tenants are permitted.

## Architecture

- **Entra ID**: Supports `Restrict-Access-To-Tenants: <permitted tenant list>` header. Only issues tokens for permitted tenants.
- **On-premises proxy**: SSL inspection capable device inserts headers into traffic to login.microsoftonline.com, login.microsoft.com, login.windows.net.
- **Client software**: Must request tokens directly from Entra ID (modern auth / OAuth 2.0).

## MSA Extension (login.live.com)

Header: `sec-restrict-tenant-access-policy: restrict-msa` on traffic to login.live.com blocks all consumer MSA authentication. No granularity - blocks all consumer apps.

## Configuration

### Proxy Headers
- `Restrict-Access-To-Tenants: contoso.onmicrosoft.com,fabrikam.onmicrosoft.com` — must include home tenant
- `Restrict-Access-Context: contoso.onmicrosoft.com` — policy-setting tenant for reporting

### Fiddler Testing
Add to `OnBeforeRequest`:
```javascript
if (oSession.HostnameIs("login.microsoftonline.com") || oSession.HostnameIs("login.microsoft.com") || oSession.HostnameIs("login.windows.net")) {
    oSession.oRequest["Restrict-Access-To-Tenants"] = "contoso.onmicrosoft.com";
    oSession.oRequest["Restrict-Access-Context"] = "contoso.onmicrosoft.com";
}
```

## Known Issues

### Issue 0: AADSTS500021 - Home tenant not in permitted list
- Error: "You can't get there from here"
- Cause: `Restrict-Access-To-Tenants` header missing user's home tenant
- Fix: Add home tenant to the header

### Issue 1: OME mail fails in Outlook, works in OWA
- Outlook desktop contacts sender's tenant directly (blocked by TR)
- OWA uses Exchange service (not blocked)
- Fix: Add sender's tenant to permitted list

### Issue: "passthrough" tenant
- If proxy doesn't support tenantID values: use `microsoftaccounts.onmicrosoft.com` for passthrough tenant (f8cdef31-a31e-4b4a-93e4-5f571e91255a)

## Error Codes
- **AADSTS500021** (NotAllowedTenantRestrictedTenant): Work account blocked
- **0x80045C4D** (PP_E_SIGNIN_BLOCKED_BY_TENANT_POLICY): MSA blocked
- **0x80045C54** (PP_E_INVALID_TRV2_HEADER): Invalid header
- **MSPPError=-2147197875**: MSA blocked sad face

## Data Collection
1. Fiddler trace: inspect `Restrict-Access-To-Tenants` header on login.microsoftonline.com
2. Geneva/DGREP: search PerRequestIFX by correlationID, check `RestrictedTenantProxySetter`
3. Customer audit logs: "Tenant Restrictions" under Other Capabilities

## SharePoint Cross-Tenant Sharing
TR doesn't fully block cross-tenant sharing. Compensating control: filter SharePoint FQDNs at proxy level (`<tenant>.sharepoint.com`, `<tenant>-my.sharepoint.com`, etc.)

## Escalation
- AVA Channel: Cloud Identity - Authentication | PTA and Seamless SSO
- IcM: eSTS Service
