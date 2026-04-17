# Defender 无代理扫描 — 排查工作流

**来源草稿**: ado-wiki-a-cmk-agentless-disk-scanning.md, ado-wiki-a-diagnostics-agentless-scanning.md, ado-wiki-a-gcp-agentless-scanning-tsg.md, ado-wiki-a-gcp-agentless-scanning-va-issues.md, ado-wiki-b-agentless-vm-scanning-tsg.md, ado-wiki-b-gcp-agentless-scanning.md, ado-wiki-b-technical-knowledge-agentless-scanning.md, ado-wiki-b-tsg-agentless-k8s-node-va.md, ado-wiki-c-disk-scan-container-images.md, ado-wiki-c-product-knowledge-agentless-container-posture.md
**场景数**: 9
**生成日期**: 2026-04-07

---

## Scenario 1: Agentless Scanning - Customer Managed Key (CMK) Encrypted Disks
> 来源: ado-wiki-a-cmk-agentless-disk-scanning.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
resources
| where type =~ 'microsoft.compute/disks'
| where managedBy contains "<resource ID>"
| extend Encryption = properties.encryption.type
| extend diskEncryptionSetId = properties.encryption.diskEncryptionSetId
| project name, Encryption, managedBy, diskEncryptionSetId
```

**查询 2:**
```kusto
resources
| where type =~ 'microsoft.compute/diskencryptionsets'
| where id contains "<diskEncryptionSetId>"
| extend sourceKeyVault = properties.activeKey.sourceVault.id
| project id, sourceKeyVault
```

**查询 3:**
```kusto
let values = FabricTraceEvent
| where env_time > ago(24h) and applicationName == "fabric:/DiskScanningApp"
| extend envcvprefix = substring(env_cv, 0, 38);
values | where message contains "Creating disk encryption set for disk"
| parse message with '[CreateDisksEncryptionSetAzureScanJobPreparationAction] job ' jobid ': Creating disk encryption set for disks ' disks '; source DiskEncryptionSetResourceId: ' diskEncSet
| join kind=leftouter (values
    | where message has "Processing scan ScanVmId" and message has "CleanupResources=True"
    | parse message with '[AzureScanJobResultProcessingStateMachine] Processing scan ScanVmId=' scanvmid 'JobId=' jobid) on $left.jobid == $right.jobid
| join kind=leftouter (values
    | where message contains "NoPermission" and message contains "[StateMachine]"
    | parse message with * "Message=" exceptionMsg ", Details" *) on $left.envcvprefix == $right.envcvprefix
| join kind=leftouter (values
    | where message contains "Creating AzureScanJobPreparationContext for job "
    | parse message with "[AzureScanJobPreparationContextFactory] Creating AzureScanJobPreparationContext for job " jobid " machine names: " machineNames) on $left.envcvprefix == $right.envcvprefix
| join kind=leftouter (values
    | where message has "[AzureJobsOrchestrationController] Allocated job with ID "
    | parse message with '[AzureJobsOrchestrationController] Allocated job with ID ' jobid '. Worker ID=/subscriptions/' workerSub '/resourceGroups/' workerRegion '/providers/Microsoft.Compute/virtualMachines/' workerVmssId) on $left.jobid == $right.jobid
| project env_time, env_cv, machineNames, diskEncSet=tolower(diskEncSet), success = isnotempty(message1), error = exceptionMsg, workerVmssId
```

---

## Scenario 2: Diagnostics - ASC DiskScan Failures Tool for Agentless Scanning
> 来源: ado-wiki-a-diagnostics-agentless-scanning.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Enter the customer's **Subscription ID** in the "Subscription ID" field.
2. Enter the **Resource ID** of the resource you are troubleshooting in the "Resource ID" field.
3. Click the **Run** button.

### Portal 导航路径
- ASC Tenant Explorer
- the **Azure Support Center** and open the case you are working on
- Defender for Cloud
- the DiskScan Failures Tab

---

## Scenario 3: GCP Agentless Scanning
> 来源: ado-wiki-a-gcp-agentless-scanning-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Run diagnostic queries** from:
2. **Verify not a known limitation**: GCP Agentless scanning: Limitations-Agentless-scanning?anchor=limitations)
3. **Verify permissions**: GCP Agentless scanning: Permissions-Agentless-scanning?anchor=permissions)
4. **Check exclusion labels**: Verify instance is not excluded from scanning
5. Tenant and Subscription in Azure
6. Organization and Project in GCP
7. Relevant instances by their SelfLink

---

## Scenario 4: GCP Agentless Scanning VA Issues
> 来源: ado-wiki-a-gcp-agentless-scanning-va-issues.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
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

**查询 2:**
```kusto
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

