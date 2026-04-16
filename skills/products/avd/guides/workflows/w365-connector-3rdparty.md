# AVD W365 第三方连接器 (Citrix/VMware/HP) — 排查工作流

**来源草稿**: ado-wiki-b-citrix-hdx-plus-resources.md, ado-wiki-b-hp-anyware-resources.md, ado-wiki-b-vmware-blast-resources.md, ado-wiki-citrix-connector-status-check.md, ado-wiki-citrix-hdx-connectivity-check.md, ado-wiki-citrix-hdx-license-status-check.md, ado-wiki-citrix-hdx-provision-status-check.md, ado-wiki-citrix-tenant-onboard-offboard-check.md, ado-wiki-hp-anyware-connectivity-status-check.md, ado-wiki-hp-anyware-provision-status-check.md, ado-wiki-hp-anyware-tenant-onboard-offboard-status.md, ado-wiki-vmware-blast-connectivity-status-check.md, ado-wiki-vmware-blast-general-troubleshooting-tools.md, ado-wiki-vmware-blast-provision-status-check.md
**Kusto 引用**: (无)
**场景数**: 32
**生成日期**: 2026-04-07

---

## Scenario 1: Overview
> 来源: ado-wiki-b-citrix-hdx-plus-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This page summarizes documentation for the Citrix HDX Plus feature from both Citrix and Microsoft sides.

