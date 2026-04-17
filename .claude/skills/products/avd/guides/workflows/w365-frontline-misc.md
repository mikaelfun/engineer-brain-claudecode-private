# AVD W365 Frontline 一线员工 - 杂项 — 排查工作流

**来源草稿**: ado-wiki-autopilot-dpp-w365-setup-guide.md, ado-wiki-citrix-hdx-frontline-dedicated.md, ado-wiki-cloud-apps-dpp-fls-setup-guide.md, ado-wiki-fls-devices-automatically-reset-scoping-questions.md, ado-wiki-fls-dpp-successful-event-kusto.md, ado-wiki-fls-provisioning-policy-details-kusto.md, ado-wiki-frontline-shared-dpp-troubleshooting.md, ado-wiki-resize-frontline-dedicated-scoping-questions.md, ado-wiki-resize-frontline-dedicated-setup-guide.md, ado-wiki-session-state-retention-fld-scoping-questions.md, ado-wiki-session-state-retention-fld-setup-guide.md, ado-wiki-session-state-retention-fld-troubleshooting.md, ado-wiki-w365-fls-devices-reset-setup-guide.md, ado-wiki-w365-frontline-concurrency-report.md, ado-wiki-w365-frontline-intelligent-prestart.md, ado-wiki-w365-frontline-oce-api.md, ado-wiki-w365-frontline-shared-overview.md, ado-wiki-w365-frontline-worker-tsg.md, ado-wiki-windows-365-frontline-overview.md
**Kusto 引用**: (无)
**场景数**: 96
**生成日期**: 2026-04-07

---

## Scenario 1: Feature Description
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows 365 integrates Autopilot Device Preparation policy (DPP) allowing IT admins to define which device-targeted applications and scripts must be installed during provisioning and available to users immediately.

## Scenario 2: Known Issues and Limitations
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - ESP not compatible with DPP
   - **Device Preparation works only with Windows 11 Images. Windows 10 Images are not supported!**
   - Win32 and Store Winget apps show as "Skipped" in DPP Report when Managed Installer is enabled on the tenant (apps still install, just not tracked in report)

## Scenario 3: DPP Components Flow
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **DppProvisionOrchestrator (EntryPoint)** - Receives batch provisioning requests, coordinates overall workflow
2. **PrepareDPPContextActivity** - Prepares context and metadata for batch processing
3. **DppProvisionSubOrchestrator (n instances)** - One per device, manages individual device provisioning lifecycle, retries network errors with 15min timeout
4. **TriggerDppProvisionActivity** - Initiates DPP provisioning for a single device via RdBrokerClient
5. **QueryDppProvisionResultActivity (n polling)** - Polls provisioning status until completion/failure/timeout
6. **RdBrokerClient** - Interface to AVD RD Broker for trigger and query operations

