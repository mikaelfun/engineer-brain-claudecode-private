---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/GCP Agentless scanning/[TSG] GCP Agentless scanning VA issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2FGCP%20Agentless%20scanning%2F%5BTSG%5D%20GCP%20Agentless%20scanning%20VA%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] GCP Agentless Scanning VA Issues

Diagnostic decision tree for GCP agentless scanning VA pipeline. All queries run against **Romelogs cluster, Rome3Prod database**.

## Step 1: Did scan results reach VA?

Instances listed from this query **failed to reach VA** for results processing:

```kql
let gcpDsPreparedMachines = FabricServiceOE
| where env_time >= ago(2d)
| where applicationName endswith "DiskScanningApp"
| where operationName has "GcpScanJobPreparer.PrepareAsync"
| extend Data = todynamic(customData)
| extend ScannedVmByScanId = Data.ScannedVmByScanId
| extend Completed = tobool(Data.Completed)
| mv-expand ScannedVmByScanId
| extend ScannedAzureVmId = tostring(ScannedVmByScanId.Key)
| extend ScanId = tostring(ScannedVmByScanId.Value)
| distinct ScannedAzureVmId
| extend ScannedAzureVmId = tolower(ScannedAzureVmId);
let azureIdToDsIdMapping = union
(cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d)),
(cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d))
| extend RecordAzureUniqueIdentifier = tostring(RecordIdentifierInfo.RecordAzureUniqueIdentifier),
         DiskScanningInstanceId = tostring(Record.selfLink)
| distinct RecordAzureUniqueIdentifier, DiskScanningInstanceId
| extend RecordAzureUniqueIdentifier = tolower(RecordAzureUniqueIdentifier),
         DiskScanningInstanceId = tolower(DiskScanningInstanceId);
gcpDsPreparedMachines
| join kind=leftouter (azureIdToDsIdMapping) on $left.ScannedAzureVmId == $right.DiskScanningInstanceId
| join kind=leftanti (FabricTraceEvent
    | where env_time > ago(2d)
    | where applicationName has "VaApp"
    | where message has "InternalAgentlessVaController" and message has "in cloud GCP and scanner Tvm."
    | parse message with * "request for machine " RecordAzureUniqueIdentifier " in cloud GCP" *
    | distinct RecordAzureUniqueIdentifier
    | extend RecordAzureUniqueIdentifier = tolower(RecordAzureUniqueIdentifier)) on RecordAzureUniqueIdentifier
```

## Step 2: Did scan results reach the export step?

Instances listed **failed to pass the export step**.

### GCP Native Only:
```kql
let diskScanningReachedVaMachines = FabricTraceEvent
    | where env_time > ago(2d)
    | where applicationName has "VaApp"
    | where message has "InternalAgentlessVaController" and message has "in cloud GCP and scanner Tvm."
    | parse message with * "request for machine " RecordAzureUniqueIdentifier " in cloud GCP" *
    | distinct RecordAzureUniqueIdentifier
    | extend RecordAzureUniqueIdentifier = tolower(RecordAzureUniqueIdentifier);
let gcpMachinesArrivedInExport = union
cluster('cusasctvmexportva.centralus.kusto.windows.net').database('TvmExport').SoftwareInventory,
cluster('weuasctvmexportva.westeurope.kusto.windows.net').database('TvmExport').SoftwareInventory
| where GeneratedTime >= ago(1d)
| where AzureResourceId contains "/securityentitydata/gcp-instances"
| extend AzureResourceId = tolower(AzureResourceId)
| distinct AzureResourceId;
diskScanningReachedVaMachines
| join kind=leftouter (union
    (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d)),
    (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d))
    | extend InstanceId = tostring(Record.id)
    | summarize arg_max(TimeStamp, *) by InstanceId
    | extend entityStoreId = tolower(tostring(RecordIdentifierInfo.RecordAzureUniqueIdentifier))
    | project entityStoreId, InstanceId
    | join kind=leftouter (union
        (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d)),
        (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d))
        | extend InstanceId = MachineId
        | summarize arg_max(TimeStamp, *) by InstanceId) on InstanceId
    | distinct RecordAzureUniqueIdentifier, entityStoreId
    | extend ArcId = tolower(RecordAzureUniqueIdentifier)
    | project ArcId, entityStoreId) on $left.RecordAzureUniqueIdentifier == $right.entityStoreId
| where isempty(ArcId)
| where isnotempty(entityStoreId)
| join kind=leftanti gcpMachinesArrivedInExport on $left.RecordAzureUniqueIdentifier == $right.AzureResourceId
```

