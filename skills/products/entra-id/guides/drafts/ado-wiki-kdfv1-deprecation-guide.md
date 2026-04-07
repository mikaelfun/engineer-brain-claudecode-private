---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Azure AD Primary Refresh Token (AAD PRT)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FAzure%20AD%20Primary%20Refresh%20Token%20(AAD%20PRT)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# KDFv1 Deprecation — PRT Security Update Guide

## Error

`AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid. Update the device for the latest updates.`

Sign-in error code: **5000611**

## Background

CVE-2021-33781 (July 2021) — PRT stored insufficiently secure on client. Patched Windows uses KDFv2; unpatched still uses KDFv1 which is being deprecated.

## Rollout Timeline (Complete as of Aug 2025)

| Dates | % Block | Status |
|---|---|---|
| Mar 1-20, 2025 | 1% | Complete |
| Mar 26 - Apr 7 | 5% | Complete |
| Apr 16-25 | 10% | Complete |
| May 6-13 | 25% | Complete |
| May 27 - Jun 2 | 35% | Complete |
| Jun 19-26 | 50% | Complete |
| Jul 14-22 | 75% | Complete |
| Jul 30 - Aug 11 | 100% (non-allow-listed) | Complete |
| Sep 1-15, 2025 | 100% (allow-listed tenants) | Pending |

## Customer Action

- Windows with security patches after July 2021 → no action needed
- Unpatched devices → must update Windows (see [CVE-2021-33781](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-33781))

## CSS Response Steps

1. Share public doc: [Deprecation of KDFv1 algorithm](https://learn.microsoft.com/en-us/entra/identity/devices/deprecation-key-derivation-function-version-1)
2. If needed (SAW required), run Kusto queries to identify impacted devices
3. Direct customer to update devices

## Allow-Listing Procedure

### Criteria
- ≥20% of devices or >500 devices affected
- Business-critical operations disrupted
- Customer must acknowledge security risk via email

### ICM Details
- **Service**: Cloud Identity AuthN Client
- **Team**: Apple team OCE
- **CC**: Ameya Patil (amepatil)
- **Title**: "Request for KDFv1 exception"
- **Severity**: **2.5** (NEVER escalate to Sev 2)
- Attach customer acknowledgment email

### Email Template (CELA approved)
```
To Microsoft support
Subject: Request for temporary exception for KDFv1 security fix

Please exclude Tenant [TenantId] from the KDFv1 Security fix rollout due to [business justification].

I/We understand and acknowledge the security risk of being excluded...
[See full template in wiki]

Signed
For [customer name]
```

## Kusto Queries (SAW only)

Cluster: `estswus2.kusto.windows.net` | DB: `ESTS`

### Device Count
```kql
let data_timespan = 7d;
AllPerRequestTable
| extend KDFV1 = V2LearnMode has "KDFV1"
| where ClientInfo has "Wam" and ErrorCode == ""
| where env_time > ago(data_timespan)
| where TenantId == "<tenant-id>"
| summarize notupdated=dcountif(DeviceId, KDFV1), all=dcount(DeviceId) by TenantId
| extend share=round((notupdated + 0.0) * 100 / all, 2)
```

### Device List
```kql
let data_timespan = 7d;
AllPerRequestTable
| extend KDFV1 = V2LearnMode has "KDFV1"
| where ClientInfo has "Wam" and ErrorCode == ""
| where env_time > ago(data_timespan)
| where TenantId == "<tenant-id>"
| where KDFV1
| summarize by DeviceId
```

## Support Topic
- `Azure/Microsoft Entra Directories, Domains, and Objects/Devices/Access Issues on Joined or Registered devices`
- Root cause: `Root Cause - CID Directory Domain Object/Device Registration/Sign-in failures on Registered Devices/KDFv1 Deprecation`

## Edge WebView PRT SSO

- Default: `AllowSingleSignOnUsingOSPrimaryAccount = FALSE`
- To enable: set via `CoreWebView2EnvironmentOptions` in app code
- Edge Chromium: Settings > Profiles > Profile preferences > "Allow single sign-on for work or school sites"

## PRT Sharing (By Design)

On HAADJ machines, PRT is shared between users in the browser. Only device ID is extracted from PRT — User2 cannot impersonate User1. This is expected behavior for device-based Conditional Access.