## Scenario 4: Step 1: Create a Device Group for Cloud PCs
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Set **Intune Provisioning Client** as the Group Owner
   - Ref: [MS Learn - Create device group](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#create-a-device-group)

## Scenario 5: Step 2: Assign Intune Apps/Scripts to Device Group
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Apps must be **System installed** (install when no user profiles exist)
   - Assign to Device Group as **Required**
   - Supported: LOB, Win32, Microsoft Store, Microsoft 365, PowerShell Scripts

## Scenario 6: Step 3: Create Device Preparation Policy in Intune
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Select **"Automatic (Preview)"** (formerly "Agent Driven")
   - Note: "User Driven" only works for physical devices, NOT for FLS Cloud PCs
   - Choose the device group and apps/scripts

## Scenario 7: Step 4: Create Cloud PC Provisioning Policy
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Select DPP profile from dropdown under Configuration tab
   - Set timeout (generally 30 minutes; longer for large/dependency chain apps)
   - Option to prevent user connection on installation failure/timeout

## Scenario 8: Step 5: DPP Reporting
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Intune → Devices → Monitor → Windows Autopilot device preparation deployments
   - Click entry to see per-app/script deployment results

## Scenario 9: Support Boundaries & Case Handling
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Provisioning failures due to DPP failing steps** (App/Script deployment errors) → **Intune case**
2. **CPC Provisioned without errors but missing from DPP Report** → Win365 owns initially, check if DPP config present in provisioning policy + kusto
3. **CPC Provisioned with Warnings related to DPP** → Scope to determine Win365 vs Intune ownership

## Scenario 10: Escalation Path (Windows 365)
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - CSS raises CRI to **Windows 365 SaaF Team**
   - Enterprise/FLD DPP Issues → **WCX Device Action**
   - RDAgent side issues → **CloudPC Policy and Cloud App management**
   - CD agent functionality → **CloudPC Policy and Cloud App management**
   - FLS DPP issues with CD Agent → **CloudPC Policy and Cloud App management**

## Scenario 11: Provisioning Service States
> 来源: ado-wiki-autopilot-dpp-w365-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Code | State |
|------|-------|
| 0 | NotStarted |
| 1 | Running |
| 2 | PendingRetry |
| 3 | PendingReboot |
| 4 | PendingRebootRetry |
| 5 | PostReboot |
| 6 | Completed |
| 7 | Failed |
| 8 | NotApplicable |

## Scenario 12: Architecture
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Customer needs both Citrix tenant and Azure tenant
   - Citrix agent installed in VM, HDX protocol is active
   - RD agent installed in VM but remains **inactive** (RDP only for troubleshooting)
   - Engineering team built a partner API for license management
   - Partners Dev integrate their APIs with FLW partner API and Graph API

## Scenario 13: Frontline Cloud PC Integration Key Points
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Handle start and stop API calls for frontline cloud PC sessions
   - Detect user connect and disconnect events using 3rd party or Windows APIs

## Scenario 14: Power State and License Consumption
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Power state is internal optimization; main concern is license consumption (incremented by start, decremented by stop)
   - When user disconnects → license released → CPC state changes to "inStandbyMode"
   - CPC remains running for **2 hours** after disconnect
   - If no reconnect within 2 hours → CPC deallocated (powered off) → state "unassigned"
   - If user connects within 2 hours ("warm start") → CPC state changes to "Active"
   - Partner responsible to call "Start" API when connecting
   - If connected without calling "Start" API → services detect connection and change state to "Active"

## Scenario 15: Idle Timeout and Disconnect Timeout
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Use respective policies to set idle timeout and disconnect timeout
   - Call stop API when either event occurs

## Scenario 16: Start CloudPC
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
POST https://graph.microsoft.com/beta/me/cloudPCs/{cloudPCId}/start
```
Response accessState values:
   - `Activating` - CloudPC is powering on (up to 3 min)
   - `Active` - CloudPC is powered on and ready to connect
   - `NoLicensesAvailable` - No license available, user may retry
Use `CloudPC/getfrontlineWorkCloudPcAccessState` API to check activation status.

## Scenario 17: Stop CloudPC
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```
POST https://graph.microsoft.com/beta/me/cloudPCs/{cloudPCId}/stop
```
   - Releases license immediately and puts CPC in Standby mode
   - Without stop call, IDS service powers off CPC as backup (up to 30 min delay, license stays acquired)

## Scenario 18: Kusto Queries
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Leverage existing FLD Kusto queries for Citrix HDX integration with FLD scenario:
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine

## Scenario 19: MS Graph API Docs
> 来源: ado-wiki-citrix-hdx-frontline-dedicated.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Start CPC: https://learn.microsoft.com/en-us/graph/api/cloudpc-start
   - Check State: https://learn.microsoft.com/en-us/graph/api/cloudpc-getfrontlinecloudpcaccessstate
   - Get Launch Info: https://learn.microsoft.com/en-us/graph/api/cloudpc-getcloudpclaunchinfo
   - Stop CPC: https://learn.microsoft.com/en-us/graph/api/cloudpc-stop

## Scenario 20: Instructions
> 来源: ado-wiki-cloud-apps-dpp-fls-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Create a Windows Autopilot device preparation policy (DPP) using this tutorial: [Overview for Windows Autopilot device preparation in automatic mode for Windows 365 (preview) in Intune | Microsoft Learn](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/automatic/automatic-workflow)
In Step 3 - You can include any Windows apps in your device group assignment + DPP. However, note that Cloud Apps can only discover .exes with shortcuts in the Start Menu; Cloud Apps cannot discover UWP apps even if they successfully install.
In Step 5 - for **Experience**, select "Access only apps." In **Configuration**, under **Windows Autopilot (Preview)** select "Prevent users from connection to Cloud PC upon installation failure or timeout" to ensure apps have installed on Cloud PCs before Cloud App discovery happens.
Once the policy is created, in "All Cloud PCs", you should see the Cloud PCs provisioning. In "All Cloud Apps," there will be a row "Preparing" for your policy.
Once there is a Cloud PC provisioned, Cloud Apps discovered on the Cloud PC's Start Menu will populate the "All Cloud Apps" list.
You can take Cloud App actions (i.e. publish, edit) and connect to published Cloud Apps.

## Scenario 21: Known limitations
> 来源: ado-wiki-cloud-apps-dpp-fls-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - DPP: [Windows Autopilot device preparation known issues | Microsoft Learn](https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues)
   - Cloud Apps won't discover all apps in the Start Menu. You will not see AppX packages, such as Teams, new Outlook, Paint, Notepad, etc.
   - After initial provisioning, if you want to add additional Intune apps as Cloud Apps to an existing policy, then you need to add the Intune app(s) to the device group + DPP and reprovision the collection for the app(s) to appear in "All Cloud Apps" for publishing.

## Scenario 22: 1. Environment & Configuration
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is this Cloud PC provisioned as **Windows 365 Frontline Shared mode**?
   - Is the issue affecting **all Frontline Shared Cloud PCs** or only specific devices/users?
   - Are these Cloud PCs managed through **Microsoft Intune** and **Microsoft Entra ID**?
   - Are any **custom provisioning policies, scripts, or postprovisioning tasks** applied to these devices?
   - Has **User Experience Sync (UES)** been enabled for this Frontline policy, or is full nonpersistence expected?
_Helps determine baseline eligibility and whether behavior aligns with expected FLS design._

## Scenario 23: 2. User Scenario / User Experience
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What is the **exact user expectation** after signout (clean device vs. data persistence)?
   - What specific **data, settings, or applications** are users expecting to remain after they sign out?
   - Does the issue occur **immediately after signout**, or only after the next user signs in?
   - Are users aware that **local files, personalization, and session state do not persist by design**?
_Quickly surfaces expectation mismatch vs. actual product behavior._

## Scenario 24: 3. Scope & Impact
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many users are impacted (single user, group, entire frontline workforce)?
   - Is this blocking **core frontline workflows**, or is it primarily a usability/expectation concern?
   - Does this impact **production scenarios**, or is it limited to testing/pilot environments?
   - Is there a **business-critical dependency** on data persisting between shared sessions?
_Supports severity assessment and prioritization._

## Scenario 25: 4. Reproducibility
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Can the issue be **reproduced consistently** using the same signin / signout flow?
   - Does the reset occur **after every signout**, or only intermittently?
   - Does the behavior reproduce across **multiple Cloud PCs** in the same policy?
   - What is the **approximate reset time** observed after signout?
_Determines if this is deterministic design behavior or intermittent anomaly._

## Scenario 26: 5. Expected vs. Actual Behavior Validation
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - After signout, does the Cloud PC return to a **known-good baseline snapshot**?
   - Are **applications and policies restored correctly** after reset?
   - Is any **user data unexpectedly persisting**, or is data being removed as designed?
   - Is the concern that data **should persist**, or that it **should not but does**?
_Critical for distinguishing configuration issues from correct nonpersistent behavior._

## Scenario 27: 6. Recent Changes
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Were there any **recent changes** to provisioning policies, licensing, or Frontline assignments?
   - Was this behavior observed **since first deployment**, or did it start recently?
   - Have there been any **recent Intune, Entra, or Windows image updates**?
_Helps identify regressions vs. longstanding design behavior._

## Scenario 28: 7. Logs, Evidence & Technical Data
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Do you see any **reset-related events** around user signout in device or Intune logs?
   - Can you capture **timestamps** for signout, reset start, and next signin?
   - Are there screenshots or recordings showing **before signout vs. after reset state**?
   - Are there any **errors or failures** during the reset process?
_Supports escalation readiness if behavior deviates from expected design._

## Scenario 29: 8. Workarounds / Mitigations
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Have users been advised to store data in **OneDrive, SharePoint, or other cloud storage**?
   - Would enabling **User Experience Sync (UES)** meet the business requirement for persistence?
   - Is there a need to reassess whether **Frontline Shared** is the correct deployment model for this use case?
_Keeps cases moving forward even when behavior is by design._

## Scenario 30: 9. Product vs. Configuration Validation (Key CSS Pivot)
> 来源: ado-wiki-fls-devices-automatically-reset-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Based on expectations, is the customer seeking **nonpersistent behavior**, or actual persistence?
   - Is the reported issue aligned with the **documented design of True NonPersistence FLS**?
   - Is this best addressed through **education/documentation**, **configuration change**, or **product escalation**?
_Drives fast decision-making and correct routing._

## Scenario 31: Step 1: Get the Workload ID using the CPC Name
> 来源: ado-wiki-fls-dpp-successful-event-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(3h)
| where Tags contains "<CPC Name>"
| project TIMESTAMP, Operation, Tags, WorkflowId
| order by TIMESTAMP desc
| limit 6000
```
`[来源: ado-wiki-fls-dpp-successful-event-kusto.md]`

## Scenario 32: Step 2: Using the Workflow ID, lookup the final message
> 来源: ado-wiki-fls-dpp-successful-event-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(3h)
| where WorkflowId == "<WORKFLOW ID>"
| where ServiceName == "identityrm"
| project TIMESTAMP, env_time, ServiceName, LatencyMilliseconds, Tags, EventIdName, StatusCode, Operation, Classification, WorkflowId, Exception, env_ex_type, env_ex_msg
| order by TIMESTAMP desc
```
`[来源: ado-wiki-fls-dpp-successful-event-kusto.md]`

## Scenario 33: Step 3: Use RDInfraTrace for complete DPP provisioning flow
> 来源: ado-wiki-fls-dpp-successful-event-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let startTime = ago(3h);
let endTime = now();
let caredCatergories = dynamic(["RDAgent.DPPProvisioningService.DPPProvisioningService","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.OrchestratorClient","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.AutopilotHelper"]);
cluster('rdsprodus.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprod.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprodeu.westeurope').database('WVD').RDInfraTrace
| union cluster('rdsprodjp.japaneast').database('WVD').RDInfraTrace
| union cluster('rdsprodgb.uksouth').database('WVD').RDInfraTrace
| union cluster('rdsprodau.australiaeast').database('WVD').RDInfraTrace
| union cluster('rdsprodin.centralindia').database('WVD').RDInfraTrace
| where TIMESTAMP >= ago(3h)
| where Slot == "RDAgent"
| where Category in (caredCatergories)
| where HostInstance contains "<CPC NAME>"
| order by PreciseTimeStamp desc
| limit 1000
```
`[来源: ado-wiki-fls-dpp-successful-event-kusto.md]`

## Scenario 34: Get Activity ID from enrollment attempt (using Intune Device ID):
> 来源: ado-wiki-fls-dpp-successful-event-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where FunctionName == "SaveClientIdentity"
| where DeviceId == "<INTUNE Device ID>"
| project ActivityId, env_time
```
`[来源: ado-wiki-fls-dpp-successful-event-kusto.md]`

## Scenario 35: Check DPP enrollment details using Activity ID:
> 来源: ado-wiki-fls-dpp-successful-event-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where ActivityId == "<ACTIVITY_ID>"
| where ComponentName == "AutopilotV2EnrollmentHelper"
| project env_time, ActivityId, BuildVersion, FunctionName, ComponentName, TraceLevel, LineNumber, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Message
| order by env_time desc
```
`[来源: ado-wiki-fls-dpp-successful-event-kusto.md]`
**Key validation**: The Device Preparation Profile ID in Col1 must match the profile ID assigned in the Frontline Shared provisioning policy in Intune.
Check in Intune → Enrollments → Monitor → Windows Autopilot device preparation deployments for the CPC entry, which shows Profile Name and Apps/Scripts install status.

## Scenario 36: Kusto Query 1: Standard Policy Details (from aka.ms/cpcd)
> 来源: ado-wiki-fls-provisioning-policy-details-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Requires provisioning policy ID.
```kql
let PolicyID = '<PROV Policy ID>';
let _endTime = now();
let _startTime = ago(7d);
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time >= _startTime and env_time < _endTime
| where Col1 contains "Got provisioning policy:" and Col1 contains PolicyID and Col1 contains "EnableSingleSignOn"
| parse kind=regex flags=Ui Col1 with * "Got provisioning policy: {\"Id\":\"" ProvPolicyID '\",' *
| parse kind=regex flags=Ui Col1 with * "\"EnableSingleSignOn\":" SSOState ',' *
| parse kind=regex flags=Ui Col1 with * "\"ImageId\":" CustomImageID ',' *
| parse kind=regex flags=Ui Col1 with * "\"ImageType\":" OSImageType ',' *
| parse kind=regex flags=Ui Col1 with * "\"OnPremisesConnectionId\":" ANCID '}],' *
| parse kind=regex flags=Ui Col1 with * "\"domainJoinType\":" JoinType ',' *
| parse kind=regex flags=Ui Col1 with * "\"locale\":" CustomLP '},' *
| parse kind=regex flags=Ui Col1 with * "\"ProvisioningType\":" LicenseType ',' *
| parse kind=regex flags=Ui Col1 with * "\"CloudPcNamingTemplate\":" NamingTemplate ',' *
| parse kind=regex flags=Ui Col1 with * "\"regionName\":" RegionName ',' *
| parse kind=regex flags=Ui Col1 with * "\"regionGroup\":" RegionGroup '}],' *
| extend LicenseType = iif(LicenseType has "\"dedicated\"", "Enterprise", "FrontLine")
| extend OSImageType = iif(OSImageType has "0", "Gallery", "Custom")
| extend RegionName = iif(isempty(RegionName), "Check VNET Region", RegionName)
| extend RegionGroup = iif(isempty(RegionGroup), "Check VNET Region", RegionGroup)
| extend ANCID = iif(isempty(ANCID), "MSHosted", ANCID)
| project env_time, ProvPolicyID, SSOState, CustomImageID, OSImageType, ANCID, JoinType, CustomLP, LicenseType, NamingTemplate, RegionName, RegionGroup, Col1, ActivityId
| order by env_time desc
```
`[来源: ado-wiki-fls-provisioning-policy-details-kusto.md]`
**Note**: For Frontline Shared, Col1 will show additional APv2 Device Preparation entries if configured.

## Scenario 37: Kusto Query 2: Scheduled Reprovisioning Configuration
> 来源: ado-wiki-fls-provisioning-policy-details-kusto.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Shows the Scheduled Reprovisioning configuration when set or modified (visible within 30 days of change).
```kql
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(30d)..now())
| where Col1 contains "<PROV Policy ID>"
| where Col1 contains "Enter SchedulePolicyApplyTask"
| parse Col1 with * ", policy id: " ProvPolicyID ',' *
| parse Col1 with * "\"reservePercentage\":" ReservedPercentage ',' *
| parse kind=regex flags=Ui Col1 with * "\"cronScheduleExpression\": \"" CRONSchedule '\"' *
| extend CRON = CRONSchedule
| project env_time, ActivityId, ProvPolicyID, ReservedPercentage, CRON
```
`[来源: ado-wiki-fls-provisioning-policy-details-kusto.md]`
The CRON expression defines when scheduled reprovisioning occurs (e.g., "At 2:00 On every Monday every month").

## Scenario 38: Prerequisites Check
> 来源: ado-wiki-frontline-shared-dpp-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Is the Device Preparation Profile created as **Automatic (Preview)** and assigned to the device group?
   - Reference: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/automatic/automatic-workflow
2. Is the device group Owner set to **Intune Provisioning Client** (AppId: `f1346770-5b25-470b-88bd-d5744ab7952c`)?
   - In some tenants the SP name may be "Intune Autopilot ConfidentialClient" - verify by AppID
   - If missing, add it: https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#adding-the-intune-provisioning-client-service-principal
3. Is the DPP profile added in the Frontline Shared provisioning policy?

## Scenario 39: Diagnostic Steps
> 来源: ado-wiki-frontline-shared-dpp-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Step 1: Check Provisioning Message (Get WorkflowID)
```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union cluster('https://cdp-gds-global-prod.eastus.kusto.windows.net').database('cdp-gds-global-prod').ServiceEvent
| union cluster('https://cdp-gds-eudb-prod.northeurope.kusto.windows.net').database('cdp-gds-eudb-prod').ServiceEvent;
ServiceEvent
| where env_time > ago(2h)
| where Tags contains "<DEVICE Name>"
| project TIMESTAMP, Operation, Tags, WorkflowId
| order by TIMESTAMP desc
| limit 6000
```
`[来源: ado-wiki-frontline-shared-dpp-troubleshooting.md]`

##### Step 2: Check Autopilot V2 Errors with WorkflowID
```kql
-- Same ServiceEvent union as above --
ServiceEvent
| where env_time > ago(1d)
| where WorkflowId == "<WORKFLOW ID>"
| where ServiceName == "identityrm"
| project TIMESTAMP, env_time, ServiceName, LatencyMilliseconds, Tags, EventIdName, StatusCode, Operation, Classification, WorkflowId, Exception, env_ex_type, env_ex_msg
| order by TIMESTAMP desc
```
`[来源: ado-wiki-frontline-shared-dpp-troubleshooting.md]`
**Expected Error:** `DPP is not enabled for this machine. Error Code: DppNotEnabled`

##### Step 3: Validate Intune DPP Profile Assignment
```kql
-- Get ActivityID --
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where FunctionName == "SaveClientIdentity"
| where DeviceId == "<INTUNE Device ID>"
| project ActivityId, env_time

-- Check DPP response --
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where ActivityId == "<Activity ID>"
| where ComponentName == "AutopilotV2EnrollmentHelper"
| project env_time, ActivityId, BuildVersion, FunctionName, ComponentName, TraceLevel, LineNumber, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Message
| order by env_time desc
```
`[来源: ado-wiki-frontline-shared-dpp-troubleshooting.md]`
**Expected Error in Col1:** `Not trying to update device lookup result either because the authority is not Intune or because a device preparation profile is not assigned`

## Scenario 40: Resolution
> 来源: ado-wiki-frontline-shared-dpp-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If configuration from CPC side looks correct, **engage Intune Collab** for service-side DPP profile assignment issues.

## Scenario 41: 2. User Scenario / UX
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - From the admin perspective, **what exactly fails** during the resize experience?
   - Does the admin see the resize **start, fail immediately, or fail midprocess**?
   - Can the user still **sign in to the original Cloud PC**?
   - Is the Cloud PC **stuck, inaccessible, or degraded** after the resize attempt?
   - Is this affecting **shift workers actively using the Cloud PC**, or during an off-shift window?

## Scenario 42: 5. Recent Changes
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - License reassignment or SKU changes?
   - Group membership updates?
   - New Cloud PC provisioning?
   - Was the Cloud PC **recently reprovisioned or restored**?
   - Has this tenant recently transitioned to **Resize V2 behavior**?

## Scenario 43: 6. Resize Execution & State Validation
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What is the **resize job status** shown in Microsoft Endpoint Manager?
   - Does the resize progress beyond VM shutdown / Snapshot creation / New VM creation?
   - Does the Cloud PC return to **Provisioned** state after the attempt?

## Scenario 44: 7. Errors, Logs & Evidence
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Are there **error codes or failure categories** shown in the resize action?
   - Does the failure indicate capacity issues, invalid disk size (downsize), or VM agent/extension failures?
   - Collect: Resize action timestamps, Cloud PC name / Device ID, screenshots

## Scenario 45: 8. Workarounds & Mitigations
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Have you attempted a **single retry** of the resize operation?
   - If using GBL, validate **license assignment state** before retrying
   - Does reprovisioning the Cloud PC resolve the issue?
   - Test resizing a **different Cloud PC** in the same tenant

## Scenario 46: 9. Validation & Next Steps (CSS Internal)
> 来源: ado-wiki-resize-frontline-dedicated-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is this consistent with **known resize limitations** (Gen 1, disk downsize, license conflicts)?
   - Configuration/sequencing issue vs capacity-related failure vs potential backend resize bug?
   - Next steps: Retry after validation, License/assignment correction, or Escalation with resize job evidence

## Scenario 47: Steps
> 来源: ado-wiki-resize-frontline-dedicated-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431)
   - Select **Devices** > **Windows 365** > **Provisioning policies**
