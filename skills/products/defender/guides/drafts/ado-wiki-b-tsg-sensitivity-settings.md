---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Data Sensitivity Discovery/[TSG] Sensitivity settings"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FData%20Sensitivity%20Discovery%2F%5BTSG%5D%20Sensitivity%20settings"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] Sensitivity Settings Troubleshooting

## Overview

Sensitivity Settings is a **tenant-level** setting for managing data sensitivity based on selective info types and labels from Purview compliance portal. Documentation: https://aka.ms/DASP/Documentation/DataSensitivitySettings

Errors can occur due to:
1. User has insufficient permissions
2. ARM / Service issue
3. Bad Request

---

## Issue 1: Insufficient Permissions

Sensitivity settings require **tenant-level AAD (Graph) permissions**. Customer must have one of:

- Global Administrator
- Compliance data administrator
- Compliance administrator
- Security administrator
- Security operator

**Portal behavior:** Standard Azure Fail Page with message:
> _You don't have one of the following Azure AD administrative roles: Global Administrator, Compliance data administrator, Compliance administrator, Security administrator, Security operator_

**API behavior:** HTTP 403 Forbidden

**Mitigation:** Grant one of the required AAD roles.

---

## Issue 2: ARM / Service Issue

May be transient or due to an ARM/sensitivity service problem.

**Diagnose with service logs:**
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(1d)
| where TenantId == "<TenantId>"
| where env_cloud_role == "ArmRequestRouter"
```

```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(1d)
| where Env == "PROD"
| where OperationName == "GetSensitivitySettings" or OperationName == "PutSensitivitySettings"
| where TenantId == "<TenantId>"
| project TIMESTAMP, TenantId, Message, Exception
```

**Portal behavior:** Generic error page.

**API behavior:** HTTP 400 Bad Request or HTTP 500 Internal Server Error.

---

## Blob Storage Sensitivity Classification Status
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(14d)
| where Env == "PROD"
| where TenantId == "<tenantID>"
| where Message startswith "Salus Event Hub Payload message ResourceStatusUpdatePayload"
| parse Message with * "/Microsoft.Storage/storageAccounts/" StorageName ", TenantId =" * ", Status = " SensitivityStatus ", Plan" *
| where StorageName == "<storageaccount>"
| project TIMESTAMP, TenantId, StorageName, SensitivityStatus
```

## Number of Containers Within a Storage Account Assessed
```kusto
MdfcIpServiceLogs
| where TIMESTAMP > ago(7d)
| where Service == "Salus"
| where * contains "<storageaccountname>"
```
