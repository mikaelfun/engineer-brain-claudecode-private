---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Provisioning/Citrix Provision Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Provisioning/Citrix%20Provision%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix HDX Plus Provision Status Check

## Overview
Citrix agent will install and be registered inside VMs as part of the general provisioning process.

## Provisioning Workflow
1. RMS gets the license change event
2. RMS WorkItemDispatcher processes the work items
3. Install the Citrix client in Provision flow (includes Citrix agent extension flow)

## Citrix VDA Installer

### Check VDA Installer Failures (Kusto)

```kql
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where AccountId == "{TenantID}"
| where OtherIdentifiers contains "{UserID}"
| where EventUniqueName == "ExecuteStorageBlobRelatedRequestWithFallbackAsync(Ln: 155)"
| where OtherIdentifiers contains "Command execution finished, but failed because it returned a non-zero exit code"
| project env_time, AccountId, ActivityId, TruncatedId = Col1, OtherIdentifiers
```

Expand truncated messages:
```kql
let truncatedID = "{TruncatedId}";
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where Col1 == truncatedID
| project env_time, AccountId, ActivityId, Truncatedid = Col1, OtherIdentifiers
```

### Citrix VDA Installer Exit Codes

| Exit Code | Meaning | Explanation / Troubleshooting |
|-----------|---------|-------------------------------|
| **0** | Success | Installation completed successfully, no reboot required. |
| **1** | Failed | One or more components failed. |
| **2** | PartialSuccess | Some components installed, others failed. Check logs. |
| **3** | PartialSuccessAndRebootNeeded | Some succeeded, others failed, reboot required. |
| **4** | FailureAndRebootNeeded | Failure occurred, must reboot before retry. |
| **5** | UserCanceled | Installation was canceled by user or script. |
| **6** | MissingCommandLineArgument | Required argument missing from command. |
| **7** | NewerVersionFound | A newer VDA version already installed. |
| **8** | SuccessRebootNeeded | Install succeeded but reboot required. |
| **9** | FileLockReboot | Locked file blocked installation. Reboot and retry. |
| **10** | Aborted | Installer aborted unexpectedly. Review logs. |
| **11** | FailedMedia | Installer files/media corrupted or inaccessible. |
| **12** | FailedLicense | Licensing check failed. Ensure Citrix license is valid. |
| **13** | FailedPrecheck | Pre-install check failed (e.g., missing .NET, OS unsupported). |
| **14** | AbortedPendingRebootCheck | Reboot pending from previous setup. Complete reboot first. |
| **-1** | Exit (Generic) | Unknown or unexpected termination. Check Event Viewer. |

## Check Citrix Agent Installation

### From Kusto Log
```kql
Provision_GetProvisionHistoryV2(ago(7d), now())
| mv-expand PostProvisionStepResults
| where (PostProvisionStepResults.stepName == 'InstallCitrixAgent')
    or (ActionType in ("InstallCitrixAgent", "UninstallCitrixAgent"))
| where isnotnull(PostProvisionStepResults.stepError) or Status like 'fail'
| project AccountId, WorkItemId, ActivityId, ActionType, Region, ImageType,
    UserId, ServicePlanId, PolicyId, ServicePlanType, PartnerAppType,
    env_time, Status, DeviceId,
    CitrixError = coalesce(ErrorCode, PostProvisionStepResults.stepError)
```

### From Cloud PC
- Review VDA installation logs:
  - `%temp%/Citrix/XenDesktop Installer`
  - `C:\Windows\Temp\Citrix\XenDesktop Installer`
  - `C:\Windows\SystemTemp\Citrix\XenDesktop Installer`
- Review Event Viewer: `Windows Logs > Applications > Citrix VDA Upgrade Agent Service`

## EPA → User → RMS (Install/Uninstall on Existing CPCs) Log