2. Select a provisioning policy that includes an assignment with the Windows 365 Frontline Cloud PCs in dedicated mode that you want to resize
3. On the policy page, select **Edit** next to **Assignments**
4. On the **Assignments** tab, in the **Cloud PC size** column, select the Cloud PC Frontline entry that you want to resize. All Cloud PCs in the assignment will be resized.
5. In the **Select Cloud PC size** pane, under **Available sizes**, select the new Cloud PC size > **Next**. The process might take ~20 minutes.
6. On the **Assignments** page, select **Next**
7. On the **Review + save** tab, select **Update** to initiate the resize
**Note:** The action Resize for Frontline Dedicated mode is not eligible for a partial resize. It must reassign the entire group based license.

## Scenario 48: 6. Logs & Evidence
> 来源: ado-wiki-session-state-retention-fld-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Can you confirm the exact time window when the disconnect and reconnect occurred?
   - Can you provide the Cloud PC name, user UPN, tenant ID, and provisioning policy ID?

## Scenario 49: 7. Workarounds
> 来源: ado-wiki-session-state-retention-fld-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Does reconnecting again restore the session, or does it remain reset?
   - Does reconnecting from a different client change the behavior?
   - If the user disconnects instead of signing out, does behavior improve?

## Scenario 50: 8. Triage Decision Support
> 来源: ado-wiki-session-state-retention-fld-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Configuration issue: Requirements or client mismatch
   - Known limitation: Preview scope, reboot behavior, unsupported image/size
   - Potential product issue: Meets all requirements, consistent repro, no reboot

