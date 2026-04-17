# AVD W365 Resize 调整 — 排查工作流

**来源草稿**: ado-wiki-a-resize-failing-vm-agent-unavailable.md, ado-wiki-b-ssd-migration-8vcpu.md, ado-wiki-group-based-license-resize.md, ado-wiki-resize-v2-scoping-questions.md, ado-wiki-resize-v2-setup-guide.md
**Kusto 引用**: (无)
**场景数**: 23
**生成日期**: 2026-04-07

---

## Scenario 1: We might run into an issues where resize fails due to VM Agent not able to reach WireServer IP or Fabric Controller, or VM Agent is not running or Stuck.
> 来源: ado-wiki-a-resize-failing-vm-agent-unavailable.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Please follow the below steps to troubleshoot the issue.
1. Run CMD.exe **as Administrator** from CPC
Execute:
psexec -i -s cmd.exe   (Using PsExec tool to run CMD with system account)
from CMD run PowerShell.exe
2. Run the below command from PowerShell command one by one:
Test-NetConnection -ComputerName 168.63.129.16 -Port 80
Test-NetConnection -ComputerName 168.63.129.16 -Port 32526
Invoke-RestMethod -Headers @{"Metadata"="true"} -Method GET -Uri http://168.63.129.16/?comp=versions
3. Remove any 3rd party Anti-Virus like McAfee or VPN or Proxy from networking side from customer envt. We have seen in past customer side proxy may bypass connection but since the connection is coming from proxy, the azure side network component rejects the connection. So please remove any VPN/Proxy or Anti virus from the machine.
4. Collect below logs from IaaS Disk for the CPC which is failing
C:\WindowsAzure\Logs\WaAppAgent.log
C:\WindowsAzure\Logs\TransparentInstaller.log
Use the below link to try to analyze the above collected logs.
https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows-azure-guest-agent
5. Check if the following services are in running status, and if there are any policies or scripts block the following services.
RDAgent
WindowsAzureGuestAgent
WindowsAzureTelemetryService

## Scenario 2: Standard SSD to Premium SSD Migration for 8vCPU CPC
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: Global-only \u274c

### 排查步骤
**8vCPU's** (Ent, Business, GCCH/GCC) migrating from Std SSD to Premium SSD.
Migration Start Date: 4/3/24
Migration is manual currently and can be tracked using the SSD Migration Breakdown Excel sheet (see wiki attachment).
Premium SSD migration will take place in multiple rounds over the next 5-6 months. We will be targeting inactive CPCs first and then move to active CPCs where migration is triggered through user-initiated reboot. Snapshot will be taken for all CPCs right before migration. In the rare case that a failure occurs, the CPC may be unavailable for 1-2 hours.

## Scenario 3: Safety measures
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Azure storage team doesn't expect any such failures to happen during migration. At all times, we will adhere to Azure Storage recommended throttling limits.
2. Already tested rigorously in PPE and other env with no issues.
3. Migration plan targets all inactive CPCs first. Assuming one of the inactive CPC fails migration, it will be restored within a couple of hours. We also check for user presence and abort migration if they are present.
4. Even with active CPCs, we will first target business and non-critical customers. Only when 100% confident will we move to Enterprise customers.

## Scenario 4: Failure handling
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If a single occurrence of Azure Disk Change API failure occurs:
1. Monitors will create a Sev 2/3 notifying the team
2. Stop all remaining migrations in the queue and new migrations not yet queued
3. Troubleshoot to see if restore is needed or is it an Azure API error not impacting customer
4. If restore is needed, involve the connectivity/restore teams to proceed with restore from just-in-time snapshot
5. Confirm the issue is resolved
**ICM Team name: Cloud PC Hosting - Frontline, 1P**

## Scenario 5: KQL: Check DiskUpgrade status
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
let env = 'PROD';
let envTime = ago(30d);
let CloudPCEvent = () {
    cluster("cloudpc.eastus2").database("CloudPC").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPC").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpcneu.northeurope").database("CloudPCProd").table('CloudPCEvent')
    | union isfuzzy=true cluster("cloudpcneu.northeurope").database("CloudPCProd").table('OTelCloudPCEvent')
};
CloudPCEvent()
| where env_cloud_environment == env
| where env_time > envTime
| where ApplicationName == 'cogssvc' and ComponentName == 'EventGridService' and Col1 startswith 'Success to publish '
| extend jsonString = replace_string(replace_regex(Col1, @'Success to publish [a-zA-Z]+ event with payload: ', ''), '}.', '}')
| extend json = parse_json(jsonString)
| extend WorkflowExecutionStatus = tostring(json.Payload.WorkflowExecutionStatus)
| extend CloudPcId = toguid(json.Payload.ResourceId)
| extend WorkflowId = toguid(json.Payload.WorkflowInstanceId)
| extend WorkflowName = tostring(json.Payload.WorkflowName)
| extend HasWorkflowEnded = tobool(json.Payload.HasWorkflowEnded)
| extend ActivityName = tostring(json.Payload.ActivityName)
| where HasWorkflowEnded == true and WorkflowName contains 'DiskUpgrade'
// | where CloudPcId in () // provide the list of CloudPcIds here
| project env_time, CloudPcId, WorkflowId, WorkflowName, ActivityName, WorkflowExecutionStatus, env_cloud_name
```
`[来源: ado-wiki-b-ssd-migration-8vcpu.md]`

## Scenario 6: KQL: Get DiskUpgrade WFs with failure
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(7d)
| where env_cloud_environment == 'PROD'
| where ApplicationName == 'cogssvc'
| where * contains 'DiskUpgrade failed for'
| project env_time, env_cloud_name, env_cloud_environment, ApplicationName, BuildVersion, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, DeviceId, OtherIdentifiers, ActivityId
| order by env_time desc
| take 100
```
`[来源: ado-wiki-b-ssd-migration-8vcpu.md]`