### ARC Only:
```kql
let diskScanningReachedVaMachines = FabricTraceEvent
    | where env_time > ago(2d)
    | where applicationName has "VaApp"
    | where message has "InternalAgentlessVaController" and message has "in cloud GCP and scanner Tvm."
    | parse message with * "request for machine " RecordAzureUniqueIdentifier " in cloud GCP" *
    | distinct RecordAzureUniqueIdentifier
    | extend RecordAzureUniqueIdentifier = tolower(RecordAzureUniqueIdentifier);
let arcMachinesArrivedInExport = union
cluster('cusasctvmexportva.centralus.kusto.windows.net').database('TvmExport').SoftwareInventory,
cluster('weuasctvmexportva.westeurope.kusto.windows.net').database('TvmExport').SoftwareInventory
| where GeneratedTime >= ago(1d)
| where AzureResourceId has "/providers/Microsoft.HybridCompute/machines/"
| extend AzureResourceId = tolower(AzureResourceId)
| distinct AzureResourceId;
diskScanningReachedVaMachines
| join kind=leftouter (union
    (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d)),
    (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d))
    | extend InstanceId = tostring(Record.id)
    | summarize arg_max(TimeStamp, *) by InstanceId
    | extend entityStoreId = tolower(tostring(RecordIdentifierInfo.RecordAzureUniqueIdentifier))
    | project entityStoreId, InstanceId
    | join kind=leftouter (union
        (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d)),
        (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d))
        | extend InstanceId = MachineId
        | summarize arg_max(TimeStamp, *) by InstanceId) on InstanceId
    | distinct RecordAzureUniqueIdentifier, entityStoreId
    | extend ArcId = tolower(RecordAzureUniqueIdentifier)
    | project ArcId, entityStoreId) on $left.RecordAzureUniqueIdentifier == $right.entityStoreId
| where isnotempty(ArcId)
| where isnotempty(entityStoreId)
| join kind=leftanti arcMachinesArrivedInExport on $left.ArcId == $right.AzureResourceId
```

## Step 3: Were sub-assessments created after export?

Instances listed **failed to create sub-assessments**.