## Scenario 51: Step by Step
> 来源: ado-wiki-session-state-retention-fld-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Confirm Cloud PC is Windows 365 Frontline in Dedicated Mode
2. Verify OS is Windows 11 24H2 or newer using Gallery Image
3. Verify compute size meets minimum (4vCPU/16GB/128GB)
4. Ensure Cloud PC is in a supported region
5. Ensure user connects using a supported Windows App client
6. This feature does not require an IT admin configuration as will be applied in wide tenants
7. Confirm provisioning policy is targeted for state retention

## Scenario 52: What CSS should verify
> 来源: ado-wiki-session-state-retention-fld-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - User disconnects (does not sign out completely)
   - Apps remain open after disconnecting
   - After some time, reconnect restores session state
   - System clock updates to current local time

## Scenario 53: What "good" looks like
> 来源: ado-wiki-session-state-retention-fld-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Apps remain open
   - Session resumes without full reboot
   - User productivity is uninterrupted

## Scenario 54: High-level CSS guidance
> 来源: ado-wiki-session-state-retention-fld-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Confirm eligibility (Dedicated Mode, OS, size, region)
2. Confirm provisioning policy targeting
3. Validate client type used
4. Reproduce by disconnecting (not signing out)
5. Reconnect after several hours
6. Observe whether apps and session state persist