**查询 3:**
```kusto
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

**查询 4:**
```kusto
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

**查询 5:**
```kusto
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

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Agentless VM Scanning - Troubleshooting
> 来源: ado-wiki-b-agentless-vm-scanning-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Defender for Cloud takes snapshots of VM disks.
2. It scans the snapshot in its regional, volatile, isolated, and highly secure environment.
3. Upon successful scan, it pushes the results to the MDC portal (Recommendations or Alerts).
4. If scan fails, the machine will be listed under "Not Applicable" with "Failed to scan" under Recommendations.

### Kusto 诊断查询
**查询 1:**
```kusto
let SubscriptionId = ""; //Add customer subscription
let shouldCheckSubscription = not(isempty(SubscriptionId));
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(1d)
| where shouldCheckSubscription == false or Scope has SubscriptionId
| summarize arg_max(TimeStamp, Level, *) by Plan
| project-reorder TimeStamp, RecordCreationTime, Scope, Level, Plan, SubPlan, IsEnabled, Extensions
| sort by Plan
```

**查询 2:**
```kusto
let SubscriptionId = ""; //Add customer subscription
let _resourceid = '';
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(7d)
| where HierarchyId == SubscriptionId
| where Level == "Resource" or Level == "ResourceGroup"
| where Scope contains _resourceid
| summarize arg_max(TimeStamp, Level, *) by Plan, Scope
| project-reorder TimeStamp, Level, Plan, SubPlan, IsEnabled, Scope, Extensions
```

**查询 3:**
```kusto
let _startTime = datetime(2024-12-02T23:21:31Z);
let _endTime = datetime(2024-12-03T23:21:31Z);
let _subscriptionid = '';
let _resourceid = '';
cluster("Romelogs").database("Rome3Prod").DS_ResourcesValidation(_startTime, _endTime)
| where SubscriptionId == _subscriptionid
| where ResourceId contains _resourceid
| sort by env_time
| project-reorder env_time, ValidationResult
| take 100
```

**查询 4:**
```kusto
let _endTime = datetime(2024-12-04T20:08:03Z);
let _resourceid = '';
let _startTime = datetime(2024-12-03T20:08:03Z);
let _subscriptionid = '';
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time between (_startTime .. _endTime)
| where applicationName endswith "DiskScanningApp"
| where operationName has "AzureScanJobPreparer.PrepareAsync"
| extend Data = todynamic(customData)
| extend ScannedVmByScanId = Data.ScannedVmByScanId
| extend Completed = tobool(Data.Completed)
| mv-expand ScannedVmByScanId
| extend ScannedAzureVmId = tostring(ScannedVmByScanId.Key)
| extend ScanId = tostring(ScannedVmByScanId.Value)
| where ScannedAzureVmId has _subscriptionid
| where ScannedAzureVmId has _resourceid
| extend ValidationError = Data.ValidationError
| project env_time, ScanId, ScannedAzureVmId, Completed, ValidationError, deploymentId, SourceVersion, serviceName, applicationName, customData
| sort by env_time desc
```

**查询 5:**
```kusto
let _scanid = ''; //Add scan Id from step 4
cluster("Romelogs").database("Rome3Prod").DiskScanningWorkerOperations
| where ScanId has _scanid
| sort by env_time
| project-away env_name, env_ver, env_dt_spanId, env_dt_traceId, parentId
| project-reorder env_time, name, success, OperationResult, resultDescription, ScanId, customData
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 6: Google Cloud Platform (GCP) Agentless Disk Scanning
> 来源: ado-wiki-b-gcp-agentless-scanning.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Discover Compute Instances from the customer GCP project.
2. Take a snapshot of all disks from discovered instances.
3. Initiate a new worker instance to scan customer disks.
4. Create new copy of disks from snapshots.
5. Attach disk copies to worker instance.
6. Worker scans disks and uploads results.
7. Results passed to: VA service, Secrets scanning.
8. `compute.disks.createSnapshot` - via custom role `MDCAgentlessScanningRole`
9. `compute.instances.get` - via custom role `MDCAgentlessScanningRole`
10. `roles/cloudkms.cryptoKeyEncrypterDecrypter` - for CMEK support

