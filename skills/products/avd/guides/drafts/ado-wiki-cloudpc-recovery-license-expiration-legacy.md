---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/Cloud PC Recovery from License Expiration/Legacy Recovery Steps"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/WCX%20Specific%20Content/OCE%20APIs/Cloud%20PC%20Recovery%20from%20License%20Expiration/Legacy%20Recovery%20Steps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Overview

Legacy Recovery OCE API for recovering Cloud PCs after license expiration. Supports bulk recovery (separate Workspace IDs with commas).

Recording: [Legacy Recovery OCE API Recording](https://microsoftapc-my.sharepoint.com/:v:/g/personal/wesu_microsoft_com1/Ed4Hn0MUOH5JmsXmV39S5zMBWcLvLJZhCL5OW1UGRy595g?e=w7zLmn)

## Step 1: Verify License & Get Workspace IDs

### 1.1 Confirm re-enabled license

```kusto
UserLicenseEntity_MV
| where UserId == <user object id>
| where ServicePlanId == <re-enabled service plan id>
| project UserId, UserPrincipalName, ServicePlanId, CapabilityStatus
```
`CapabilityStatus` should be `Enabled`.

### 1.2 Get old and new workspace IDs

```kusto
WorkspaceEntity_MV
| where UserId == <user object id>
| where LicenseType == <re-enabled license id>
| project UpdatedAt, UniqueId, DisplayStatus, ChangeType
| order by UpdatedAt desc
| take 2
```

- **New workspace** (to deprovision): `DisplayStatus == "provisioned"`, `ChangeType == "Create"`
- **Old workspace** (to recover): `DisplayStatus == "deprovisioning"`, `ChangeType == "Delete"`

Confirm on CPC Diagnostic Tool.

## Step 2: Deprovision New Device

> **Confirm with customer** that we're allowed to deprovision the newly provisioned CPC (1 user can have only 1 CPC of 1 service plan).

1. CloudPC OCE > Scheduler Service Actions > Create new deprovision work items (Scheduler)
2. Parameters:
   - **Endpoint**: Scale Unit
   - **Tenant ID**: Customer's TenantId
   - **Workspace ID list**: new workspace id
3. A Lockbox request goes to Windows 365 service M2 team (expires in 4 hours)
4. Check status: CloudPC OCE > Fine-grained JIT control Actions > Get fine-grained JIT request result
   - Service Name: `SchedulerService`
   - Torus request ID: from API result
5. Wait until `DisplayStatus` is `notProvisioned`:
   ```kusto
   WorkspaceEntity_MV
   | where ChangeType != "Delete"
   | where UserId == <user object id>
   | where LicenseType == <re-enabled service plan id>
   | project UniqueId, DisplayStatus
   ```

## Step 3: Recover Old Device

1. CloudPC OCE > Scheduler Service Actions > Create new recover work items (Scheduler)
2. Parameters:
   - **Endpoint**: Scale Unit
   - **Tenant ID**: Customer's TenantId
   - **Workspace ID list**: old workspace id
   - **RecoverReason**: `LicenseExpired`
3. Wait until `DisplayStatus` is `provisioned`