## Scenario 55: Logs
> 来源: ado-wiki-session-state-retention-fld-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Run in command prompt to collect sleep study logs:
```cmd
Powercfg /sleepstudy
```
Report path: `C:\Users\<username>\sleepstudy-report.html`

## Scenario 56: PowerShell Diagnostic Script
> 来源: ado-wiki-session-state-retention-fld-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Execute `.\CheckFLDStateRetentionStatus` in PowerShell to get Pass (green) or Not Pass (Red).
Log location: `C:\Users\<username>\AppData\Local\Temp\W365FLD-StateRetention-Diag_<date>_<hour>.log`
Monitor whether State Retention is **Active** and review current session data.

## Scenario 57: Step 1: Provision Frontline Shared Cloud PC
> 来源: ado-wiki-w365-fls-devices-reset-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Verify a Frontline Shared Cloud PC is provisioned successfully
   - Confirm device reaches Provisioned state in the portal

## Scenario 58: Step 2: Autopilot Device Preparation
> 来源: ado-wiki-w365-fls-devices-reset-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Ensure required system components are installed:
   - VPN client
   - Security software
   - Configuration scripts

## Scenario 59: Step 3: Capture Restore Point
> 来源: ado-wiki-w365-fls-devices-reset-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Confirm restore point captures the desired known-good system state during post-provisioning

## Scenario 60: Step 4: User Sign-In and Usage
> 来源: ado-wiki-w365-fls-devices-reset-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - User signs in and completes productivity tasks
   - Validate apps are available and functional

## Scenario 61: Step 5: Sign-Out and Reset Validation
> 来源: ado-wiki-w365-fls-devices-reset-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - User signs out
   - Verify automatic reset to restore point completes (~30 seconds)
   - Confirm Cloud PC returns to the available pool

## Scenario 62: Overview
> 来源: ado-wiki-w365-frontline-concurrency-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The Cloud PCs Connected report in Intune provides admins with information regarding the maximum number of FLA/FLS Cloud PCs that can be connected at the same time (i.e. concurrency). This max number of CPCs is determined by the amount of active licenses that the customer has in their tenant.
Moreover, admins can use the assignment feature, to control concurrency at the assignment level of a provisioning policy.
When the maximum concurrency is reached, additional end users cannot connect to their CPCs. If connected users fail to log off, administrators must manually turn off those CPCs to bring back concurrency to acceptable levels and allow incoming shift users to log into their Cloud PCs.

