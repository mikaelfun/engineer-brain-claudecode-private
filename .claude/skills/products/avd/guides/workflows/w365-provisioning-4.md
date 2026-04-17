# AVD W365 Provisioning 配置 (Part 4) — 排查工作流

**来源草稿**: ado-wiki-a-sso-aadj-haadj-provisioning-policy.md, ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md, ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md, ado-wiki-b-cpc-relocation-troubleshooting.md, ado-wiki-b-outbound-connection-cloud-pc.md, ado-wiki-cloud-pc-passive-deletion-scoping-questions.md, ado-wiki-cloudprofile-agent-troubleshooting.md, ado-wiki-cpc-wdac-provisioning-troubleshooting.md, ado-wiki-post-provisioning-advanced-kusto-checks.md, ado-wiki-provisioning-overview.md, ado-wiki-reservation-error-list.md, ado-wiki-reserve-user-provisioning-scoping.md, ado-wiki-reserve-user-provisioning-setup.md, ado-wiki-reserve-user-provisioning-troubleshooting.md, ado-wiki-w365-cpc-cogs-optimization-tsg.md, ado-wiki-w365-find-cpc-with-vip.md
**Kusto 引用**: (无)
**场景数**: 84
**生成日期**: 2026-04-07

---

## Scenario 1: **Single Sign On**
> 来源: ado-wiki-a-sso-aadj-haadj-provisioning-policy.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Please find below the different topics related to Windows 365 and SSO. The following information is as I understand it and based on feature recordings.
**1. SSO to onprem resources, eg. file server from an AADJ CPC**
In this scenario we are talking about accessing a file share or internal domain resource without having to perform authentication. With HAADJ CPCs, the machines are domain joined, they have a TGT, and any access to a domain resource will be granted with no additional prompts, but with AADJ machines with line of sight with the domain network, these are not having the onprem TGT, so they cannot access that resource without authenticating the user first.
You can spot the TGT status in **dsregcmd /status** in the SSO State section.
With AADJ CPCs, the onprem TGT will say **No**
To overcome this we need to create the Kerberos Object on the domain.
This can be done following the instructions on this page:
[SSO - Create Kerberos Object](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises#install-the-azureadhybridauthenticationmanagement-module)
**2. Provisioning Policy SSO for HAADJ CPCs**
With AADJ CPCs, the SSO feature you can enable in the provisioning policy is straight forward. You sign in the Remote Desktop Client and then the access to your AADJ CloudPC is done as SSO, being a cloud machine with Auth done at Entra ID side.
With HAADJ machines the situation is different because the Windows Logon is not done against Entra ID but against the domain. Your Entra ID login token cannot be used straightforward to do the windows login on the HAADJ without an additional change: **Kerberos Object** explained at point 1. This is the reason we are checking for it in the HAADJ ANC. Without this Object present, the SSO to your HAADJ CPC will not work because the domain cannot authenticate the user with the Entra ID token. The trust relationship is not established to use the cloud token without the Kerb object and the partial TGT is not converted to Full TGT.
**3. SSO Stopped working despite the cx has created the Kerb object in the past**
This is an isolated scenario but may appear if the customer has any cleanup rules in place, deleting the Kerb Object components from the Domain Controllers container or from the Users Container.
The Kerberos Object has **two components**:
   - Users Container Object (in Users container)
   - Domain Controllers Container Object (in Domain Controllers container)
When running the **Get-AzureAdKerberosServer** command line to verify the object, you should see **both** objects listed with values and complete information.

## Scenario 2: 1. Environment & Configuration
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is the affected device a **Windows 365 Enterprise Cloud PC**? What SKU is assigned?
   - What are the **vCPU, RAM, and disk** specs of the Cloud PC?
   - Which **Azure region** is the Cloud PC deployed in?
   - What is the **OS version and build** currently installed on the Cloud PC?
   - Is the Cloud PC enrolled in the **Windows Insider Program**? If yes, which channel?
   - Has **AI-enablement** been explicitly assigned to this Cloud PC via Intune?
   - How long ago was AI-enablement assigned?
   - Has the Cloud PC been **fully updated and restarted multiple times** since enablement?
   - Are there any **custom images, security baselines, or hardening policies** applied?
**TSG direction**: Validate Cloud PC eligibility (SKU, region, OS build). Confirm Insider enrollment and AI-enablement assignment. Check post-enablement update and reboot completion.

## Scenario 3: 2. User Scenario / UX
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Which AI feature is not working as expected? (Semantic File Search, Federated Search, Click to Do, or multiple)
   - What **exact action** is the user trying to perform?
   - Where is the issue observed (Taskbar Search, File Explorer, on-screen selection, etc.)?
   - What is the **expected behavior vs. actual behavior**?
   - Does the issue happen immediately after sign-in or only after some usage time?
   - Are any **UI indicators missing** (e.g., search sparkles or Click to Do highlights)?
**TSG direction**: Map issue to feature-specific UX path. Validate feature visibility and activation indicators.

## Scenario 4: 3. Scope & Impact
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many users or Cloud PCs are affected?
   - Is the issue limited to **specific users, groups, or regions**?
   - Is this blocking core productivity or just a specific workflow?
   - Are users able to continue working using **non-AI alternatives**?
   - Is this a **new issue** or something that never worked since onboarding?
**TSG direction**: Determine severity and business impact. Decide between individual remediation vs. broader tenant investigation.

## Scenario 5: 4. Reproducibility
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Can the issue be reproduced **every time**, or is it intermittent?
   - Does it reproduce after a **Cloud PC reboot**?
   - Does it reproduce in a **different Cloud PC** with similar configuration?
   - Can the issue be reproduced using a **test file or simple scenario**?
   - Does it reproduce when signed in with a **different user account**?
**TSG direction**: Isolate user vs. device vs. service behavior. Validate consistency to rule out transient states.

## Scenario 6: 5. Recent Changes
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Were there any **recent Windows Updates or Insider builds** installed?
   - Were any **Intune policies or Cloud PC settings** modified recently?
   - Was AI-enablement **recently enabled, disabled, or reassigned**?
   - Were there changes to **OneDrive, SharePoint, or indexing settings**?
   - Has nested virtualization or any virtualization feature been enabled?
**TSG direction**: Correlate issue start with configuration or OS changes. Validate known limitations tied to recent updates.

## Scenario 7: 6. Logs, Evidence & Technical Data
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Are there any **errors or warnings** observed in the user experience?
   - Can we confirm whether **Hybrid Compute Framework (HCF)** is present?
   - Are AI model packages fully downloaded on the Cloud PC?
   - Is semantic indexing data present on the device?
   - Can ETL traces be collected while reproducing the issue?
   - Are screenshots or short recordings available showing the behavior?
**TSG direction**: Validate backend readiness (HCF, model packages, indexing). Collect diagnostics for deeper investigation if needed.

## Scenario 8: 7. Workarounds / Mitigations
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Does a **Cloud PC restart** temporarily resolve the issue?
   - Does the feature work after **additional Windows Updates** are applied?
   - Does disabling and re-enabling AI-enablement help?
   - Can the user complete the task using **traditional Windows Search**?
   - Has turning off **nested virtualization** been tested (if applicable)?
**TSG direction**: Apply known mitigations to restore functionality. Determine if issue aligns with preview-stage limitations.

## Scenario 9: 8. Validation & Next Steps
> 来源: ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Has AI-enabled status been validated in **Intune, Windows App, or Taskbar UI**?
   - How long has it been since AI-enablement was assigned?
   - Is the customer aware this feature is currently **in preview**?
   - Is the customer expecting **production-grade stability** at this stage?
   - Are they willing to test in a **controlled or secondary Cloud PC**?
**TSG direction**: Set correct expectations for preview behavior. Decide between configuration fix, known issue, or product escalation.

## Scenario 10: Eligibility Requirements
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Supported Regions**: Specific Azure regions
   - **Service Plans**: Only certain license SKUs
   - **Minimum OS Version**: Must meet minimum requirements
   - **Configuration Source**: Defined in ResourceMgmtCustomSettings.json on ADO

## Scenario 11: Enable/Disable Flow
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Setting Event Reception** (FleetMgmt): Receives AI-enabled setting event
2. **Desired State Configuration** (RAS): Sets Cloud PC level setting
   - Special Case: Pre-Provision Settings bypass Desired State framework
3. **Action Creation**: Enable when setting enabled + eligible + status disabled; Disable when setting disabled or ineligible
4. **Action Execution Triggers**: User/Admin change, Post-WorkItem (Provision/Reprovision/Upgrade/Move)
5. **Action Execution**: Enable installs HCF MSIXes; Disable uninstalls them

## Scenario 12: State Definitions
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Action States**: Accepted, InProgress, Succeeded, Failed
   - **Health States**: Healthy, Unhealthy, NotApplicable

## Scenario 13: Investigation Process
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Query #1**: Cloud PC Property Mapping (ProductType, ServicePlanId, Region, CopilotPlusStatus, DeviceId)
2. **Query #5 & #6**: Setting Propagation verification
3. **Query #3**: Check EnableOAICapabilities/DisableOAICapabilities actions
4. **Query #4**: Device Health (OsVersion, HcfState, OaiModelState)

## Scenario 14: Common Failure Patterns
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Enablement Failed**: Check eligibility → setting propagation → action failures
   - **Unexpected Disablement**: Check service plan downgrades, region moves, disable actions
   - **Stuck InProgress**: Check action duration (>2 hours) and device connectivity
   - **Widespread Failures**: Aggregate failures by ErrorCode/Category

## Scenario 15: Query #1: Cloud PC Property Mapping
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Database: CloudPC (cloudpc.eastus2.kusto.windows.net)
```kql
let CloudPCEvent = cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent;
CloudPCEvent
| where ApplicationName == "dml-function"
| where ComponentName == "WorkspaceInputV1Handler"
| where EventUniqueName startswith "ProcessAsync-EntityAfter"
| extend CloudPcId = DeviceId
| where CloudPcId == cloudPcId
```
`[来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md]`

## Scenario 16: Query #3: Cloud PC Actions (OAI Enable/Disable)
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
-- Filter by ActionType contains "OAICapabilities"
-- Check ActionStatus, ErrorCode, ErrorCategory
```
`[来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md]`

## Scenario 17: Query #4: OS Version and Feature Status
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
-- ApplicationName == "connectivity-function"
-- ComponentName == "DeviceGatewayEventConsumer"
-- Check OsVersion, HcfState, OaiModelState
```
`[来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md]`

## Scenario 18: OAI Eligibility Check Query
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where AccountId == "" //TenantID
| where ComponentName in ("OaiService")
| where EventUniqueName contains "GetCloudPcOaiEligibility" or EventUniqueName contains "EnableOaiAsync"
```
`[来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md]`

## Scenario 19: Service-side errors (remediable by engineering):
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error | Description |
|-------|-------------|
| Installation failure | HCF packages installation failed |
| Internal error | Unable to use required AI-enablement component |
| Feature disabled | Collected by monitoring plugin, mostly auto-remediated |

## Scenario 20: Client-side errors (not remediable by engineering):
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error | Description |
|-------|-------------|
| Unsupported Region | CPC provisioned in unsupported region |
| Networking error | Firewall blocking AI features |
| Unsupported OS version | Below minimum OS build |
| Unsupported OS image | OS image not supported |
| Unsupported license plan | License plan not supported |
| Disabled via Intune | Disabled by Intune settings |

## Scenario 21: SemanticIndexingStatus Registry Values
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Path: `HKLM\SOFTWARE\Microsoft\Windows Search\SemanticIndexer`
| Code | Name | Remediation |
|------|------|-------------|
| 0x0 | Allowed | Working correctly |
| 0x6 | DisabledAsCapableNpuNotPresent | Check for Windows updates |
| 0xF | PackageDownloadInProgress | Wait for packages to install |
| 0x14 | DisabledDueToTemporaryCommercialControl | Enable GP: "Enable features introduced via servicing that are off by default" |
| 0x15 | DisabledDueToRepeatedSemanticIndexingFailures | Generate ETL traces |

## Scenario 22: Device Debugging Commands
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```powershell
Get-appxpackage "*hybrid*" -AllUsers
Get-appxpackage "*hcf*" -AllUsers
(Get-appxpackage "*workload*" -AllUsers).Count
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WorkloadManager\HCF" /s
reg query "HKLM\SYSTEM\WaaS\Device\Detect\Software\HybridCompute"
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\UnattendSettings\WaaS\Device\Detect\Software\HybridCompute"
reg query "HKLM\SOFTWARE\Microsoft\Windows Search\SemanticIndexer"
```

## Scenario 23: ETL Trace Collection
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Download wsearchcore_ai_etwlogger.wprp
2. Admin PowerShell: `wpr -start wsearchcore_ai_etwlogger.wprp`
3. Reproduce issue
4. `wpr -stop <fileName>.etl`

## Scenario 24: Federated Search
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Check Microsoft.Sharepoint.exe running via Task Manager
   - Ensure OneDrive folder in Indexing scope
   - Use SearchMonitor app for diagnostics

## Scenario 25: Click to Do
> 来源: ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - First time: must manually open the application
   - If shortcut keys don't work, search for it in taskbar
   - Collect ETL logs if persistent issues

## Scenario 26: CPC Relocation / RegionRelocation Troubleshooting
> 来源: ado-wiki-b-cpc-relocation-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This is a backend feature - no user interaction nor troubleshooting is applicable for this release.

## Scenario 27: When customer asks why CPC was moved
> 来源: ado-wiki-b-cpc-relocation-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
You can verify the user settings and geography options enabled to check whether the customer has it activated. The customer has the chance to opt-out through user settings at their convenience.
**Note:** Currently, relocation can only be triggered by Microsoft; it is a purely internal action.

## Scenario 28: Verification via CPCD
> 来源: ado-wiki-b-cpc-relocation-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Since this is an action, you can also obtain details about the action in **CPCD > Action Diagnostics** page.

## Scenario 29: KQL: Verify RegionRelocation
> 来源: ado-wiki-b-cpc-relocation-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let MyCloudPCEvent =
    union cluster("cloudpc.eastus2").database("CloudPC").CloudPCEvent,
    cluster("cloudpcneu.northeurope").database("CloudPCProd").CloudPCEvent;
let GetPersistLogs = (StartTime:datetime, EndTime:datetime, Env:string, TenantIds:dynamic)
{
    MyCloudPCEvent
    | extend TruncId = Col1, Col1 = iff(ApplicationName in ("prov", "prov-function"), OtherIdentifiers, Col1)
    | where env_time between (StartTime .. EndTime) and iff(Env != "", env_cloud_environment == Env, true) and iff(array_length(TenantIds) >= 1 and TenantIds[0] != "", AccountId in (TenantIds), true)
    | where ComponentName == 'PersistProvisionResultActivity' and EventUniqueName like 'Execute'
    | order by env_time asc
    | extend Col1 = iff(Col1 startswith "[Chunk", substring(Col1, indexof(Col1, ':') + 2), Col1)
    | summarize Col1 = strcat_array(make_list(Col1), ''), arg_max(env_time, *) by ActivityId, AccountId, TruncId
    | parse Col1 with 'Begin persist ' ActionType ' result, status:' Status ', count:#' CountDetail ', result:' ResultModel ', targeting items:' Items
    | extend ResultModel = parse_json(ResultModel), Items = parse_json(strcat('[', Items, ']'))
    | mv-expand Item = Items
    | extend WorkItem = parse_json(tostring(Item.WorkItem))
    | extend Error = parse_json(WorkItem.Error)
    | extend AccountId = tostring(AccountId), PartnerAppType = WorkItem.PartnerAppType,
        ProvisionPhase = coalesce(Error.provisionPhase, ResultModel.Error.provisionPhase), ProvisionRequestId = ResultModel.ProvisionId,
        ErrorCode = coalesce(Error.errorCode, ResultModel.Error.errorCode), ErrorCategory = coalesce(Error.errorCategory, ResultModel.Error.errorCategory), ErrorMessage = coalesce(Error.meta.message, ResultModel.Error.meta.message),
        Status = Item.Status, IsLastRetry = WorkItem.IsLastRetry,
        ProvisionRecipe = dynamic_to_json(ResultModel.ProvisionRecipe), PostProvisionStepResults = dynamic_to_json(ResultModel.PostProvisionStepResults[tostring(Item.DeviceId)]),
        DeviceModel = coalesce(Item.DeviceModel, dynamic_to_json(WorkItem.OriginalDeviceModel)),
        DeviceName = split(dynamic_to_json(WorkItem.OriginalDeviceModel.DeviceResourceId), "/")[-1]
    | project
        env_time, env_cloud_name, ActivityId, AccountId, UserId = tostring(WorkItem.UserId), ActionType, Status, IsLastRetry, ProvisionRequestId,
        ErrorCategory, ErrorCode = iff(Item.Status == 'Successed', '', strcat(ProvisionPhase, '_', ErrorCode)), ErrorMessage,
        WorkItemId = tostring(WorkItem.WorkItemId), DeviceId = tostring(Item.DeviceId), PolicyId = tostring(WorkItem.PolicyId), ProvisionId = tostring(WorkItem.RequestId),
        Region = ResultModel.Region, ImageType = tostring(ResultModel.ImageType), ServicePlanType = tostring(WorkItem.ServicePlanType), OriginalServicePlanId = tostring(WorkItem.OriginalServicePlanId), TargetServicePlanId = tostring(WorkItem.TargetServicePlanId),
        ProvisionRecipe, PostProvisionStepResults, PartnerAppType, BusinessType = WorkItem.BusinessType,
        Col1, DeviceModel, DeviceName = tostring(DeviceName),
        BuildVersion, env_cloud_roleInstance
};
let StartTime = ago(30d);
let EndTime = now();
let Env = "PROD";
let TenantIds = pack_array(""); // Add TenantId inside quotes
let PersistLogs = GetPersistLogs(StartTime, EndTime, Env, TenantIds);
PersistLogs
| where ActionType in ("SkuMigration","RegionRelocation")
| order by env_time desc
| project-away Col1
| take 1000
```
`[来源: ado-wiki-b-cpc-relocation-troubleshooting.md]`

## Scenario 30: Expected behavior
> 来源: ado-wiki-b-cpc-relocation-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - No expected error messages for the customer side
   - No expected error messages/codes even internally
   - Relocation is purely internal, triggered by Microsoft only

## Scenario 31: Overview
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This guide covers Cloud PC networking issues such as:
   - Cannot access internet
   - Cannot reach a specific port/IP address
   - Cannot reach a specific website
**Four main root cause categories:**
1. Customer's Virtual Network environment (NSG / Routes / DNS)
2. Customer's proxy/VPN/Windows Firewall/3rd party AV inside guest OS
3. Server-end restrictions (Azure SNAT port range or IP blocks)
4. Azure Host Networking service issue
---

## Scenario 32: Network Security Group (NSG)
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use Geneva Action **["Get Nic Effective Security Groups"](https://portal.microsoftgeneva.com/E221C040)** with the NIC resource ID.
Review the rules for any that block inbound/outbound connections to the specific IP/port.
Reference: https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview

## Scenario 33: Routes
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use Geneva Action **["Get Nic Effective Routes"](https://portal.microsoftgeneva.com/9ABF9CF0)** with the NIC resource ID.
Check if any route directs traffic to Azure Firewall, 3rd party NVA, null, or on-prem via ExpressRoute/S2S VPN.
Reference: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#next-hop-types-across-azure-tools

## Scenario 34: DNS
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
DNS errors are obvious from the error message (e.g., "URL cannot be resolved").
   - **MHN Cloud PC with DNS failure** → Engage SaaF team → W365 Network and Storage dev team
   - **Customer vNet DNS failure** → Check `dhcpOptions / dnsServers` in Virtual Network details:
   - `168.63.129.16` = Azure DNS (W365 backend issue or DNS proxy applied in guest)
   - Custom IPs = Customer's DNS server → Test connectivity to DNS server IP:53 UDP via ASC Diagnostic → If reachable, collaborate with Windows Directory Services team

## Scenario 35: Diagnostic - Test Traffic (ASC)
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
In ASC → VM → Diagnostic tab → Test Traffic:
   - Input destination IP and port
   - Simulates VFP rules (no real traffic generated)
   - Download Process-Tuples for detailed VFP analysis
Reference: ["Process-Tuples in Virtual Filtering Platform"](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/423267/Virtual-Filtering-Platform)
---

## Scenario 36: 2. TCP connection check
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Test-NetConnection -ComputerName <URL> -InformationLevel Detailed -Port <Port>

## Scenario 37: 5. Proxy check
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
netsh winhttp show proxy

## Scenario 38: Possibility 1: Azure SNAT Port Range Blocked
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Azure assigns SNAT ports starting from 1024-1087 (Ephemeral port range) for outbound connections from VMs without public IPs.
Some websites/services block access from source port range 1024-1087 (non-standard per RFC 6056).
**Confirmation:** Use Geneva Action **["List-NAT-Range"](https://jarvis-west.dc.ad.msft.net/3F8F408C)** (requires SAW/VSAW) to confirm SNAT port range.
**Workaround options:**
   - Configure proxy inside Cloud PC guest OS to bypass Azure SLB port allocation
   - Create an **Azure NAT Gateway** on the same Subnet to provide static public IP (incurs additional cost)
   - Long-term: Customer contacts web owner to unblock source port range 1024-1087
Reference ICMs: [308307556](https://portal.microsofticm.com/imp/v3/incidents/details/308307556/home), [275435045](https://portal.microsofticm.com/imp/v3/incidents/details/275435045/home)

## Scenario 39: Possibility 2: IP Range Restriction
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Website blocks access from specific Azure public IP ranges.
Test from multiple networks (Azure VM, MSFT Corpnet, home network) to identify the pattern.
---

## Scenario 40: 4. Azure Host Networking Issue
> 来源: ado-wiki-b-outbound-connection-cloud-pc.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use **[NetVMA](https://netvma.azure.net/)** (input VMID or Container ID, set correct timespan) to check:
   - Uplink status
   - Network path of the Cloud PC at container layer
Check Azure WAN Edge router with Kusto query:
```kql
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<CloudPC_PublicIP>" or DstIpAddress == "<CloudPC_PublicIP>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
```
`[来源: ado-wiki-b-outbound-connection-cloud-pc.md]`
This verifies whether packets left/returned via Azure WAN Edge.

## Scenario 41: 2. User / Admin Scenario
> 来源: ado-wiki-cloud-pc-passive-deletion-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Goal: restore previous Cloud PC state or provision new?
   - Following Restore device / snapshot recovery flow?
   - Expecting data recovery from latest snapshot?
   - Admin received license expiration/deprovision notification emails?

## Scenario 42: 8. Product vs Configuration Validation
> 来源: ado-wiki-cloud-pc-passive-deletion-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - All documented prerequisites met?
   - Failure due to missing prerequisites, expired window, or no valid snapshots?
   - Expected limitation (outside 28-day window or active deletion)?
   - All requirements met but still fails → potential product issue for escalation?

## Scenario 43: Identify the root-cause
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The ICM incident may include a **workflowId** linked to the install or update operation, or it may have been forwarded to us because the initial investigation by CDP Core OCE suggests the issue is related to CloudProfile.
The query returns all events related to installing or updating the CloudProfile agent. Look for an error log immediately preceding a log entry that contains cloudprofile/InstallCloudProfileAgentV1Composer. This composer is responsible for installing or updating the agent, so any failure will appear above this entry. Additionally, the log entry with cloudprofile/InstallCloudProfileAgentV1Composer will include a Tag where the Status is marked as failed.

## Scenario 44: Possible Root-causes
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The install or update can fail when creating the vm-extension to run the script.
   - The script execution in the VM can also fail, this reported with error code "VirtualMachineVmExtensionScriptFailure".
   - The CDAgent may fail to run the msi to install or update the agent.

## Scenario 45: Mitigation
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Fail to Create VM-Extension
If RCA indicates the failure occurred because the workflow step could not create the VM extension on the device to run the script, take these actions:
   - **Install Operation**: Contact CDP Core OCE. The issue may be due to the device not being fully provisioned. Agents cannot be installed on devices that are not fully provisioned.
   - **Update Operation**: The device already has the agent, but the update failed because the device is in an unhealthy state. Action: Restart the device using this [guide](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/cdp-cloud-profile-service/servicetroubleshooting/tsg_service_002_6).

##### VirtualMachineVmExtensionScriptFailure
This error means the script responsible for installing the agent either did not execute or failed during execution on the device.

## Scenario 46: Enable Crash Dumps
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Download the latest crash dump configuration script from the CloudProfiles repository:
   - [EnableDump.ps1](https://dev.azure.com/microsoft/RDV/_git/CloudProfiles?path=/build/scripts/EnableDump.ps1)

## Scenario 47: Configure the Host
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Run the following PowerShell commands to enable crash dumps:
```powershell
$Script = "<path>\<to>\<script>\EnableDump.ps1"
$DumpFolder = "C:\CrashDumps"
& "$Script" -ImageName "cldprof.exe" -DumpFolder $DumpFolder -DumpType "Full"
```

## Scenario 48: Collect Crash Dumps
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Monitor the `$DumpFolder` for `.DMP` files.
2. When crash dumps are available, zip the entire `$DumpFolder`.
3. Share the ZIP file with the Cloud Profile Agent team (SaaF > ICM)

## Scenario 49: Kusto
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use Prod through Azure Data Explorer or Kusto App by adding the following connection strings:
   - **Non-EU regions**: https://cdp-gds-global-prod.eastus.kusto.windows.net
   - **EU regions**: https://cdp-gds-eudb-prod.northeurope.kusto.windows.net

## Scenario 50: Finding CollectionId in PlatformResourceName (PRN) format
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Using CDP Data Entity Kusto Cluster
```kql
union isfuzzy=true cluster('cluster-name').database('cpsdata-entityData').["clouddevicecollectiondata*CloudDeviceCollectionsV1"]
| where Name has "Assignment name (Collection Name)"
| project CloudDeviceCollectionId, Name
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`
**Note:** Replace cluster-name with the appropriate Kusto cluster name based on your region (EU or NonEU).

## Scenario 51: Finding UserId (ObjectId) using UserName or AccountName
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Method 1: Using Intune Management Portal
1. Connect to Management Portal
2. Click on `Users` menu item
3. Start typing the User display name or Principal name
4. Select the User from the result list
5. The UserId (ObjectId) will be located in the Overview page

## Scenario 52: Finding UserProfileId in PlatformResourceName format
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Using CDP Data Entity Kusto Cluster
```kql
union isfuzzy=true cluster('cluster-name').database('cpsdata-entityData').["cloudprofiledata*CloudProfile"]
| where UserId == "<userid>"
| project CloudProfileId, UserId, CollectionId
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`

## Scenario 53: Finding CloudDeviceId and SessionHostName
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Method 1: Using CDP Diagnostic Kusto Cluster
```kql
ServiceEvent
| where ServiceName == "azurevirtualdesktoprm"
| where EventIdName == "AddDeviceToHostPool"
| where Tags has "<cloud-pc-name>"
| extend json_tags = parse_json(Tags)
| extend CloudDeviceId = tostring(json_tags.CloudDeviceId)
| project CloudDeviceId
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`

##### Method 2: Using CDP Data Entity Kusto Cluster
**NonEU Regions:**
```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where SessionHostName contains "<cloud-pc-name>"
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`
**EU Regions:**
```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where SessionHostName contains "<cloud-pc-name>"
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`
Finding CloudDeviceId from Hostname:
```kql
union isfuzzy=true cluster('<cluster-name>').database('avdrmdata-entityData').["azurevirtualdesktoprmdata*DeviceV1"]
| where CloudDeviceId == "<deviceid>"
| project-reorder SessionHostName
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`

## Scenario 54: Suggested Kusto Queries - Profile Load Performance
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster("rdsprod.eastus2.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodus.eastus2.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodeu.westeurope.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodgb.uksouth.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodca.canadacentral.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodjp.japaneast.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodau.australiaeast.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodin.centralindia.kusto.windows.net").database("WVD").RDCloudProfileTrace
| union cluster("rdsprodsa.southafricanorth.kusto.windows.net").database("WVD").RDCloudProfileTrace
| where HostInstance == "<session-host-name>"
| where TIMESTAMP > ago(7d)
| where EventId == 6
| extend OperationName = extract('Name="([^"]+)"', 1, Message)
| extend ErrorCode = extract('ErrorCode="([^"]+)"', 1, Message)
| extend ElapsedMs = toint(extract('ElapsedMs="([^"]+)"', 1, Message))
| where OperationName in ("WaitForDisk", "WaitForDiskAttach", "PrepareDisk", "Logon", "AddProfilePathRedirection", "ProfileListImport", "AppxPackageRegistration", "StartShell")
| extend Stage = case(
  OperationName in ("WaitForDiskAttach", "WaitForDisk"), "1. Disk Attach",
  OperationName == "PrepareDisk", "2. Disk Prepare",
  OperationName in ("ProfileListImport", "AddProfilePathRedirection"), "3. Profile Setup",
  OperationName == "Logon", "4. User Logon",
  OperationName in ("AppxPackageRegistration", "StartShell"), "5. Shell Start",
  "Other"
)
| summarize
  Operations = make_list(OperationName),
  TotalTimeMs = sum(ElapsedMs),
  MaxTimeMs = max(ElapsedMs),
  AllSuccessful = iff(countif(ErrorCode != "0") == 0, "All Passed", "Errors Found")
  by Stage, ActivityId
| extend TotalTimeSec = round(TotalTimeMs / 1000.0, 2)
| project Stage, Operations, TotalTimeSec, MaxTimeMs, AllSuccessful
| order by Stage asc
```
`[来源: ado-wiki-cloudprofile-agent-troubleshooting.md]`

## Scenario 55: Regular Timings Reference
> 来源: ado-wiki-cloudprofile-agent-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Stage | Typical Duration | Notes |
|-------|-----------------|-------|
| 1. Disk Attach | ~12.9s | Expected, Azure managed disk attachment |
| 2. Disk Prepare | ~0.15s | Fast |
| 3. Profile Setup | ~0.16s | Very fast, profile already exists |
| 4. User Logon | ~8.2s | Normal Windows logon time |
| 5. Shell Start | ~8.7s | App registration and shell startup |

## Scenario 56: **Issue:**
> 来源: ado-wiki-cpc-wdac-provisioning-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Received the error PowerShell Constrained Language Mode is causing provisioning to fail during the provisioning of CPCs for the Hybrid joined scenario.
**Troubleshooting steps**
   -  Check below in the Customer Environment:
   - [ ] What is the networking deployment options : Microsoft-hosted network / ANC
   - [ ] For Microsoft-hosted network : Raised an ICM to infrastructure team
   - [ ] For ANC:  Is the issue happening to the Microsoft Entra join / Microsoft Entra Hybrid Joined only, or Is the issue happening to both Microsoft Entra join and Microsoft Entra Hybrid Joined models
   - What is the Image type : Gallery Image / Custom Image
   - What is the licensing type : Frontline / Enterprise
   - Check if all of the endpoints and URLs outlined at Network requirements for Windows 365 | Microsoft Learn are whitelisted
   - Areas/Information to confirm / check from the customer side (e.g. integration)
   - [ ] Any PowerShell policies being deployed via Intune / GPOs ?  Possible places including, but not limited to From DS servers and/or Group Policy management on DS servers where the CPCs resident
   - [ ] From Intune admin center : Configuration Policies, and/or Scripts and remediations section
   - [ ] Any other 1ST party services (e.g. WDAC or AppLocker) in use? In the WDAC policy xml, what is the policy settings, and/or Any specific AppLocker policies used
   - [ ]  Any 3rd party tools (e.g. Cisco, Zscalar) in use?
**CPCD logs**
1. Under the Provision Failed Event in CPCD, get Activity ID and Error message
2. Run the below Kusto to check more details
```kql
let activityId = "Activity ID from the Provision Failed Event ";
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName in ('prov', 'prov-function')
| where env_cloud_environment == "PROD"
| where ComponentName != "OperationContextHolder"  
| where ActivityId == activityId
| where (TraceLevel == 2 or ComponentName == 'ParseVmExtensionErrorActivity')
and ComponentName !in ('IntuneService', 'LoadDeviceUnregistrationContextActivity', 'ZtdAadUnjoinActivity', 'GraphClientProvider', 'DeviceUnregistrationOrchestrator', 'CleanUpOrphanResourceOrchestrator', 'TimerOrchestratorBase')
| project ActivityId, ApplicationName, env_time, AccountId, ComponentName, EventUniqueName, Message, OtherIdentifiers, Col1, Col2, Col3, Col4, Col5, Col6
| order by env_time asc 
```
`[来源: ado-wiki-cpc-wdac-provisioning-troubleshooting.md]`
**Kusto Results (example):**
"Message": ,
"OtherIdentifiers": Intune enrollment status: False, Device name:, Intune enrollment output: {"intuneDeviceId":"","intuneEnrollErrorCode":"","intuneEnrollMessage":". Ran into an exception: Cannot add type. Definition of new types is not supported in this language mode."}
**Potential Causes:**
There are several potential reasons where the PowerShell Constrained Language is enabled. Including GPOs, WDAC/AppLocker or Intune Policies
**Potential Solutions**
   - If there is any GPO / Intune Policies applying the Constrained Language Mode for PowerShell, please disable it and test again
   - If Option 11 Disabled: Script Enforcement is not set in the WDAC policy xml, need to open a Collab with the WDAC team for assistance to enable/apply it.
**Collaboration tips**
Depending on where the issue is, you may require assistance from the following teams:
   - **Windows Defender Application Control (WDAC):** Windows/Windows 11/Windows 11 Enterprise Multi-Session, version 23H2/Windows Setup, Upgrade and Deployment/Windows Defender Application Control (WDAC, formerly Device Guard)
   - **AppLocker**: Windows/Windows 11/Windows 11 Enterprise Multi-Session, version 23H2/Remote Desktop Services and Terminal Services/Remote Desktop Connection (RDC) client (includes UWP app)
   - **Intune**: Azure/Microsoft Intune/Set Up Intune
   - **OnPrem Active Directory Services** : Windows/Windows 11/Windows 11 Enterprise and Education, version 22H2/Active Directory/On-premises Active Directory domain join
**Additional information:**
PowerShell automatically runs in ConstrainedLanguage mode when it is running under a system application control policy. The WDAC policies must allow all PowerShell scripts (.ps1), modules (.psm1), and manifests (.psd1) for them to run with Full Language rights. By default, script enforcement is enabled for all WDAC policies unless the option **11 Disabled:Script Enforcement** is set in the policy.
   - [Understand WDAC script enforcement](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/windows-defender-application-control/design/script-enforcement)
   - [About Language Modes](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_language_modes?view=powershell-7.4)

## Scenario 57: Common Errors (CSS - do not raise an ICM or ping devs directly)
> 来源: ado-wiki-post-provisioning-advanced-kusto-checks.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error Code | Error Message | Impact | Action | Comments | Root Cause | Execution Flow |
| --- | --- | --- | --- | --- | --- | --- |
| PartialFailure | Failed to Install language by PowerShell Module. Language pack or features could only be partially installed. ErrorCode: -2145123272. | 1 step failed. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. | This error code is only for step: WindowsLocalization | HAADJ policy block components on device. | VmExtension |
| PluginInternalError | Check error message in StepResults column. | 1 or more step failed when CMD agent plugin execute scripts. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. | Plugin execution path runs well. | | CMD Agent |
| RunVmExtensionScriptError | Failed to Install language by PowerShell Module. Failed to install language. ErrorCode: -2147418113. | 1 or more step failed when run powershell scripts. Provisioning will run into "Provisioned with warning" status | known issue. Reprovision may help. (ErrorCode: -2147418113 can be different.) | | HAADJ policy block components on device. | VmExtension |
| RunVmExtensionScriptError | Others different with above. | 1 or more step failed when run powershell scripts. Provisioning will run into "Provisioned with warning" status | Needs further investigation. Reprovision may help. | | | VmExtension |
| Timeout | Timeout to receive postProvisioning plugin event | In device, steps may run succeed but all steps will be marked to failed in timeout case. Provisioning will run into "Provisioned with warning" status. | Needs further investigation. Reprovision may help. Check DGS and Hermes logs. If DGS shows "Forwarded IoTHub message to Event Grid successfully" with PluginId 6251a87d, DGS received event successfully - contact Vicky Qi/Dandan Cao. If DGS shows "Received device message via IoT Hub" but no send success, contact Cloud PC Identity & Auth RBAC & Unified Agent Team or Honglu Chen. If DGS didn't receive event, check HermesLogShort for publish events. | Plugin triggered succeeded but don't send event in time limit. | | CMD Agent |
| TriggerPluginTimeout | Trigger plugin PluginId 6251a87d-5ec4-4a5e-b836-f6c3a233b4e7 timeout | Provisioning will run into "Provisioned with warning" status. All steps will be marked to failed. | Check DGS log for "Successfully sent request GetExecutePluginRequestAsync to Hermes" and InProgress status. If DGS errors, contact Honglu Chen. If DGS runs well but Hermes errors, transfer to CloudPC Service WCX Hermes OCE (Prashant's team). | Try to trigger plugin 3 times but not get complete signal in time. | | CMD Agent |
| PostProvisioningTimeout | | Provisioning will run into "Provisioned with warning" status. All steps will be marked as failed. | Check StepResults column. If any step status is InProgress/Pending, it's unexpected. Check Update svc log - if PostProvisioning finally succeeded but log interrupted for a long time, it's known issue. Otherwise contact Vicky Qi/Dandan Cao. | PostProvisioning over 90 minutes doesn't return Succeed/Failed result to workspace. | | CMD Agent |
| Unknown | | Provisioning will run into "Provisioned with warning" status. 1 or more steps failed. | Unexpected. If query in monitor can get related log, contact Vicky Qi/Dandan Cao. If "BlockHighRiskPorts" failed with "Can not get BlockHighRiskPorts log", contact Rongbin Han (CMD Agent flighting related). If can't get log, check dashboard. If MMD/Autopatch enroll failed or core provision step failed, contact OCE of provision team and transfer to CloudPC Service Cloud PC Provisioning team. | | | VmExtension |

## Scenario 58: Kusto Query: Single Device Breakdown
> 来源: ado-wiki-post-provisioning-advanced-kusto-checks.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Usage**: Input DeviceId and Time as parameters.
```kql
// ================================= up workspace dgs hermes =======================================
let deId = 'CPC DEVICE ID'; //
let pluginId = "6251a87d-5ec4-4a5e-b836-f6c3a233b4e7"; // do not modify
let tTime = ago(16d);
let common = union cluster("https://cloudpc.eastus2.kusto.windows.net/").database('CloudPC').CloudPCEvent,cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > tTime;
let aadId = toscalar(common| where ApplicationName contains "dgs"| where * contains deId| distinct DeviceId| where strlen(DeviceId) > 10 | limit 1);
union cluster("https://cloudpc.eastus2.kusto.windows.net/").database('CloudPC').CloudPCEvent,cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > tTime
| where ApplicationName contains "up"
| where * contains deId
| project env_cloud_environment,env_cloud_name,AccountId,ServiceName,ApplicationName,DeviceId,Message, ColMetadata,EventUniqueName,env_time,ActivityId,ComponentName, Col1, Col2, Col3, Col4, Col5,ScenarioType, Col6, OtherIdentifiers,BuildVersion
| as UpdateSvcLog;
common
| where ApplicationName == "prov-function"
| where * contains deId
| project env_cloud_environment,AccountId,ServiceName,ApplicationName,DeviceId,ActivityId, Message, ColMetadata,ComponentName,EventUniqueName,env_time,OtherIdentifiers,Col1,BuildVersion
| as WorkSpaceLog;
common
| where ApplicationName contains "dgs"
| where DeviceId == aadId
|where * contains pluginId
| project AccountId,ServiceName,ApplicationName,DeviceId,ActivityId, Message, ColMetadata,ComponentName,EventUniqueName,env_time,Col1, Col2, Col3, Col4, Col5, Col6, OtherIdentifiers,BuildVersion
| as DeviceGatewayLog;
let HermesFull = common
| where ServiceName == "HermesService"
| where DeviceId == aadId
| project AccountId,DeviceId,ServiceName,ApplicationName,ComponentName,EventUniqueName,ActivityId, Message, ColMetadata,env_time, Col1, Col2, Col3, Col4, Col5, Col6, OtherIdentifiers,BuildVersion;
HermesFull
| as HermesLogFull;
HermesFull
|where * contains pluginId
|as HermesLogShort;
print DeviceId = deId,AadDeviceId = aadId
| as Id;
// ================================= up workspace dgs hermes =======================================
```
`[来源: ado-wiki-post-provisioning-advanced-kusto-checks.md]`

## Scenario 59: Escalation Contacts
> 来源: ado-wiki-post-provisioning-advanced-kusto-checks.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Component | Contact |
| --- | --- |
| CMD Agent plugin / PostProvisioning orchestration | Vicky Qi / Dandan Cao |
| DeviceGateway / IoT Hub issues | Honglu Chen |
| Hermes service errors | CloudPC Service\WCX Hermes OCE (Prashant's team) |
| BlockHighRiskPorts / CMD Agent flighting | Rongbin Han |
| MMD/Autopatch enrollment / Core provision failures | CloudPC Service\Cloud PC Provisioning team |
| DGS communication issues | CloudPC Service\Cloud PC Identity & Auth RBAC & Unified Agent Team |

## Scenario 60: Provisioning Workflow
> 来源: ado-wiki-provisioning-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Assignment is a 3-tuple of (user Id, policy id, license type).
For a given user, policy change or license change may trigger different types of provision requests, according to the device's provisioning states.

## Scenario 61: CPC Provisioning States
> 来源: ado-wiki-provisioning-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| State | Description |
|-------|-------------|
| `None` | No record in DB or deleted |
| `Licensed` | User is licensed but no policy assigned |
| `Provisioned` | Device is provisioned and available to use |
| `InGracePeriod Reprovision` | Provisioned but will be reprovisioned after grace period expiry |
| `InGracePeriod Deprovision` | Provisioned but will be deprovisioned after grace period expiry |
| `InGracePeriod Delete` | Provisioned but will be deleted after grace period expiry |
| `Pending` | Workspace will go to Provisioning State when quota is available |

## Scenario 62: Equivalent States
> 来源: ado-wiki-provisioning-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| State | Meaning |
|-------|---------|
| `Deprovisioned` | Licensed, last state is Deprovisioning |
| `DeprovisionFailed` | Provisioned, last state is Deprovisioned, not consistent with License Policy |
| `Upgraded` | Provisioned, last state is Upgrading |
| `UpgradeFailed` | Provisioned, last state is Upgrading, not consistent with License Policy |
| `ProvisionFailed` | Licensed, last state is Provisioning, not consistent with License Policy |
| `ReprovisionFailed` | Provisioned, last two states are Reprovision and Provisioning, failed but consistent |
| `Restored` | Provisioned, last state is Restoring |
| `RestoreFailed` | Provisioned, last state is Restoring, failed but consistent |

## Scenario 63: Transient States
> 来源: ado-wiki-provisioning-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| State | Transition |
|-------|-----------|
| `Provisioning` | Licensed → Provisioned |
| `Upgrading` | Provisioned → Provisioned (triggered by upgrade) |
| `Deprovisioning` | InGracePeriod Deprovision → Deprovisioned or InGracePeriod Delete → None |
| `Restoring` | Provisioned → Provisioned (triggered by restore) |

## Scenario 64: Grace Period
> 来源: ado-wiki-provisioning-overview.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Scenario | Length |
|----------|--------|
| Grace Period for Reprovision | Enterprise(7d), VSB(1d) |
| Grace Period for Deprovision | Enterprise(7d), VSB(1d) |
| Grace Period for Delete | Enterprise(7d), VSB(1d) |
| Grace Period for Fraud Block | Enterprise(7d), VSB(3d if used, 1d never used) |
| Grace Period for Guard Rail | 15d (in don't touch list) |

## Scenario 65: Reserved VM Error Codes
> 来源: ado-wiki-reservation-error-list.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When the following errors are encountered during provisioning/reprovision or resizing, the failed VM will be deferred for deletion to allow further investigation:
   - **Retention periods**: Test/SH: 4 days | PPE/PE 1P: 7 days | PPE/PE Non-1P: 14 days

## Scenario 66: Error codes that trigger reservation:
> 来源: ado-wiki-reservation-error-list.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - JoinDomainFailed
   - HybridAADJoinFailed
   - IntuneEnrollFailed
   - CustomscriptextensionFailed
   - RunDscExtensionFailed
   - DscExtension_UnableToCheckFirewallStatus
   - DscExtension_ClassNotRegistered
   - VMExtensionProvisioningTimeout
   - VMExtensionProvisioningError
   - ZtdAadjFail
   - DeploymentTimeout
   - UserNotFoundInExtension
   - AzureCompute_OSNotGeneralized
   - AzureCompute_VMAgentStatusCommunicationError
   - AzureCompute_OSProvisioningTimedOut
   - AzureCompute_OSNotProperlyPrepared
   - VMAgentUnavailable
> If your error code is not listed above, contact SaaF to engage dev for ad-hoc reservation.

## Scenario 67: Investigation Steps
> 来源: ado-wiki-reservation-error-list.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Find the reserved VM in **CPCD** → Provision Diagnostic → Reserved CPC VM Due To Provision/Resize Failed
2. Use **Azure Support Center** to:
   - Get **Inspect IaaS Disk** for the reserved VM
   - Get **Guest Agent VM Logs** for the reserved VM
3. Investigate the root cause from collected logs

## Scenario 68: 2. User Scenario / UX Flow
> 来源: ado-wiki-reserve-user-provisioning-scoping.md | 适用: \u901a\u7528 \u2705

### 排查步骤
These questions clarify **where in the experience the issue occurs**.
   - What exactly is the user trying to do when the issue happens?
   - Provision a new Cloud PC
   - Retry after a failed provisioning
   - Access an already provisioned Reserve Cloud PC
   - Is the **Provision Cloud PC** option visible in the Windows App?
   - On which platform is the user using the Windows App? (Windows / macOS / iOS / Web)
   - Does the issue occur **before**, **during**, or **after** provisioning is initiated?
   - Is the user seeing an **error message**, a silent failure, or no option at all?

## Scenario 69: 4. Reproducibility & Pattern
> 来源: ado-wiki-reserve-user-provisioning-scoping.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Does the issue reproduce consistently for the same user?
   - Does it reproduce for **different users** with the same policy?
   - Have any users successfully provisioned Reserve Cloud PCs in this tenant?
   - Does the behavior differ based on **client platform** (e.g., Windows vs iOS)?

## Scenario 70: 8. Decision Check (CSS Internal Use)
> 来源: ado-wiki-reserve-user-provisioning-scoping.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Configuration issue → Guide customer to correct Intune / policy setup
   - Known limitation → Set expectations and share documented behavior
   - Known issue → Validate against existing TSG / known issues
   - Potential bug → Escalate with evidence and repro details

## Scenario 71: Enable user provisioning (admin steps)
> 来源: ado-wiki-reserve-user-provisioning-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
User self-provisioning is off by default and must be explicitly enabled by an administrator. Managed in Microsoft Intune, scoped to specific users using Microsoft Entra ID groups.
1. Sign in to Intune admin center > Devices > Windows 365 > Settings
2. Select Create > Windows App settings (preview)
3. Enter Name and Description, select Next
4. Under User self-service actions, toggle "Enable users to provision new Cloud PC instances" to Enabled. Only applies to users with Reserve provisioning policy and license. Select Next.
5. [Optional] Apply Scope Tags. Select Next.
6. Under Assignments, Add groups and select target Entra user groups. Select > Next.
7. Review and select Create.

## Scenario 72: End-user experience
> 来源: ado-wiki-reserve-user-provisioning-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Log in to Windows App
2. Click device card "Set up my Cloud PC"
3. Consent prompt appears with setup duration notice. Select "Begin Set Up"
4. Device card shows spinning status during provisioning. Notification when complete.
5. Click device card to connect once provisioned.
6. Return from Windows App when done.
7. If access time remaining, card returns to deprovisioned state - can provision again.

## Scenario 73: Provisioning option not visible in Windows App
> 来源: ado-wiki-reserve-user-provisioning-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Common causes:**
   - User not in scoped Entra ID group for self-provisioning setting
   - Conflicting settings across multiple Entra Groups
   - Windows App settings not yet delivered to client
   - Missing active Reserve license or provisioning policy
**Troubleshoot:**
1. Try web client and app versions - check if showing in one but not other
2. Wait a few minutes, refresh/restart client
3. Verify user has setting enabled; check multiple groups/settings priority order
4. Check CPCD > Settings > User Settings Policy Overview blade
5. Verify license + provisioning policy + remaining time (Reserve License Report)
6. If unresolved, file ICM. Customers can still provision from Intune.

## Scenario 74: Provisioning fails or does not start
> 来源: ado-wiki-reserve-user-provisioning-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Follow standard provisioning failure troubleshooting steps - not specific to user provisioning setting.

## Scenario 75: Unexpected removal of Cloud PC entry
> 来源: ado-wiki-reserve-user-provisioning-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Common causes:**
   - Self-provisioning setting disabled or group scope changed
   - Usage period expired, access automatically revoked
   - Users should receive Windows App notification
**Troubleshoot:**
1. Check if user received notification
2. Verify setting enabled and group/settings priority order
3. Verify license + provisioning policy + remaining time
4. If unexplained, file ICM for setting <> Windows App communication issue

## Scenario 76: Diagnostics and support
> 来源: ado-wiki-reserve-user-provisioning-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Provisioning events captured in Windows App and Windows 365 telemetry
   - Validate license assignment, policy scope, setting delivery before escalating
   - No separate troubleshooting path for admin-initiated vs user-initiated provisioning - same backend logic

## Scenario 77: Common Errors (applicable to multiple actions)
> 来源: ado-wiki-w365-cpc-cogs-optimization-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
All common errors are internal service errors. If the failure may cause the machine to become inaccessible:
1. Ask customer to Restart the machine and see if it helps
2. If Restart does not help, request for lockbox and call OCE API to Deallocate/Stop then Start the machine

## Scenario 78: Specific Errors per Device Action Type
> 来源: ado-wiki-w365-cpc-cogs-optimization-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If the failure may cause the machine to become inaccessible:
1. Ask customer to Restart the machine
2. If Restart does not help, request lockbox and call OCE API to Deallocate/Stop then Start
3. If the device cannot be started from a hibernated state, involve "CloudPC Service / Cloud PC Cost Optimization" team for further investigation

## Scenario 79: How To Cancel Scheduled But Not Yet Run COGS Optimization Workflow Items
> 来源: ado-wiki-w365-cpc-cogs-optimization-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Raise an IcM and assign to "CloudPC Service / Cloud PC Cost Optimization" team.

## Scenario 80: How To Exclude Tenant(s) From COGS Optimization Scenarios
> 来源: ado-wiki-w365-cpc-cogs-optimization-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Raise an IcM and assign to "CloudPC Service / Cloud PC Cost Optimization" team.
Escalation path:
   - CSS → Open ICM with SaaF team after initial investigation
   - SaaF → Triage the ICM and engage CloudPC Service / Cloud PC Cost Optimization

## Scenario 81: FAQ
> 来源: ado-wiki-w365-cpc-cogs-optimization-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Q: Is hibernate-resume a customer facing feature for Windows 365?**
A: NO. Windows 365 leverages hibernate-resume as an internal capability to optimize COGS. Customers do NOT have visibility or control into COGS optimizations.
**Q: What message to use if asked about hibernate-resume or Cloud PCs running 24/7?**
A: Communicate that as a SaaS solution, Microsoft undertakes infrastructure optimizations for capacity, resiliency, performance, and reliability without disrupting user experience. Do not talk about hibernate-resume specifically. Share: https://learn.microsoft.com/en-us/office365/servicedescriptions/windows-365-service-description/windows-365-service-description#service-responsibility
**Q: Why do stop-start given state will be lost?**
A: Not all Cloud PCs are hibernate capable. For non-hibernate-capable Cloud PCs, ONLY IF zero utilization in last 28 days AND no active/disconnected session, stop-start is performed (no impact as no session state to preserve).
**Q: How is IT admin not impacted?**
A: Cloud PCs run at least 10 hours/day for Intune sync. If 2 IT admin actions triggered when Cloud PC is hibernated in last 30 days → Cloud PC excluded from COGS operations next 30 days.
**Q: How is end user not impacted?**
A: Multiple guardrails: user presence check before COGS operations; 2 admin/end-user/OCE start actions in last 30 days → automatic exclusion for next 30 days.
**Q: Are 3rd party client users included?**
A: Customers using 3rd party clients are excluded from COGS operations in current phase2 rollout.
**Q: Can we exclude customers?**
A: Yes, contact COGS v-team.
**Q: Is restart a COGS issue?**
A: Deallocation only on zero utilization devices (no login for 30+ days). COGS should not cause loss of state. Assume restart issues are not COGS related until proven otherwise.
**Q: Can customers disable hibernation within Cloud PC?**
A: Advise customers NOT to disable hibernation. The hiberfile.sys is necessary for normal service operation.

## Scenario 82: Scenario
> 来源: ado-wiki-w365-find-cpc-with-vip.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Cloud PC may be abused as attacker; VIP captured by Azure Security team triggers a security incident.

## Scenario 83: Process
> 来源: ado-wiki-w365-find-cpc-with-vip.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Use CPCD (https://aka.ms/cpcd) > Toolbox > Find CPC with Vip
2. Find the tenant ID behind the VIP
3. Engage Human Investigation Team (HIT, contact GUHON) to verify

## Scenario 84: Required Kusto Access
> 来源: ado-wiki-w365-find-cpc-with-vip.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Cluster | Endpoint | Access |
|---------|----------|--------|
| azslb | https://azslb.kusto.windows.net | Join SG AznwKustoReader in idweb |
| azcsupfollower | https://azcsupfollower.kusto.windows.net | Request Azure Standard Access in CoreIdentity |