### ARC Only:
```kql
let arcMachinesArrivedInExport = union
cluster('cusasctvmexportva.centralus.kusto.windows.net').database('TvmExport').SoftwareInventory,
cluster('weuasctvmexportva.westeurope.kusto.windows.net').database('TvmExport').SoftwareInventory
| where GeneratedTime >= ago(1d)
| where AzureResourceId has "/providers/Microsoft.HybridCompute/machines/"
| extend AzureResourceId = tolower(AzureResourceId)
| distinct AzureResourceId;
let arcResouresWithSubAssessments = cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time >= ago(1d)
| where applicationName has "vaApp"
| where message has "Sending calculated sub-assessments for resource" and message has "VaResourceSubAssessmentManager" and message has "/Microsoft.HybridCompute/machines"
| parse message with * " for resource " Arcid
| extend Arcid = tolower(Arcid)
| distinct Arcid;
// Join with GCP prepared machines and filter out those with sub-assessments
arcMachinesArrivedInExport
| join kind=leftouter (union
    (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d)),
    (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d))
    | extend InstanceId = tostring(Record.id)
    | summarize arg_max(TimeStamp, *) by InstanceId
    | extend entityStoreId = tolower(tostring(RecordIdentifierInfo.RecordAzureUniqueIdentifier))
    | project entityStoreId, InstanceId
    | join kind=leftouter (union
        (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d)),
        (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d))
        | extend InstanceId = MachineId
        | summarize arg_max(TimeStamp, *) by InstanceId) on InstanceId
    | distinct RecordAzureUniqueIdentifier, entityStoreId
    | extend ArcId = tolower(RecordAzureUniqueIdentifier)
    | project ArcId, entityStoreId) on $left.AzureResourceId == $right.ArcId
| join kind=inner (FabricTraceEvent
    | where env_time > ago(2d) | where applicationName has "VaApp"
    | where message has "InternalAgentlessVaController" and message has "in cloud GCP and scanner Tvm."
    | parse message with * "request for machine " RecordAzureUniqueIdentifier " in cloud GCP" *
    | distinct RecordAzureUniqueIdentifier
    | extend RecordAzureUniqueIdentifier = tolower(RecordAzureUniqueIdentifier)) on $left.entityStoreId == $right.RecordAzureUniqueIdentifier
| join kind=leftanti arcResouresWithSubAssessments on $left.AzureResourceId == $right.Arcid
```

### GCP Native Only:
```kql
let gcpMachinesArrivedInExport = union
cluster('cusasctvmexportva.centralus.kusto.windows.net').database('TvmExport').SoftwareInventory,
cluster('weuasctvmexportva.westeurope.kusto.windows.net').database('TvmExport').SoftwareInventory
| where GeneratedTime >= ago(1d)
| where AzureResourceId contains "/securityentitydata/gcp-instances"
| extend AzureResourceId = tolower(AzureResourceId)
| distinct AzureResourceId;
let gcpResouresWithSubAssessments = cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time >= ago(1d)
| where applicationName has "vaApp"
| where message has "Sending calculated sub-assessments for resource" and message has "VaResourceSubAssessmentManager" and message has "/securityentitydata/gcp-instances"
| parse message with * " for resource " GcpEntityStoreId
| extend GcpEntityStoreId = tolower(GcpEntityStoreId)
| distinct GcpEntityStoreId;
gcpMachinesArrivedInExport
| join kind=leftouter (union
    (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d)),
    (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Compute_Instance | where TimeStamp >= ago(1d))
    | extend InstanceId = tostring(Record.id)
    | summarize arg_max(TimeStamp, *) by InstanceId
    | extend entityStoreId = tolower(tostring(RecordIdentifierInfo.RecordAzureUniqueIdentifier))
    | project entityStoreId, InstanceId
    | join kind=leftouter (union
        (cluster('ascentitystorflreprdeu.westeurope.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d)),
        (cluster('ascentitystorflreprdus.centralus.kusto.windows.net').database('DiscoveryGcp').Ext_GCP_Machine_Arc | where TimeStamp >= ago(1d))
        | extend InstanceId = MachineId
        | summarize arg_max(TimeStamp, *) by InstanceId) on InstanceId
    | distinct RecordAzureUniqueIdentifier, entityStoreId
    | extend ArcId = tolower(RecordAzureUniqueIdentifier)
    | project ArcId, entityStoreId) on $left.AzureResourceId == $right.entityStoreId
| where isnotempty(entityStoreId)
| where isempty(ArcId)
| join kind=leftanti gcpResouresWithSubAssessments on $left.AzureResourceId == $right.GcpEntityStoreId
```

## Diagnostic Flow Summary

```
Instance not scanned?
  ├── Step 1: Did results reach VA? (DiskScanningApp → VaApp)
  │     └── No → Issue in disk scanning platform
  ├── Step 2: Did results reach export? (VaApp → TvmExport)
  │     └── No → Issue in VA processing
  └── Step 3: Were sub-assessments created? (TvmExport → SubAssessments)
        └── No → Issue in assessment creation
```