## Scenario 63: Hourly and Daily Trend
> 来源: ado-wiki-w365-frontline-concurrency-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
FlexLicenseUsageEntity_FastStream
| where TenantId == "{customer tenant id}" and DateTimeUTC between ({issue start time} .. {issue end time})
```
`[来源: ado-wiki-w365-frontline-concurrency-report.md]`
Check ClaimedLicenseCount, LicenseCount, BufferSize columns.

## Scenario 64: Currently Connected Devices
> 来源: ado-wiki-w365-frontline-concurrency-report.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CasCloudPcEntity_FastStream
| where TenantId == "{customer tenant id}" and Timestamp between ({issue start time} .. {issue end time})
| project TenantId, ConcurrentAccessGroupId, CloudPCId, Timestamp, State, CreatedDateTimeUTC, DeviceId
```
`[来源: ado-wiki-w365-frontline-concurrency-report.md]`
```kql
CasGroupUserEntity_FastStream
| where TenantId == "{customer tenant id}" and Timestamp between ({issue start time} .. {issue end time})
| project TenantId, ConcurrentAccessGroupId, CloudPCId, Timestamp, State, CreatedDateTimeUTC
```
`[来源: ado-wiki-w365-frontline-concurrency-report.md]`

## Scenario 65: 1. Daily Prestart History (Tenant Level)
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Provides insights into daily prestart history: predicted devices, active/inactive predictions, execution count, success/failure, and improved user experience count.
```kql
let tenantId = "<Placeholder for Tenant ID>";
let cutoffDate = datetime(6-6-2025); // GA date
cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStartPredictionCalculation_Snapshot
| where UsageDate >= cutoffDate
| where TenantId == tenantId
| summarize PredictedDevices=sum(DeviceCount), PredictedActiveDevices=sumif(DeviceCount, PredictedUserActive == "Active"), PredictedInactiveDevices=sumif(DeviceCount, PredictedUserActive == "Inactive") by UsageDate
| join kind=leftouter(
    cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStart_Snapshot
    | where UsageDate >= cutoffDate
    | where TenantId == tenantId
    | summarize ExecutedDevices=sum(DevicesCount), SuccessfullyPrestartedDevices=sumif(DevicesCount, PreStartReasonCode == "Success"), PrestartFailedDevices=sumif(DevicesCount, PreStartReasonCode != "Success") by UsageDate
) on UsageDate
| join kind=leftouter(
    cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStartStopOperations_Snapshot
    | where UsageDate >= cutoffDate
    | where TenantId == tenantId
    | summarize ImprovedUserExperienceCount=sumif(DevicesCount, IsImprovedUserExperience) by UsageDate
) on UsageDate
| project UsageDate, PredictedDevices, PredictedActiveDevices, PredictedInactiveDevices, ExecutedDevices, SuccessfullyPrestartedDevices, PrestartFailedDevices, ImprovedUserExperienceCount
```
`[来源: ado-wiki-w365-frontline-intelligent-prestart.md]`

## Scenario 66: 2. Daily Prestart Failure Breakdown
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let tenantId = "<Placeholder for Tenant ID>";
let cutoffDate = datetime(6-6-2025);
cluster('cpcdeedprptprodgbl.eastus2').database('Reporting').DailyFrontlinePreStart_Snapshot
| where UsageDate >= cutoffDate
| where TenantId == tenantId
| where PreStartReasonCode != "Success"
| summarize DevicesCount = sum(DevicesCount) by UsageDate, PreStartReasonCode
```
`[来源: ado-wiki-w365-frontline-intelligent-prestart.md]`

## Scenario 67: Reason Codes
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Code | Meaning |
|------|---------|
| ExpectedTermination-CloudPCHoldingLicense | User already active and using the machine |
| ExpectedTermination-CloudPCExpectedPowerState | Cloud PC already running, prestart not needed. SkipDeallocationIsEnabled means no deallocation due to capacity outage |
| DeviceActionRequestNotAccepted | Another action already executing on device (e.g., user connect/disconnect) |
| CASUpdateAccessStateFailed | User already active or no more licenses available |
| Cancelled | License removed, Cloud PC in deprovisioning |
| AzureComputeError | AllocationFailed, VmStartTimeOut, or Azure internal errors |
| ExpectedTermination-CloudPCDoesNotExistException | Cannot get workspace from RMS |

## Scenario 68: Query 3: Device Prestart History
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Shows per-device prestart details including prediction, execution time, success/failure, stop workflow, and user experience improvement. Uses multi-cluster union across all regions:
   - NA01: cpccradxigprna01.eastus / cpccradxidprna01.eastus
   - NA02: cpccradxigprna02.centralus / cpccradxidprna02.centralus
   - EU01: cpccradxigpreu01.northeurope / cpccradxidpreu01.northeurope
   - EU02: cpccradxigpreu02.westeurope / cpccradxidpreu02.westeurope
   - AP01: cpccradxigprap01.southeastasia / cpccradxidprap01.southeastasia
   - AU01: cpccradxigprau01.australiaeast / cpccradxidprau01.australiaeast
Tables:
   - `idledetect.DailyFrontlinePreStartPredictionCalculationByDevice_Snapshot`
   - `idledetect.FrontlinePreStartDataEntity_FastStream`
   - `idledetect.DailyFrontlinePreStartStopOperationsByDevice_Snapshot`

## Scenario 69: Query 4: Future Predictions
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Check `idledetect.FrontlinePredictionDataEntity_Snapshot` for DayOfObservation >= today.

## Scenario 70: Query 5: User Activity Check
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If Cloud PC not in prediction results, check if user was active on at least 4 of past 30 days using `idledetect.DailyDeviceActivities15MinAggByDevice_Snapshot`.

## Scenario 71: Notes
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - If user predicted inactive: PredictedPreStartTimeUTC empty, no prestart that day
   - Stop only scheduled after successful prestart (PrestartReasonCode == Success)
   - Empty stop fields = stop cancelled due to user connecting after prestart

## Scenario 72: Escalation
> 来源: ado-wiki-w365-frontline-intelligent-prestart.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - SaaF team: Use PR 13191154 investigation guide
   - Prediction model questions: Contact Sathvik
   - Other questions: Contact Nurlan/Naga/Sandhya

## Scenario 73: Available OCE APIs
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **[CloudPC] Update Concurrent Access CPC Status** by CPC Id
   - **[Config] Update Concurrent Access Configuration** by CloudPCSizeId
   - **[Config][ConsistencyCheck] Run Configuration Consistency Check** for tenant
   - **[Config] Delete Concurrent Access Configuration** by Tenant and CloudPCSizeId

## Scenario 74: JIT Access Preparation
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. If not Torus enrolled, follow SaaF Tours
2. Join **CMDCPCSupport** eligibility at OSP Identity (8 hours provisioning)
3. JIT elevate:
```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"
```
4. **[SAW Enforced]** Navigate to Geneva Action portal, login with Torus account

## Scenario 75: Update CAS using CPC Id
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Path: CloudPC OCE > Concurrent Access Service Actions > [CloudPC] Update CPC Status
   - **Concurrent Access CloudPC Id** = Workspace Id (from CPC Diagnostic Tool)
   - **Tenant ID** = TenantId
   - **Endpoint** = ScaleUnit

## Scenario 76: Update CAS using CloudPCSizeId
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Path: CloudPC OCE > Concurrent Access Service Actions > [Config] Update Configuration
   - **CloudPCSizeId** = ServicePlanId

## Scenario 77: Get ServicePlanId via Kusto
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
DailyTenantEntity_Snapshot
| distinct TenantId, Name, ServicePlanName, ServicePlanId, CapabilityStatus, PrepaidEnabledUnit, PrepaidWarningUnit
| where ServicePlanId in (
    "51855c77-4d2e-4736-be67-6dca605f2b57",
    "aa8fbe7b-695c-4c05-8d45-d1dddf6f7616",
    "64981bdb-a5a6-4a22-869f-a9455366d5bc",
    "50ef7026-6174-40ba-bff7-f0e4fcddbf65",
    "dd3801e2-4aa1-4b16-a44b-243e55497584",
    "2d1d344e-d10c-41bb-953b-b3a47521dca0",
    "48b82071-99a5-4214-b493-406a637bd68d",
    "e4dee41f-a5c5-457d-b7d3-c309986fdbb2",
    "1e2321a0-f81c-4d43-a0d5-9895125706b8",
    "fa0b4021-0f60-4d95-bf68-95036285282a",
    "057efbfe-a95d-4263-acb0-12b4a31fed8d"
)
| where CapabilityStatus == "Enabled"
| summarize TotalLicenses = sum(PrepaidEnabledUnit) + sum(PrepaidWarningUnit) by Name, TenantId, ServicePlanName, ServicePlanId
```
`[来源: ado-wiki-w365-frontline-oce-api.md]`