---

## Scenario 7: [Technical Knowledge] - Agentless Scanning
> 来源: ado-wiki-b-technical-knowledge-agentless-scanning.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **MDVM Pipeline**: Single pipeline for vulnerability calculations, integrating MDE agent and agentless scanner data.
2. **Licensing**: Both MDVM and agentless scanning require MDE license. Customers must enable CSPM plan (agentless) or Defender for Servers (P1/P2).
3. **Data Injection**: Agentless findings injected into MDE workspace. Without enabling plans, findings are filtered out.
4. **UI Integration**: MDC UI links to MDE portal because agentless and MDE-agent data are published identically.
5. **Supported OS**: Machines must run supported operating systems.
6. **Recommendation Logic**: If a VM receives agentless VA recommendations -> Healthy. No VA coverage -> Unhealthy.
7. **GetNdrTenantInfoAsync** (Step 1): Obtains VM/tenant/subscription info.
8. **DownloadVmScanResultBlobAsync** (Step 2): Retrieves VM scan results.
9. **ConvertBlobContentToNdrEventsAsync** (Step 3): Processes events.
10. **SendEventToNdrAsync** (Step 4): Sends data to MDE.
11. **CompletedSuccessfully** (Step 5): Validates success.

### Kusto 诊断查询
**查询 1:**
```kusto
cluster("Romelogs").database("Rome3Prod").FabricServiceOE
| where applicationName endswith "vaApp"
| where operationName endswith "RunState"
| extend Data = todynamic(customData)
| extend StateName = tostring(Data.StateName)
| extend StepId = tostring(Data.StepId)
| extend StateRunResult = tostring(Data.StateRunResult)
| extend ScannedVmId = tostring(Data.ScannedVmId)
| extend ScannedVmDistribution = tostring(Data.ScannedVmDistribution)
| extend CloudProvider = tostring(Data.CloudProvider)
| extend ValidNdrEventTypes = tostring(Data.ValidNdrEventTypes)
| extend MisformattedEventResults = tostring(Data.MisformattedEventResults)
| where StateName has "AgentlessVaVmScanReportStateContext"
| project ScannedVmId, env_time, env_cv, ProcessingResult = StepId, ScannedVmDistribution, CloudProvider, customData, SuccessfullyProcessedEvents = ValidNdrEventTypes, MisformattedEventResults, operationId
| summarize count() by ProcessingResult
```

### API 端点
```
PUT https://management.azure.com/subscriptions/{subscriptionID}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2023-01-01
```
```
PUT https://management.azure.com/subscriptions/{subscriptionID}/providers/Microsoft.Security/pricings/VirtualMachines?api-version=2023-01-01
```

---

## Scenario 8: Agentless K8s Node VA
> 来源: ado-wiki-b-tsg-agentless-k8s-node-va.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Agentless Scanning platform discovers customer's AKS node pools (VMSS clusters).
2. Platform splits them to underlying VMSS instances and scans each using Worker VM.
3. After scans finish, results are correlated back to the same VMSS cluster (node pool) and sent together to VA service.
4. VA service sends results to Recommendations platform, Security Map, etc.
5. Enter VMSS ID / AKS Cluster ID parameter.
6. Enter customer Subscription ID parameter.
7. Go through widgets results top to bottom.
8. Analyze any failures in the processing pipeline.