```kql
let StartTime = datetime({startTime});
let EndTime = datetime({endTime});
let PartnerId = "198d71c0-80bb-4843-8cc4-811377a49a92";
let TargetTenantId = "{TargetTenantId}";
let TargetUserId = "{TargetUserId}";
let MyCloudPCEvent = union
    cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPC").table("CloudPCEvent"),
    cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPCProd").table("CloudPCEvent"),
    cluster("https://cloudpcneu.northeurope.kusto.windows.net").database("CloudPCProd").table("CloudPCEvent");
let MyProvisionRequestTrackEntityStream = union
    cluster("https://cpcdeedprptintgbl.eastus2.kusto.windows.net").database("Reporting").table("ProvisionRequestTrackEntity_Stream"),
    cluster("https://cpcdeedprptshgbl.eastus2.kusto.windows.net").database("Reporting").table("ProvisionRequestTrackEntity_Stream"),
    cluster("https://cpcdeedprptppegbl.eastus2.kusto.windows.net").database("Reporting").table("ProvisionRequestTrackEntity_Stream"),
    cluster("https://cpcdeedprptprodgbl.eastus2.kusto.windows.net").database("Reporting").table("ProvisionRequestTrackEntity_Stream");
MyCloudPCEvent
| where env_time between (StartTime .. EndTime)
| where ApplicationName == "epa" and ComponentName == "UserClient"
    and EventUniqueName startswith "SyncExternalPartnerUserMessage"
| where Col1 == PartnerId
| mv-expand todynamic(Col2)
| extend EpaMessage = parse_json(Col2)
| extend TenantId = tostring(EpaMessage.TenantId),
    UserId = tostring(EpaMessage.UserId),
    Action = case(
        EpaMessage.State == 0, "Assign",
        EpaMessage.State == 1, "Unassign",
        EpaMessage.State == 2, "Refresh",
        "unknown"
    )
| where case(isempty(TargetTenantId), 1 == 1, TenantId == TargetTenantId)
    and case(isempty(TargetUserId), 1 == 1, UserId == TargetUserId)
| extend Event = "EPA send notification to User"
| project env_time, ActivityId, Event, Action, TenantId, UserId
| union (
    MyCloudPCEvent
    | where env_time between (StartTime .. EndTime)
    | where ApplicationName == "RMFunction"
        and ComponentName == "UserLicenseNotificationReceiver"
        and EventUniqueName startswith "AcceptMessageAsync"
    | where Col1 startswith "Received a user license notification message from EventGrid."
        and Col1 has_all (TargetTenantId, TargetUserId)
    | extend Event = "User send notification to RMS", TenantId = TargetTenantId, UserId = TargetUserId
    | project env_time, ActivityId, Event, TenantId, UserId
)
| union (
    MyCloudPCEvent
    | where env_time between (StartTime .. EndTime)
    | where ApplicationName == "RMFunction"
        and ComponentName == "WorkItemFacade"
        and EventUniqueName startswith "SaveWorkItemAsync"
    | where Col1 startswith "Saved workitem to DB: "
    | extend WorkItemMessage = parse_json(extract("Saved workitem to DB: (.*)", 1, Col1))
    | extend TenantId = AccountId,
        UserId = tostring(WorkItemMessage.UserId),
        WorkItemId = tostring(WorkItemMessage.UniqueId),
        Action = tostring(WorkItemMessage.ActionType)
    | where case(isempty(TargetTenantId), 1 == 1, TenantId == TargetTenantId)
        and case(isempty(TargetUserId), 1 == 1, UserId == TargetUserId)
    | extend Event = "RMS create work item"
    | project env_time, ActivityId, Event, Action, TenantId, UserId, WorkItemId
)
| union (
    MyProvisionRequestTrackEntityStream
    | where Timestamp between (StartTime .. EndTime)
    | extend env_time = Timestamp, Action = ActionType, WorkItemId = UniqueId
    | where case(isempty(TargetTenantId), 1 == 1, TenantId == TargetTenantId)
        and case(isempty(TargetUserId), 1 == 1, UserId == TargetUserId)
    | extend Event = "RMS update work item"
    | project env_time, Event, Action, Status, ErrorCode,
        tostring(TenantId), tostring(UserId), WorkItemId
)
| project env_time, ActivityId, Event, Action, Status, ErrorCode, TenantId, UserId, WorkItemId
| order by env_time asc
```

## Check Citrix Connector for HAADJ
If customers are using HAADJ, make sure Citrix Connector has been installed on VM joined the domain.
See: [Citrix requirements](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/742440/Citrix-HDX-Plus)