## Scenario 78: Run Consistency Check
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Path: CloudPC OCE > Concurrent Access Service Actions > [Config][ConsistencyCheck]

## Scenario 79: Delete CAS Configuration
> 来源: ado-wiki-w365-frontline-oce-api.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Path: CloudPC OCE > Concurrent Access Service Actions > [Config] Delete Configuration
   - **CloudPCSizeId** = ServicePlanId

## Scenario 80: Windows 365 Frontline Shared
> 来源: ado-wiki-w365-frontline-shared-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Private Preview: Jun 2024 (2405)
   - Public Preview: Nov 2024 (Ignite)
   - GA: Mar 2025 (2502)
Bug Tracker: https://microsoft.visualstudio.com/OS/_dashboards/dashboard/2d2cd176-afc4-4a31-b296-bfd6bd2bb441

## Scenario 81: Known Issues
> 来源: ado-wiki-w365-frontline-shared-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **"Reprovision" button only works if the policy is edited first**
   - Intune user-targeted workloads are not blocked from applying
   - User driven reset: User must have an active session to use it, and there may be a delay in allowing user to connect to a new CPC in the collection
   - User must have an Intune license for a successful MDM session; if unlicensed it will fail
   - SSO: Users may see an Entra ID consent dialog upon connection

## Scenario 82: Not Applicable FLS CPC Features
> 来源: ado-wiki-w365-frontline-shared-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Boot to Cloud
   - Restore points
   - User setting policy
   - Resize

## Scenario 83: Best Practices
> 来源: ado-wiki-w365-frontline-shared-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Targeting:** Assign Intune workloads to Device Groups to prevent drift. Use filters on user assigned, system-installed apps and policy to keep devices consistent
   - **Fast Logon:** Avoid logon scripts and startup apps (impacts logon time)
   - **Device preparation:** Use Autopilot DPP to prepare devices with device targeted apps and scripts before user arrives. Custom images also supported
   - **Collection sizing:** Know maximum concurrency and right-size collection to avoid users being denied connection

## Scenario 84: Escalation Path (ICM Team)
> 来源: ado-wiki-w365-frontline-shared-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Issue related to CDP: TBD
   - Issue related to FLS Provisioning/Reprovisioning: TBD
   - Issue related to FLS Assignment: TBD
   - Issue related to FLS Concurrency Reporting: TBD

## Scenario 85: The below URL contains TSG/Architecture for Windows 365 Frontline Worker.
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
https://eng.ms/docs/experiences-devices/wd-windows/wcx/cloud-pc/cloudpc-service/concurrent-access-service/frontline/frontline-main

## Scenario 86: **Frontline overview**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Frontline is a Windows 365 offering. Frontline offers customers to buy 1 license and have 3 cloud PCs for 3 users. Only 1 user can work at a time.
https://www.microsoft.com/en/windows-365/frontline
Frontline is the same Windows 365 dedicated cloud PCs, processes but with additional license check when user tries to connect.
This introduces multiple scenarios when and how user can connect and disconnect. When user disconnects from Cloud PC, license is released, and now new user can consume license.

## Scenario 87: **Terminology**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Cold start** - Start when CloudPC is "deallocated" and license is "unassigned". When user connects to the turned off CloudPC.
**Hot start** - Start when CloudPC is "running" and license is "active". When user reconnect in less than 10 mins after user disconnected.
**Warm start** - Start when CloudPC is "running" and license is "inStandbyMode". When user reconnect after more than 10 mins after user disconnected.
**VM start or VM allocation** - Process of allocation VM in Azure world. This will turn on Cloud PC.
**VM stop or VM de-allocation** - This will shut down Cloud PC.

## Scenario 88: **Services**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**CAS, Concurrent Access Service** - CAS is the service responsible for Frontline license acquire and release process. CAS makes decision if user can get license or not. CAS keep track of how many licenses Tenant consumed. CAS is the source of truth for License usage Buffer.
**COGS** - COGS is a service which maintains and executes workflows.
**IDS, Idle detection service** - In the Frontline scenarios IDS is responsible for getting AVD events and orchestrate COGS workflows.
   - When user disconnects - creates FlexDeallocate workflow.
   - When user reconnects - creates FlexStart workflow.