### Portal 导航路径
- [K8s node VA | Jarvis](https://portal

### Kusto 诊断查询
**查询 1:**
```kusto
let SubscriptionId = ""; // Add customer subscription
let shouldCheckSubscription = not(isempty(SubscriptionId));
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(1d)
| where shouldCheckSubscription == false or Scope has SubscriptionId
| summarize arg_max(TimeStamp, Level, *) by Plan
| project-reorder TimeStamp, RecordCreationTime, Scope, Level, Plan, SubPlan, IsEnabled, Extensions
| sort by Plan
```

---

## Scenario 9: Disk Scan of Container Images
> 来源: ado-wiki-c-disk-scan-container-images.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Disk Scan Platform** (MDC Guardians team) - Scans VMs and VMSS once daily
2. **Phoenix** (MDC Protector team) - Scans container images using AXON scanner for vulnerability reports
3. **Windows nodes**: Do not store container images on disk - not scanned
4. **Ephemeral OS**: No visibility into images on disk - not scanned
5. **Auto-scale AKS**: Nodes may be down at scan time - partial/no results

### Kusto 诊断查询
**查询 1:**
```kusto
let SubscriptionId = "<SubscriptionId>";
Environments
| where TimeStamp > ago(1d) and Level == "Subscription" and EnvironmentName == "Azure"
| where HierarchyId == SubscriptionId
| summarize arg_max(TimeStamp, *) by HierarchyId
| mv-expand Plans
| where Plans contains "Container" or Plans contains "CloudPosture"
| extend AgentlessVmScanning_IsEnabled = tostring(Plans.Extensions.AgentlessVmScanning.IsEnabled)
| extend BundleName = tostring(Plans.Bundle), SubPlan = tostring(Plans.SubPlan)
| project SubscriptionId = HierarchyId, BundleName, SubPlan, AgentlessVmScanning_IsEnabled
```

**查询 2:**
```kusto
let SubscriptionId_Value = "<SubscriptionId>";
Phoenix_DiskScan_K8sNodes_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| where SubscriptionId == SubscriptionId_Value
| extend K8sClusterName = tostring(K8sClusterContext.K8sClusterName),
         K8sClusterPoolName = tostring(K8sClusterContext.K8sClusterPoolName)
| project TenantId, SubscriptionId, K8sClusterName, K8sClusterPoolName,
          ImageDiscoveryContext, ImageScanContext, TimestampContext, K8sNodeId
```

**查询 3:**
```kusto
let ImageId_Value = "<ImageId>";
let SubscriptionId_Value = "<SubscriptionId>";
Phoenix_DiskScan_Images_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| where SubscriptionId == SubscriptionId_Value and ImageId == ImageId_Value
| extend IsDropped = tostring(ImageScanResultsRouteDetails.AxonScanner.IsDropped),
         IsSuccess = tobool(ImageScanResultsRouteDetails.AxonScanner.IsSuccess),
         K8sClusterName = tostring(K8sClusterContext.K8sClusterName)
| project TenantId, SubscriptionId, ScanId, K8sClusterName, ImageId,
          ImageScanResultsRouteDetails, IsDropped, IsSuccess, TimestampContext
```

**查询 4:**
```kusto
let ScanId_Value = "<ScanId>";
let SubscriptionId_Value = "<SubscriptionId>";
let RegistryHost_Value = "<RegistryHost>";
Phoenix_Assessments_LifeCycleEvents
| where GeneratedTimestamp > ago(7d)
| where EventId == ScanId_Value
| where Component == "Assessor" and LifeCycleEvent in ("AssessSuccessfullyDone", "AssessmentEmpty")
| extend RegistryHost = tostring(ArtifactContext.RegistryHost),
         SubscriptionId = tostring(UserContext.SubscriptionId)
| where SubscriptionId == SubscriptionId_Value and RegistryHost == RegistryHost_Value
| summarize arg_max(GeneratedTimestamp, *)
| project GeneratedTimestamp, EventId, Component, LifeCycleEvent, ArtifactContext, AdditionalData
```

---
