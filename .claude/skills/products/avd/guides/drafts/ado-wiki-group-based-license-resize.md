---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/Group-based License Resize"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FGroup-based%20License%20Resize"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Group-based License Resize (OCE API)

## JIT Access Preparation

1. If not Torus enrolled, follow SaaF Tours
2. Join **CMDCPCSupport** eligibility at OSP Identity (8 hours provisioning)
3. JIT elevate in Torus Client/PROD DMS:
   ```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"
   ```
4. **[SAW Enforced]** Navigate to Geneva Action portal, login with Torus account

JIT GROUP: CMDCPCSupport-JIT-PE-PlatformServiceOperator (ReadWrite, DataAccessLevel)

## Pre-requirements

- Default: 8 work items every 5 minutes per tenant
- Trusted tenant: 50 work items every 5 minutes (engage Workspace OCE to mark tenant trusted with score 1)

## Resize Steps Overview

C = customer operation, M = Microsoft OCE operation

## Step 3: Check Original CPC Status

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database("Reporting").materialized_view('WorkspaceEntity_MV')
| where ChangeType == "Create"
| where TenantId == "<TenantId>"
| where LicenseType == "<OriginalServicePlanId>"
| where UserId in ("<userId1>", "<userId2>")
};
GetDataFrom('cpcdeedprptprodgbl.eastus2')
```

DisplayStatus should be **provisioned**.

## Step 3: Check Target CPC Status

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database("Reporting").materialized_view('WorkspaceEntity_MV')
| where ChangeType == "Create"
| where TenantId == "<TenantId>"
| where LicenseType == "<TargetServicePlanId>"
| where UserId in ("<userId1>", "<userId2>")
};
GetDataFrom('cpcdeedprptprodgbl.eastus2')
```

There should be **no records**. If records exist, those users don't meet resize condition.

## Step 3: Prepare Data for OCE API

```kql
let originalServicePlanId = "<OriginalServicePlanId>";
let targetServicePlanId = "<TargetServicePlanId>";
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database("Reporting").materialized_view('WorkspaceEntity_MV')
| where ChangeType == "Create"
| where TenantId == "<TenantId>"
| where LicenseType == originalServicePlanId
| where UserId in ("<userId1>", "<userId2>")
| join kind = inner cluster(clusterName).database("Reporting").materialized_view('DeviceEntity_MV')
  on $left.DeviceId == $right.UniqueId
| project TenantId, LicenseType, IntuneDeviceId
| extend OCE = strcat(TenantId, ',', IntuneDeviceId, ',', targetServicePlanId)
| project OCE
};
GetDataFrom('cpcdeedprptprodgbl.eastus2')
```

Save result as txt, delete header "OCE".

## Step 3: Call OCE API (Batch Mode)

Geneva Actions: CloudPC OCE > ResourceMgmt Actions > Group-based license resize workspace
- Switch Input Mode to **Batch**, upload txt file (max 100 lines per batch)

If stuck >30 mins, verify with:

```kql
let OCEActivityId = "<Jarvis Action Activity Id>";
CloudPCEvent
| where ActivityId == OCEActivityId
| where isnotempty(UserId) | where Col1 contains "action"
| distinct UserId, SessionId, AccountId, Col1
| join kind=inner (CloudPCEvent | where ActivityId == OCEActivityId | where Col1 contains "pend") on SessionId
| join kind=inner (CloudPCEvent | where ActivityId == OCEActivityId | where ColMetadata contains "Action end") on SessionId
| project TimeStamp=env_time, Col1, ActionType=Col11, ActionResult=Col12
```

## Step 5: Check Resize Progress

```kql
let GetDataFrom = (clusterName:string)
{
cluster(clusterName).database("Reporting").materialized_view('ProvisionRequestTrackEntity_MV')
| where ActionType == 'Upgrade'
| where TenantId == "<TenantId>"
| where OriginalServicePlanId == "<OriginalServicePlanId>"
| where TargetServicePlanId == "<TargetServicePlanId>"
| where Timestamp >= ago(1d)
| extend DurationInMinutes = datetime_diff('minute', LastModifiedDateTimeUTC, CreatedDateTimeUTC)
| project CreatedDateTimeUTC, LastModifiedDateTimeUTC, UserId, Status, ErrorCode, DurationInMinutes
};
GetDataFrom('cpcdeedprptprodgbl.eastus2')
```

Kusto results have ~20 min delay. Also check CPC Diagnostics (azure.com).
