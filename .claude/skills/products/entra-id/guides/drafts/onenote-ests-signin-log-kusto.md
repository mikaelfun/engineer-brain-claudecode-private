---
title: "ESTS Sign-in Log Kusto Query (Mooncake)"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Account management/AAD Reporting/Sign-in log Kusto query.md"
product: entra-id
tags: [kusto, sign-in-log, service-principal, ESTS, mooncake]
21vApplicable: true
createdAt: "2026-04-18"
---

# ESTS Sign-in Log Kusto Query (Mooncake)

## Cluster & Database
- Cluster: `estscnn2.chinanorth2.kusto.chinacloudapi.cn`
- Database: `ESTS`

## Service Principal Sign-in Query

```kql
let tenantID1 = "<tenant ID>";
PerRequestTableIfx
| where TenantId == tenantID1
| where env_time > ago(30d)
| where IsConfidentialClient == 1
| where VerificationKeyId !startswith "00000000-0000-0000-0000-000000000000"
| where VerificationKeyId != ""
| extend SPOID = trim_end(@"\|\|.*$", ServicePrincipalObjectID)
| extend SPNAME = ApplicationDisplayName
| project tostring(env_time), RequestId, CorrelationId, SPOID, SPNAME, VerificationKeyId, ApplicationDisplayName, ApplicationId, ResourceDisplayName, ResourceId, ClientIp, Result, ErrorNo, ErrorCode
```

## Usage
- Query service principal sign-in activities for a specific tenant
- Useful for auditing which apps are signing in and their key usage
- Filter by `IsConfidentialClient == 1` to focus on confidential (server-side) apps