**RMS, Resource Management Service** - Responsible to allocate/de-allocate Cloud PC using Azure.

## Scenario 89: **License State**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Unassigned\Revoked** - License is not assigned to any user.
**Activating** - The CPC start action has been triggered by user by using IWP, Win365 APP, Graph APIs or Intune portal.
**Active** - The license is activated and assigned to user and the CPC is in running state.
**InStandbyMode** - License is not assigned and can be reused by another user. Cloud PC is still running for 2 more hours. This happens after user is disconnected from Cloud PC. Takes up to 1 min to change license state from "Active" to "InStandbyMode".
**ActivationFailed** - Error happened during activating license

## Scenario 90: **User scenarios**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Provisioning Cloud PC**
Frontline Cloud PC provision process is the same as for dedicated Cloud PC. The only difference is Tenant can provision 3x Cloud PC as they have licenses. If there are any issues related to Provision, please contact to Provision team.
After Cloud PC provisioned, IDS will create **FlexDeallocate** workflow. This workflow will de-allocate Cloud PC in 2 hours.
**User connecting to Cloud PC (cold start)**
**Cold start flow:**
   - IWP/Win365 App: Initiate request
   - Graph (start) or IWS (request): "Win 365 app" works with Graph and IWP works IWS. Graph will redirect requests to IWS APIs.
   - CAS (request):
1. At this point CAS will check Tenant existence in CAS, if not exists then will update from Tenant Service.
1. Will check license claimed licenses vs consumed licenses.
   - If there is enough licenses, then will change license state from Unassigned to "Activating" state and then create COGS "FlexStart" workflow. This workflow will allocate Cloud PC thru RMS.
   - If not enough licenses then check license usage buffer. If enough licenses then execute previous step, if not then return "NoLicensesAvailable" error.
3. COGS will execute "FlexStart" workflow. Call RMS API to allocate Cloud PC
4. RMS will create and execute an action to Allocate Cloud PC.
5. RMS will wait until Cloud PC is allocated.
6. COGS will wait until RMS action is completed.
7. CAS will wait until COGS workflow is completed.
8. When COGS workflow is completed, CAS will change license state to Active.
9. IWP/"Win 365 app" will wait until license state is turned to Active state.
**How to troubleshoot:**
   - You can use the below Kusto Query to Check the CAS Flow.
```
CloudPCEvent
| where ApplicationName =~ 'cas'
| where * contains 'TenantID' //tenantID
| where * contains 'CPCId' //cpcid is workspaceid from cpcd tool for a given CPC.
| project env_time,ComponentName,EventUniqueName,ApplicationName,Col1,Col2,Col3,Col4,Col5,Col6,Message,DeviceId,OtherIdentifiers,env_cloud_name,env_cloud_environment,BuildVersion, ActivityId,ColMetadata,TraceLevel
//| summarize by DeviceId
```
   - Check Workflow execution status: Debugging a failed workflow inside COGSWorkflowService
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine

## Scenario 91: **Returning user (warm start)**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Warm start flow:**
   - IWP/Win365 App: Initiate request
   - Graph (start) or IWS (request): "Win 365 app" works with Graph and IWP works IWS. Graph will redirect requests to IWS APIs.
   - CAS (request):
1. At this point CAS will check Tenant existence in CAS, if not exists then will update from Tenant Service.
1. Check that Cloud PC power stat is running. If not, then it is Cold start scenario.
1. Will check license claimed licenses vs consumed licenses.
1. If there is enough licenses, then will change license state from inStandbyMode to "Active" state.
1. If not enough licenses then check license usage buffer. If enough licenses then execute previous step, if not then return "NoLicensesAvailable" error.
1. IWP/"Win 365 app" will wait until license state is turned to Active state.
**How to troubleshoot:**
At this point all the troubleshooting for this scenario is located inside OCE (Dev and SaaF Only) for CAS. Will update this section once we have more Kusto queries for CSS.

## Scenario 92: **Returning user (hot start)**
> 来源: ado-wiki-w365-frontline-worker-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Hot start flow:**
   - IWP/Win365 App: checking license state. License state is already Active. No Services will be called.
**User disconnecting from Cloud PC**
When user is disconnecting from Cloud PC, Windows 365 services will know about it in few different ways. Depending on disconnect type (closed browser, closed app, used Windows Start -> disconnect button, Internet loss, Host terminated ...) License release time may vary. License release takes 7 to 17 minutes. To check is license is released or not use Geneva action "CloudPC Get Concurrent Access CPC Status of the given tenant by CPC Id"
**How to troubleshoot:**
Refer to Kusto Queries for "Checking Concurrent Access Service (CAS) Flow using CPC ID/WorkspaceID" and "Debugging a failed workflow inside COGSWorkflowService"
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine

## Scenario 93: Windows 365 Frontline Overview
> 来源: ado-wiki-windows-365-frontline-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows 365 Frontline is a version of Windows 365 that helps organizations save costs by letting them provision a Cloud PC that can be used by multiple users with a single license.

## Scenario 94: Dedicated Mode
> 来源: ado-wiki-windows-365-frontline-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - With a single license, lets you provision **up to three Cloud PCs** that can be used nonconcurrently
   - Each is assigned to a single user and provides one concurrent session

## Scenario 95: Shared Mode
> 来源: ado-wiki-windows-365-frontline-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - With a single license, lets you provision **one Cloud PC** that can be shared noncurrently among a group of users
   - Provides one concurrent session
   - **When a user signs out from the Cloud PC, all user data is deleted and the Cloud PC is released for another user**

## Scenario 96: Key Resources
> 来源: ado-wiki-windows-365-frontline-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [Public documentation for Windows 365 Frontline](https://learn.microsoft.com/en-us/windows-365/enterprise/introduction-windows-365-frontline)
   - [What is W365 Frontline (video)](https://www.youtube.com/watch?v=PdyXqDjdE3I)
   - [Guide: Provision Windows 365 Frontline dedicated Cloud PCs](https://microsoft.sharepoint.com/:v:/t/css-rds/EQbONHOUvXpOsyT_-aEDRUsBiu-vyDZzblOtbXgTISWYtg)