## Scenario 7: KQL: Drill down by WorkflowId
> 来源: ado-wiki-b-ssd-migration-8vcpu.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where * contains "<WorkflowId>"
| where ApplicationName == 'cogssvc'
| project env_time, env_cloud_name, env_cloud_environment, ApplicationName, BuildVersion, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, DeviceId, OtherIdentifiers, ActivityId
| order by env_time desc
```
`[来源: ado-wiki-b-ssd-migration-8vcpu.md]`

## Scenario 8: JIT Access Preparation
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. If not Torus enrolled, follow SaaF Tours
2. Join **CMDCPCSupport** eligibility at OSP Identity (8 hours provisioning)
3. JIT elevate in Torus Client/PROD DMS:
```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"
```
4. **[SAW Enforced]** Navigate to Geneva Action portal, login with Torus account
JIT GROUP: CMDCPCSupport-JIT-PE-PlatformServiceOperator (ReadWrite, DataAccessLevel)

## Scenario 9: Pre-requirements
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Default: 8 work items every 5 minutes per tenant
   - Trusted tenant: 50 work items every 5 minutes (engage Workspace OCE to mark tenant trusted with score 1)

## Scenario 10: Resize Steps Overview
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
C = customer operation, M = Microsoft OCE operation

## Scenario 11: Step 3: Check Original CPC Status
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-group-based-license-resize.md]`
DisplayStatus should be **provisioned**.

## Scenario 12: Step 3: Check Target CPC Status
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-group-based-license-resize.md]`
There should be **no records**. If records exist, those users don't meet resize condition.

## Scenario 13: Step 3: Prepare Data for OCE API
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-group-based-license-resize.md]`
Save result as txt, delete header "OCE".

## Scenario 14: Step 3: Call OCE API (Batch Mode)
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-group-based-license-resize.md]`

## Scenario 15: Step 5: Check Resize Progress
> 来源: ado-wiki-group-based-license-resize.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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
`[来源: ado-wiki-group-based-license-resize.md]`
Kusto results have ~20 min delay. Also check CPC Diagnostics (azure.com).

## Scenario 16: 1. Environment & Configuration
> 来源: ado-wiki-resize-v2-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is this Windows 365 Enterprise or Business?
   - Are the affected Cloud PCs using direct license assignment or group-based licensing?
   - What is the current Cloud PC status (Provisioned, Pending resize, Grace period, Resize failed)?
   - Are you resizing a Gen2 VM, or are any affected Cloud PCs Gen1?
   - What is the source SKU and target SKU?
   - Is this a single device resize or a bulk resize?

## Scenario 17: 2. User Scenario / UX
> 来源: ado-wiki-resize-v2-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What does the admin/user see in the portal when resize fails?
   - Does the Cloud PC become unavailable during/after the resize attempt?
   - After resize attempt, does user see original Cloud PC, new Cloud PC, or both?

## Scenario 18: 3. Scope & Impact
> 来源: ado-wiki-resize-v2-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - How many users/Cloud PCs are affected?
   - Is this impacting production users or test environment?
   - Does the issue affect all resize attempts or only specific SKUs/users?

## Scenario 19: 4. Licensing & Resize V2 Specific Checks
> 来源: ado-wiki-resize-v2-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When using group-based licensing: was target license assigned and source license removed?
   - Did any Cloud PCs remain in pending resize state longer than expected?
   - After resize attempt, does license SKU match Cloud PC hardware spec?

## Scenario 20: 5. CSS Decision-Making
> 来源: ado-wiki-resize-v2-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Configuration issue vs Known limitation vs Service inconsistency vs Potential product bug
   - Next step: Retry resize / License correction / Customer guidance / Escalation to PG

## Scenario 21: Resize V2 - High-level Steps
> 来源: ado-wiki-resize-v2-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Admin selects a provisioned Cloud PC in MEM
2. Admin triggers Resize
3. Backend validates: Cloud PC state, VM generation, existing target Cloud PC conflicts
4. Resize job starts: VM shutdown → Snapshot creation → New VM creation → Extensions execution
5. On success: New Cloud PC becomes active, old resources cleaned up

## Scenario 22: What CSS Should Verify
> 来源: ado-wiki-resize-v2-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Cloud PC state before resize is Provisioned
   - Target SKU is valid
   - Resize job transitions beyond snapshot phase

## Scenario 23: What Good Looks Like
> 来源: ado-wiki-resize-v2-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Cloud PC returns to Provisioned state
   - Device spec reflects target SKU
   - User can sign in successfully
