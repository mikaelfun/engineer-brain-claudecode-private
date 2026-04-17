# AVD W365 Resize 调整 - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Drafts fused**: 5 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-resize-failing-vm-agent-unavailable.md, ado-wiki-b-ssd-migration-8vcpu.md, ado-wiki-group-based-license-resize.md, ado-wiki-resize-v2-scoping-questions.md, ado-wiki-resize-v2-setup-guide.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| After resizing a Cloud PC, the increased storage is not refl... | The WinRE (Windows Recovery Environment) partition is enable... | Option 1 (Manual): Run DISKPART to select and delete the Win... |
| Windows 365 Cloud PC resize precheck fails with 'The request... | Resize precheck function (ResizePrecheckService.cs → BlockRe... | 1) Use CPCD CPC Availability section to confirm VM generatio... |
| Windows 365 Cloud PC resize fails early before processing be... | Cloud PC not in Provisioned state before resize, or VM is Ge... | 1) Confirm VM is Gen2. 2) Confirm Cloud PC was in Provisione... |
| Windows 365 Cloud PC resize fails mid-process during snapsho... | Snapshot creation failure or VM extension did not complete s... | 1) Check snapshot creation status. 2) Validate VM extension ... |
| Windows 365 Cloud PC resize with group-based licensing shows... | Group-based licensing assignment state inconsistency during ... | 1) Validate license assignment state. 2) Trigger retry from ... |
| Windows 365 Resize V2 fails with invalid disk size error whe... | Downsizing (reducing disk size) is not supported in Resize V... | Resize only to equal or larger disk size SKU. Inform custome... |
| Cloud PC resize fails with error CheckVmAgentStatus_customSc... | Stale registry key and folder for previous version of Micros... | Connect to impacted Cloud PC as admin: 1) reg delete "HKLM\S... |
| Cloud PC resize/upgrade fails with RegisterRDAgent_internalE... | Network connectivity issue preventing Cloud PC from accessin... | Investigate and fix network path between Cloud PC and blob s... |

### Phase 2: Detailed Investigation

#### ado-wiki-a-resize-failing-vm-agent-unavailable.md
> Source: [ado-wiki-a-resize-failing-vm-agent-unavailable.md](guides/drafts/ado-wiki-a-resize-failing-vm-agent-unavailable.md)

We might run into an issues where resize fails due to VM Agent not able to reach WireServer IP or Fabric Controller, or VM Agent is not running or Stuck.

#### Standard SSD to Premium SSD Migration for 8vCPU CPC
> Source: [ado-wiki-b-ssd-migration-8vcpu.md](guides/drafts/ado-wiki-b-ssd-migration-8vcpu.md)

**8vCPU's** (Ent, Business, GCCH/GCC) migrating from Std SSD to Premium SSD.

*Contains 3 KQL query template(s)*

#### Group-based License Resize (OCE API)
> Source: [ado-wiki-group-based-license-resize.md](guides/drafts/ado-wiki-group-based-license-resize.md)

1. If not Torus enrolled, follow SaaF Tours

*Contains 5 KQL query template(s)*

#### Scoping Questions - Windows 365 Resize V2
> Source: [ado-wiki-resize-v2-scoping-questions.md](guides/drafts/ado-wiki-resize-v2-scoping-questions.md)

## 1. Environment & Configuration

#### Resize V2 - High-level Steps
> Source: [ado-wiki-resize-v2-setup-guide.md](guides/drafts/ado-wiki-resize-v2-setup-guide.md)

1. Admin selects a provisioned Cloud PC in MEM

### Key KQL Queries

**Query 1:**
```kql
let env = 'PROD';
let envTime = ago(30d);
let CloudPCEvent = () {
    cluster("cloudpc.eastus2").database("CloudPC").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("CloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPC").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpc.eastus2").database("CloudPCProd").table("OTelCloudPCEvent")
    | union isfuzzy=true cluster("cloudpcneu.northeurope").data
```

**Query 2:**
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

**Query 3:**
```kql
CloudPCEvent
| where * contains "<WorkflowId>"
| where ApplicationName == 'cogssvc'
| project env_time, env_cloud_name, env_cloud_environment, ApplicationName, BuildVersion, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, DeviceId, OtherIdentifiers, ActivityId
| order by env_time desc
```

**Query 4:**
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

**Query 5:**
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

**Query 6:**
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
  on $left.Devic
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | After resizing a Cloud PC, the increased storage is not reflected within the mac... | The WinRE (Windows Recovery Environment) partition is enabled on the Cloud PC an... | Option 1 (Manual): Run DISKPART to select and delete the WinRE partition (DELETE... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Cloud PC resize precheck fails with 'The requested feature is not su... | Resize precheck function (ResizePrecheckService.cs → BlockResizeForGen1VM) detec... | 1) Use CPCD CPC Availability section to confirm VM generation. 2) If CPC shows G... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Cloud PC resize fails early before processing begins | Cloud PC not in Provisioned state before resize, or VM is Gen1 (Gen2 required) | 1) Confirm VM is Gen2. 2) Confirm Cloud PC was in Provisioned state. 3) Retry re... | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 Cloud PC resize fails mid-process during snapshot or VM extension ph... | Snapshot creation failure or VM extension did not complete successfully during r... | 1) Check snapshot creation status. 2) Validate VM extension completion. 3) Retry... | 🔵 7.5 | ADO Wiki |
| 5 | Windows 365 Cloud PC resize with group-based licensing shows license/VM spec mis... | Group-based licensing assignment state inconsistency during resize V2 process | 1) Validate license assignment state. 2) Trigger retry from MEM portal. 3) Escal... | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Resize V2 fails with invalid disk size error when attempting to down... | Downsizing (reducing disk size) is not supported in Resize V2. Only equal or lar... | Resize only to equal or larger disk size SKU. Inform customer that downsizing is... | 🔵 7.5 | ADO Wiki |
| 7 | Cloud PC resize fails with error CheckVmAgentStatus_customScriptExtensionHandler... | Stale registry key and folder for previous version of Microsoft.Compute.CustomSc... | Connect to impacted Cloud PC as admin: 1) reg delete "HKLM\SOFTWARE\Microsoft\Wi... | 🔵 7.5 | ADO Wiki |
| 8 | Cloud PC resize/upgrade fails with RegisterRDAgent_internalError; blob download ... | Network connectivity issue preventing Cloud PC from accessing Windows 365 provis... | Investigate and fix network path between Cloud PC and blob storage URL (saprod.i... | 🔵 7.5 | ADO Wiki |
| 9 | Cloud PC inaccessible. CPCD: AVDStatus=Unavailable, FailType=RunScriptTimeout. H... | Cloud PC disk completely full preventing VM agent from functioning | Option 1: Restore Cloud PC to time when disk was not full, then clean up. Option... | 🔵 7.5 | ADO Wiki |
