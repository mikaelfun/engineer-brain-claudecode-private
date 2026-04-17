# Defender 多云连接 (AWS/GCP) — 排查工作流

**来源草稿**: ado-wiki-a-gcp-audit-logs-tsg.md, ado-wiki-b-tsg-gcp-agentless-platform-issues.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: GCP Audit Logs
> 来源: ado-wiki-a-gcp-audit-logs-tsg.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- a support ticket with the IcM group "Defender CSPM/Defenders - CRIs"
- support ticket to IcM group "Defenders - CRIs"
- support ticket to IcM group "RomeDetection/CustomerSupport"

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romeeus.eastus').database("ProdRawEvents").K8S_KubeAudit
| union cluster('romeuksouth.uksouth').database("ProdRawEvents").K8S_KubeAudit
| where ingestion_time() > ago(1h)
| where AzureResourceId has "securityConnectors"
| where AzureResourceId contains "gcp-clusters"
| where AzureResourceId contains "<customers-gke-cluster-name>"
```

**查询 2:**
```kusto
cluster('mdcentitystoreprodus.centralus').database("DiscoveryGcp").Ext_Container_Cluster_ProvisioningStatus
| union cluster('mdcentitystoreprodeu.westeurope').database("DiscoveryGcp").Ext_Container_Cluster_ProvisioningStatus
| where ingestion_time() > ago(18h)
| where ComponentName == ""
| where RecordNativeCloudUniqueIdentifier contains "<customers-gke-cluster-name>"
```

**查询 3:**
```kusto
cluster('mdcentitystoreprodus.centralus').database("DiscoveryGcp").Container_Cluster
| union cluster('mdcentitystoreprodeu.westeurope').database("DiscoveryGcp").Container_Cluster
| where ingestion_time() > ago(18h)
| extend Identifier = tostring(RecordIdentifierInfo["RecordNativeCloudUniqueIdentifier"])
| where Identifier contains "<customers-gke-cluster-name>"
```

**查询 4:**
```kusto
let Lookback = 1h;
let ClusterName = "sf-detection-prod-cus";
cluster('Rome').database('DetectionLogs').ServiceFabricIfxTraceEvent
| where env_time > ago(Lookback)
| where applicationName == "fabric:/MultiCloudK8sOnboardingApp"
| where clusterName == ClusterName
| where serviceName == "fabric:/MultiCloudK8sOnboardingApp/GcpK8sOnboardingService"
| parse env_cv with "##" rootOperationId "_" *
| join kind=inner
    (
    cluster('Rome').database('DetectionLogs').ServiceFabricDynamicOE
    | where env_time > ago(Lookback)
    | where applicationName == "fabric:/MultiCloudK8sOnboardingApp"
    | where clusterName == ClusterName
    | where serviceName == "fabric:/MultiCloudK8sOnboardingApp/GcpK8sOnboardingService"
    ) on rootOperationId
| project env_time, rootOperationId, message, operationName, customData, durationMs
```

**查询 5:**
```kusto
let KustoCluster = "Ascentitystoreprdus";
let projectNumber = "<projectId>";
cluster(KustoCluster).database('DiscoveryGcp').Internal_GcpSecurityConnector
| where RecordProviderInfo.HierarchyIdentifier == projectNumber
| summarize arg_max(TimeStamp, *)
| mv-expand offering=Record['offerings']
| extend IsContainersBundleEnabled = offering.offeringType == "DefenderForContainersGcp"
| where IsContainersBundleEnabled
| extend additionalData = offering.additionalData
| project IsContainersBundleEnabled,
    IsAuditLogsAutoProvisioned = additionalData.AuditLogsAutoProvisioningFlag,
    IsDefenderAgentAutoProvisoned = additionalData.DefenderAgentAutoProvisioningFlag,
    IsPolicyAutoProvisioned = additionalData.PolicyAgentAutoProvisioningFlag, offering, Record
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: GCP Agentless Scanning Platform Issues
> 来源: ado-wiki-b-tsg-gcp-agentless-platform-issues.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
union cluster("https://ascentitystoreprdus.centralus.kusto.windows.net").database("MDCGlobalData").Environments,
cluster("https://ascentitystoreprdeu.westeurope.kusto.windows.net").database("MDCGlobalData").Environments
| where TimeStamp >= ago(1d)
| where HierarchyId == "{CUSTOMER_PROJECT_ID}"
| where EnvironmentName == "GCP"
| summarize arg_max(TimeStamp, *) by HierarchyId
| mv-expand offering = SecurityConnector.offerings
| where offering.offeringType == "DefenderCspm"
| extend VmScannersString = tostring(offering.additionalData.VmScanners)
| extend VmScannersJson = parse_json(VmScannersString)
| extend VmScannersEnabled = tobool(VmScannersJson.enabled)
| project HierarchyId, Plans, offering, VmScannersEnabled
```

**查询 2:**
```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Starting resources discovery job for GCP ProjectId: {CUSTOMER_PROJECT_ID}"
| project env_time, env_cv, buildId, message
```

**查询 3:**
```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Found"
| parse message with "[GcpScanJobQueuerProjectStateMachine] Found " InstanceCount " vmsToScan for: Subscription=" SubscriptionId " ProjectId=" ProjectId " | vmsToScan: [" VmsToScan "]"
| where ProjectId == "{CUSTOMER_PROJECT_ID}"
| project env_time, env_cv, buildId, message, InstanceCount, VmsToScan
```

**查询 4:**
```kusto
cluster("Romelogs").database("Rome3Prod").DS_ResourcesValidation(ago(7d), now())
| where Cloud == "GCP"
| where ResourceId == "{INSTANCE_SELF_LINK}"
```

**查询 5:**
```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Got" and message has "scan jobs to queue"
| parse message with "[GcpScanJobQueuerProjectStateMachine] Got " ScanJobsCount " scan jobs to queue. Subscription=" SubscriptionId " ProjectId=" ProjectId " | ScanJobs: [" ScanJobs "] "
| where ScanJobs has "{INSTANCE_SELF_LINK}"
| project env_time, env_cv, buildId, message, ScanJobs
```

---