## Scenario 2: Public
> 来源: ado-wiki-b-citrix-hdx-plus-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Requirement](https://learn.microsoft.com/en-ca/windows-365/enterprise/requirements-citrix)
   - [Troubleshooting](https://learn.microsoft.com/en-ca/windows-365/enterprise/troubleshoot-citrix-hdx-plus)

## Scenario 3: Internal Only
> 来源: ado-wiki-b-citrix-hdx-plus-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Citrix + Win365 Provision Flow Spec](https://microsoft.sharepoint-df.com/:w:/t/CloudPCEngineeringTeam/EVrCsNaxzQRPkbRWEVqVmv4BrQX-vtv_FmB-vxrubj9BMw?e=sKynaY)
   - [Supporting Citrix HDX Plus on Windows 365](https://microsoft-my.sharepoint-df.com/:w:/p/mattsha/EfXAXoThcsJIrbHsmtfyZpwBTwmGtpeYSc_zS4dX4Rp_xw?e=bS8eU2)
   - [Citrix Diagram](https://microsoft-my.sharepoint-df.com/:u:/p/mattsha/EQEXYh5tW2NKjPkuhrHBHtcBYFNnbi5KVyWjDNBptHUUEg?e=fGLpzm)
   - [MSFT PM Requirements for Citrix integration](https://microsoft.sharepoint.com/:w:/t/CitrixMicrosoftPlanning-W365Workstream/Eeu8VuaFg2pHjk-0OUTmzKIBWjQZ8_C1w_ts5xCCaogoIg?e=lV3ngv)

## Scenario 4: Citrix Documents
> 来源: ado-wiki-b-citrix-hdx-plus-resources.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Citrix HDX Plus for Windows 365](https://docs.citrix.com/en-us/citrix-hdxplus-w365/citrix-hdxplus-w365.html)

## Scenario 5: Enable the Citrix Connector for Windows 365
> 来源: ado-wiki-citrix-connector-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All customer operations happen inside Microsoft Endpoint Manager (https://endpoint.microsoft.com/).
Reference: [Enable the Citrix Connector for Windows 365](https://docs.citrix.com/en-us/citrix-hdxplus-w365/enable-citrix-connector.html)

## Scenario 6: Check Cloud Connector Event
> 来源: ado-wiki-citrix-connector-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
EPA service logs the Citrix Cloud connector activities into Kusto CloudPC cluster.
```kql
CloudPCEvent
| where env_time > ago(30d)
| where env_cloud_environment =~ "Prod"
| where ComponentName == "UpdateExternalPartnerSettingAsync" or ComponentName == "CreateExternalPartnerSettingAsync"
| where EventUniqueName == "UpdateExternalPartnerSetting" or EventUniqueName == "CreateExternalPartnerSetting"
| extend OperationTime = env_time
| project OperationTime, env_cloud_name, TenantId = AccountId, EnableConnector = Col2
| where TenantId contains "<Customer Azure Tenant Id>"
| sort by OperationTime desc
```
`[来源: ado-wiki-citrix-connector-status-check.md]`
   - `TenantId` = customer Azure tenant Id
   - CloudPC cluster retains events for 30 days only

## Scenario 7: Citrix HDX Connectivity Status Check
> 来源: ado-wiki-citrix-hdx-connectivity-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
HDX protocol is enabled by default in Citrix HDX Plus scenario. If customer encountered HDX related connectivity issues, Citrix support will be the first-tier support for these issues.
Before asking customer to raise support ticket from Citrix side, perform these validations:

## Scenario 8: 1. Turn on RDP Protocol
> 来源: ado-wiki-citrix-hdx-connectivity-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Follow guidance: https://learn.microsoft.com/en-us/windows-365/enterprise/troubleshoot-citrix-hdx-plus#turn-on-the-rdp-protocol
⚠️ Do **not** remove the HDX license from the user of the machine when doing this.

## Scenario 9: 2. Check Registry Key
> 来源: ado-wiki-citrix-hdx-connectivity-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Check the value of `NgsConnected` at:
```
Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\VirtualDesktopAgent
```
   - `value of 1` — connection from Cloud PC to Citrix gateway service is **established**
   - `value of 0` — connection from Cloud PC to Citrix gateway service is **NOT established**

## Scenario 10: 3. Check Citrix Requirements
> 来源: ado-wiki-citrix-hdx-connectivity-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Verify access for named URLs and ports per: https://learn.microsoft.com/en-us/windows-365/enterprise/requirements-citrix#citrix-requirements

## Scenario 11: Customer Experience
> 来源: ado-wiki-citrix-hdx-license-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Citrix HDX Plus feature only supports customers with **Windows365 Enterprise** license.
Customer administrators can follow the guidance [here](https://learn.microsoft.com/en-ca/windows-365/enterprise/assign-licenses) to assign licenses.

## Scenario 12: License Check for Support Team
> 来源: ado-wiki-citrix-hdx-license-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Support team can check Windows365 license status in [RAVE](https://rave.office.net/). Same process as general Windows365 license check.

## Scenario 13: License State Matrix
> 来源: ado-wiki-citrix-hdx-license-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Value | State |
|-------|-------|
| 0 | Assign |
| 1 | Unassign |
| 2 | Refresh / Unknown |
> **Note:** CloudPC cluster only persists events for 30 days.

## Scenario 14: Provisioning Workflow
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. RMS gets the license change event
2. RMS WorkItemDispatcher processes the work items
3. Install the Citrix client in Provision flow (includes Citrix agent extension flow)

## Scenario 15: Check VDA Installer Failures (Kusto)
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where AccountId == "{TenantID}"
| where OtherIdentifiers contains "{UserID}"
| where EventUniqueName == "ExecuteStorageBlobRelatedRequestWithFallbackAsync(Ln: 155)"
| where OtherIdentifiers contains "Command execution finished, but failed because it returned a non-zero exit code"
| project env_time, AccountId, ActivityId, TruncatedId = Col1, OtherIdentifiers
```
`[来源: ado-wiki-citrix-hdx-provision-status-check.md]`
Expand truncated messages:
```kql
let truncatedID = "{TruncatedId}";
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where Col1 == truncatedID
| project env_time, AccountId, ActivityId, Truncatedid = Col1, OtherIdentifiers
```
`[来源: ado-wiki-citrix-hdx-provision-status-check.md]`

## Scenario 16: Citrix VDA Installer Exit Codes
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 17: From Kusto Log
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-citrix-hdx-provision-status-check.md]`

## Scenario 18: From Cloud PC
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Review VDA installation logs:
   - `%temp%/Citrix/XenDesktop Installer`
   - `C:\Windows\Temp\Citrix\XenDesktop Installer`
   - `C:\Windows\SystemTemp\Citrix\XenDesktop Installer`
   - Review Event Viewer: `Windows Logs > Applications > Citrix VDA Upgrade Agent Service`

## Scenario 19: EPA → User → RMS (Install/Uninstall on Existing CPCs) Log
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-citrix-hdx-provision-status-check.md]`

## Scenario 20: Check Citrix Connector for HAADJ
> 来源: ado-wiki-citrix-hdx-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If customers are using HAADJ, make sure Citrix Connector has been installed on VM joined the domain.
See: [Citrix requirements](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/742440/Citrix-HDX-Plus)

## Scenario 21: Tenant Onboard Experience
> 来源: ado-wiki-citrix-tenant-onboard-offboard-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All customer operations will happen inside Citrix DaaS full configuration console.
Reference: [Connect Azure Active Directory to Citrix Cloud](https://docs.citrix.com/en-us/citrix-hdxplus-w365/connect-aad-cloud.html)
Once the operation finished, an API request will be sent to the EPA service.

## Scenario 22: Check Tenant Onboard Event
> 来源: ado-wiki-citrix-tenant-onboard-offboard-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
EPA service will log the Citrix tenant activities into Kusto CloudPC cluster (https://cloudpc.eastus2.kusto.windows.net).
```kql
CloudPCEvent
| where env_time > ago(30d)
| where env_cloud_environment =~ "Prod"
| where EventUniqueName == "Onboard"
| where Col1 == "Start to handle partner Citrix"
| extend onboardTime = env_time
| project onboardTime, env_cloud_name, TenantId = ContextId, ActivityId
| where TenantId contains "<Customer Azure Tenant Id>"
| sort by onboardTime desc
```
`[来源: ado-wiki-citrix-tenant-onboard-offboard-check.md]`
   - `TenantId` will be the Id of customer Azure tenant.
   - CloudPC cluster will only persist event for 30 days.

## Scenario 23: Connectivity Workflow
> 来源: ado-wiki-hp-anyware-connectivity-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
There will be 4 steps for HP Anyware connectivity scenario. HP will be responsible for **all** steps:
1. **[HP]** User authenticates against Azure AD, on-prem AD or 3P IDP
2. **[HP]** Connection is established via HP protocol to HP cloud gateway
3. **[HP]** Cloud PCs assigned to the user available in web/desktop portals
4. **[HP]** Connection is established via HP into Cloud PC

## Scenario 24: Overall Provisioning Workflow
> 来源: ado-wiki-hp-anyware-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
There will be 7 steps in the provisioning process.
   - **[HP]** User is licensed in the HP cloud portal
   - **[HP]** UserId + LicenseState + Token sent to W365
   - **[W365]** UserId + LicenseSate + Token stored in W365 until TTL expires
   - **[W365]** Provisioning/post-provisioning executes HP agent install
   - **[W365]** HP agent installed using JWT token
   - **[HP]** HP agent registers into HP service using JWT token
   - **[HP]** CPC registered and available in HP cloud portal
From the workflow, we can see the main responsibilities from W365 is to install HP agent.

## Scenario 25: HP Agent Installation Flow
> 来源: ado-wiki-hp-anyware-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
EPM(External Partner Management) service will be responsible to send HP agent installation event to CMD Agent via DeviceGateway service and monitor the lifecycle of HP agent installation.

## Scenario 26: Troubleshooting HP Agent License Assignment Issue
> 来源: ado-wiki-hp-anyware-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. How to know if HP's license request has been operated completely? If it failed in some step?
You can query the detail by **userId** or **cloudPcId**. And then troubleshoot by time and operation.
```kql
// Query by user id
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where UserId == "<userId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| order by env_time desc
| project env_time, BuildVersion, env_cloud_name, env_cloud_roleVer, AccountId, ApplicationName, ComponentName, EventUniqueName, ActivityId, RelatedActivityId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, PayLoadId, OtherIdentifiers, DeviceId
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`
```kql
// Query by Cloud PC id
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where OtherIdentifiers contains "<cloudPcId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| order by env_time desc
| project env_time, env_cloud_name, env_cloud_roleVer, AccountId, ApplicationName, ComponentName, EventUniqueName, ActivityId, RelatedActivityId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, PayLoadId, OtherIdentifiers
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`
2. How to know if user has received a assignment for HP license
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where EventUniqueName == "ReceivedPartnerUserMessage"
| where ApplicationName == "epa"
| where UserId == "<userId>"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| sort by env_time desc
| where env_time between (datetime(<start>) .. datetime(<end>))
| project env_time, UserId, Col1
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`

## Scenario 27: Troubleshooting HP Agent Installation Issue
> 来源: ado-wiki-hp-anyware-provision-status-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When a user has issue about the HP agent (un|re)installation failure:
1. Get the **message Id** from "Col1":
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where EventUniqueName == "PartnerDataUploadMessageRecordedAndQueued"
| where ApplicationName == "epa"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| where env_time between (datetime(<start>) .. datetime(<end>))
| sort by env_time desc
| project ColMetadata, Col1, Col2, AccountId
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`
2. Check if the message had been processed successfully:
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epa"
| where Col1 == "<messageId>"
| project env_time, AccountId, UserId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`
3. Query the operation detail by userId, get the **action Id** from "Col1":
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where AccountId == "<tenantId>"
| where PayLoadId == "33391b76-c73e-481e-942a-dc97e887cb0b" // HP PayloadId
| where UserId == "<userId>"
| where env_time between (datetime(<start>) .. datetime(<end>))
| sort by env_time desc
| project env_time, AccountId, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`
4. Query if the operation executed successfully:
```kql
cluster('https://cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| union cluster('https://cloudpc.eastus2.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "epm"
| where ComponentName != "ExternalPartnerActionEntityTransformer"
| where Col1 == "<actionId>"
| where env_time > ago(30d)
| sort by env_time asc
| project env_time, ComponentName, EventUniqueName, AccountId, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, env_cloud_name, ActivityId, UserId
```
`[来源: ado-wiki-hp-anyware-provision-status-check.md]`

## Scenario 28: Overall Tenant Onboard Workflow
> 来源: ado-wiki-hp-anyware-tenant-onboard-offboard-status.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All customer operations will happen inside HP admin portal.
Once the operation finished, an API request will be sent to our EPA (External Partner API) service.

## Scenario 29: Check Tenant Onboard Status
> 来源: ado-wiki-hp-anyware-tenant-onboard-offboard-status.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Check the connector status from Tenant Admin→Connectors and tokens→Windows365 partner connectors and make sure the status is healthy.

## Scenario 30: Azure Network Connection canary checks
> 来源: ado-wiki-vmware-blast-general-troubleshooting-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
For customers using HAADJ and/or BYO networks, the Azure Network Connection (ANC) health checks can still be helpful. ANC health checks will validate external connectivity, internal DNS and Domain Controller access. This may help customers/VMware understand if the Cloud PC connectivity should be working as expected, and rule out some issues on the customers BYO vNet.

## Scenario 31: Enable RDP for troubleshooting
> 来源: ado-wiki-vmware-blast-general-troubleshooting-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
VMware BLAST will automatically block Remote Desktop connectivity when installed to ensure there is no easy security bypass of BLAST. However, any user that is added to the Local Administrators of a machine may connect via BLAST or RDP. This means we have a simple way to enable RDP for troubleshooting purposes - just add the Cloud PC user to the Local Administrators.
This can be done in many ways: in the Windows 365 Local Admin feature, via Intune Local Admin policy, or via Group Policy.
Once the user has been enabled for Local Administrator, connect to the Cloud PC using the Remote Desktop app and begin troubleshooting BLAST related connectivity issues.

## Scenario 32: Retry VMware BLAST enablement
> 来源: ado-wiki-vmware-blast-general-troubleshooting-tools.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If BLAST has not been enabled correctly, the customer can force a BLAST onboarding manually by:
   - Remove the VMware license from the Windows 365 node in the VMware Cloud admin console
   - Wait 10 minutes for the offboarding event to process in Windows 365
   - Re-add the VMware license from the Windows 365 node in the VMware Cloud admin console
   - Wait 20-30 minutes for the onboarding event to process in Windows 365
   - Retry connecting via BLAST. If successful, the installation and onboarding has completed correctly. If unsuccessful, contact MSFT support to help diagnose the BLAST installation failure.
