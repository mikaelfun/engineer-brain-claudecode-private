---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Tenant Restrictions/Azure AD Tenant Restrictions V2"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Tenant%20Restrictions%2FAzure%20AD%20Tenant%20Restrictions%20V2"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD Tenant Restrictions V2

## Feature Overview

TRv2 is the successor to TRv1, providing granular control via cross-tenant access policy (XTAP). Devices inject `sec-Restrict-Tenant-Access-Policy: <tenantID>:<policyID>` header. Enforced at both auth (ESTS) and data plane (SPO, EXO).

**Supported Platforms**: Windows 10 20H2+ (build 1904x.1348+), Windows 11 Enterprise/Pro, Edge Chromium 88+.
**License**: AAD P1 required.

## TRv1 vs TRv2 Comparison

| Feature | TRv1 | TRv2 |
|---------|------|------|
| Granularity | Limited (all-or-nothing) | Tenant, user, group, app level |
| Anonymous access | Allowed | Blocked (Teams meetings, SharePoint) |
| Token infiltration | Vulnerable | Protected |
| MSA control | Separate header (restrict-msa) | Integrated app-level control |
| Platform | All platforms (proxy-based) | Windows only (GPO/Intune), non-Windows via NaaS |

## Truth Tables

### ESTS (Token Issuance)
| TRv2 Header | Claims Challenge | Result |
|-------------|-----------------|--------|
| No | No | No xms_trpid claim |
| Yes | No | xms_trpid issued (or blocked) |
| Yes | Yes | xms_trpid issued (or blocked) |
| No | Yes | No xms_trpid (ESTS ignores claims challenge without header) |

### Resource Provider
| TRv2 Header | Token Claims | Result |
|-------------|-------------|--------|
| No | none | Accept (TRv2 not enforced) |
| No | xms_trpid | Accept (header is the enforcement signal) |
| Yes | none | 401 with claims challenge requesting xms_trpid |
| Yes | xms_trpid | Enforce policy (accept or reject based on XTAP) |

## GPO/Intune Configuration

1. Open GPEdit.msc > Computer Configuration > Administrative Templates > Windows Components > Tenant Restrictions
2. Double-click "Cloud Policy Details", enter tenant ID and policy GUID
3. Enable "firewall protection of Microsoft endpoints" checkbox for WDAC/Windows Firewall

ADMX Template: Download from Microsoft (21H2 v2.0)

## cloudidsvc (Microsoft Cloud Identity Service)

Syncs O365 endpoint list from `endpoints.office.com`. Hardened by WSH to TCP 443 only.
- Event 1013: Sync failure - proxy port mismatch
- Workaround: Add firewall rule for proxy port, restart cloudidsvc

## Troubleshooting

### 1. RP returns 401 with claims challenge
- Check if tenant just enabled TRv2 (expected 401 spike during token renewal)
- Use Kusto: `scenario | where hasClaims == "true" | where claimChallengeKeys contains "xms_trpid"`
- Verify next auth_adal_tokens scenarios succeed

### 2. AADSTS5000211 from AAD
- Tenant restrictions policy blocks resource tenant
- Use Kusto: `scenario | where aadStsErr contains "AADSTS5000211" | summarize count() by resource, UserInfo_TenantId`

### 3. Access blocked screen
- User signed into restricted tenant before policy enabled
- Token infiltration detected (PID mismatch)

### 4. Missing xms_trpid in token
- Check WAM logs.txt: search "Created a request with the following properties"
- Compare tenant ID in claims with UserInfo_TenantId

### 5. User stuck at access blocked prompt
- Remove stale registry: `HKCU\...\Group Policy Objects` and `HKLM\...\TenantRestrictions\Payload`
- Clear Office identity cache in registry

### 6. Turn off TRv2
- Per tenant: disable in Local Group Policy and Entra portal
- Per Resource Provider: contact EXO (Rex Zou), SPO (Kangle Yu), Teams (Nitesh Golchha)

## Limitations
- Windows only (Mac/Chrome needs TRv1 or NaaS)
- No Server SKU support
- 25KB policy size limit for partner policies
- Remove TRv1 MSA header before implementing TRv2 MSA policy
