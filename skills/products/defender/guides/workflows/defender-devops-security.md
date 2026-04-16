# Defender DevOps 安全 — 排查工作流

**来源草稿**: ado-wiki-a-agentless-code-scanning-tsg.md, ado-wiki-a-agentless-secret-scanning-tsg.md, ado-wiki-a-devops-hardening-r2.md, ado-wiki-a-overview-of-defender-for-devops.md, ado-wiki-a-support-boundaries-ghazdo-r2.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Agentless code scanning in DevOps security - Support TSG
> 来源: ado-wiki-a-agentless-code-scanning-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Verify feature enablement**: Confirm with the customer that agentless code scanning is enabled. This step ensures accurate troubleshooting with the appropriate engineering team.
2. **Escalate delayed findings**: If findings are delayed beyond a few hours after feature enablement, escalate the issue with verification of the enablement status.

### Kusto 诊断查询
**查询 1:**
```kusto
let scanned = cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
| union cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| extend TaskId = AdditionalData.taskManifest.TaskId
| where tostring(ArtifactContext.ArtifactType) == "MsdoTarget"
| extend RepoName = tostring(ArtifactContext.Properties.RepositoryName)
| extend RepoId = tostring(ArtifactContext.Properties.RepoId)
| extend SubscriptionId = tostring(ArtifactContext.Properties.SubscriptionId)
| extend IsSuccess = LifeCycleEvent == "ScrapeSuccessfullyDone"
| extend IsTriggerFailure = LifeCycleEvent == "TriggerScrapeWorkerFailed"
| extend connectorName = tostring(UserContext.ConnectorName)
| extend Region = tostring(ArtifactContext.Region)
| extend ConnectorId = tostring(ArtifactContext.Properties.ConnectorId)
| extend RepositoryName = tostring(ArtifactContext.Properties.RepositoryName);
scanned
| where RepoId == "<<RepoId>>"
| summarize sum(IsSuccess), sum(IsTriggerFailure), any(*) by EventId
```

**查询 2:**
```kusto
cluster('rome.kusto.windows.net').database('DetectionLogs').Span
| where env_time > ago(2d)
| where site_name contains "prd" and site_name contains "craper"
| where name == "TaskDeleter.ExtractSingleContainerLogs"
| extend customData_json = parse_json(customData)
| extend containerName = tostring(customData_json.containerName)
| extend logs = tostring(todynamic(customData).logs)
| extend gzip_logs = gzip_decompress_from_base64_string(logs)
| where containerName == "<<TaskId from previous query>>"
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Secret Scanning on Deployment Templates (ARM and Multi-cloud)
> 来源: ado-wiki-a-agentless-secret-scanning-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Azure Discovery Service / Multi-Cloud Discovery Service**: Collects payloads of resources to scan, ingested into EntityStore.
2. **Control Plane Data Analysis (CPDA)**: Backend service running the secret scanning engine on collected payloads.
3. **DiskScanningResultProcessor (DSRP)**: Collects scan results and reports them to Assessments Modeller and CloudMap for recommendations and security graph.

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').DiskScanningVmScanners
| where SubscriptionId == "{subscriptionId}"
| take 1
```

**查询 2:**
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where applicationName endswith "DiskScanningApp"
| where operationName endswith "RunState"
| extend Data = todynamic(customData)
| where customData has "{subscriptionId}"
| distinct tostring(Data.VmsCount), env_cloud_deploymentUnit
```

**查询 3:**
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where operationName == "IfxSchemaOps.ApiRoutingScanResultProcessor_ProcessAsync"
| extend Data = todynamic(customData)
| where Data.ScannerIdentifier == "Secrets"
| where Data.ScannedResourceId =~ "{resourceID}"
| project env_time, customData, resultDescription
```

**查询 4:**
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time > ago(1d)
| where applicationName == "fabric:/DiskScanningResultsProcessorApp"
| where operationName contains "SecretResourcesDataEnrichmentHandler_HandleScanResultAsync"
| extend MachineAzureUniqueId = tostring(todynamic(customData).ResourceAzureUniqueId)
| project env_time, MachineAzureUniqueId, customData
| where MachineAzureUniqueId =~ "{resourceID}"
```

**查询 5:**
```kusto
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricTraceEvent
| where env_time > ago(2d)
| where message contains "{machineId}"
| where message contains "ScanType=SecretScanResults"
| project env_time, message, applicationName, serviceName
| sort by env_time desc
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: DevOps Hardening
> 来源: ado-wiki-a-devops-hardening-r2.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. If a connector, repository/organization, or resource is removed, when will it be deleted from Microsoft Defender for Cloud (MDC)?
2. How will DevOps Hardening be billed?

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: Overview of Microsoft Defender for DevOps
> 来源: ado-wiki-a-overview-of-defender-for-devops.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. For DevOps connector: DevOps extension is required.
2. For GitHub connector: GitHub Action is required.
3. MDC Environment connector is required.
4. Connector authorization is required with customer credentials.
5. **Recommendations are NOT Policy based — they are API based.**
6. Default escalation: Use the standard IcM template (creates IcM with the right template for the larger team).
7. If issue is specifically with Defender for DevOps **Clients**: escalate to "Microsoft Defender for Cloud/Guardians" using this template.

---
