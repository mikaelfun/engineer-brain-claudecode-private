# Defender AI 安全 (Defender for AI) — 排查工作流

**来源草稿**: ado-wiki-b-tsg-ai-model-security-common-queries.md, ado-wiki-b-tsg-azure-foundry-agents-posture.md, ado-wiki-b-tsg-scc-ai-inventory-ui.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: AI Model Security — Common Kusto Queries for Model Scan
> 来源: ado-wiki-b-tsg-ai-model-security-common-queries.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let modelId = "azureml://registries/{registry}/models/{modelName}/versions/{version}";
let timeSpan = ago(2h);
let startProcessing =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name == "modelscan-modelscanongoingworker-service"
| where azure_region in ('westeurope')
| where body contains "Processing message: "
| extend modelScanHostType = todynamic(customData).SourceType
| where modelScanHostType in ('AzureMLRegistry')
| extend ModelIdOldLog = extract(@"ModelId = (azureml://[^\s,]+)", 1, body)
| extend ModelIdNewLog = extract('"ModelId":"([^"]+)"', 1, body)
| extend ModelId = iff(ModelIdOldLog != "", ModelIdOldLog, ModelIdNewLog)
| where ModelId == modelId
| project TIMESTAMP, ModelId, startedCorrelationId = CorrelationId;
let finishedProcessing =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name == "modelscan-modelscanongoingworker-service"
| where body contains "Completed scan for model"
| extend total_model_files = tolong(extract("Total model files:(\\d+)", 1, body))
| extend failed_files = tolong(extract("Failed files in current scan:(\\d+)", 1, body))
| extend completed_files = tolong(extract("Completed files in current scan:(\\d+)", 1, body))
| extend cached_files = tolong(extract("Completed files from cache: (\\d+)", 1, body))
| project finishedCorrelationId = CorrelationId, total_model_files, failed_files, completed_files, cached_files;
startProcessing
| join kind=leftouter finishedProcessing on $left.startedCorrelationId == $right.finishedCorrelationId
| summarize arg_max(TIMESTAMP, *) by ModelId, bin(TIMESTAMP, 1d)
| project-rename real_timestamp = TIMESTAMP1
| extend ScanSuccess = iff(isnotempty(finishedCorrelationId) and failed_files == 0, 1, 0)
| extend ScanPartialSuccess = iff(isnotempty(finishedCorrelationId) and total_model_files > completed_files + cached_files, 1, 0)
```

**查询 2:**
```kusto
let ModelId = "azureml://registries/{registry}/models/{modelName}/versions/{version}";
let timeSpan = ago(2h);
let deploymentName = "modelscan";
let all_findings =
cluster("https://mdcprd.centralus.kusto.windows.net/").database('Dfai').Log
| where TIMESTAMP > timeSpan
| where k8s_deployment_name contains deploymentName
| where body contains "Found" and body contains "scan result" and body contains "for file"
| extend modelId = trim_end(@"[^\w/:-]+",
    tolower(extract(@"(azureml://registries/[^/]+/models/[^/]+/versions/[^:\s]+)", 0, body)))
| where modelId == ModelId;
all_findings
| take 100
```

---

## Scenario 2: Azure AI Foundry Agents — Posture
> 来源: ado-wiki-b-tsg-azure-foundry-agents-posture.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Coordinator AI Agent** — Agents acting as main entry point, coordinating ≥3 agents
2. **Grounded With Sensitive Data** — Agents connected to sensitive data sources via tools
3. **Used By AI Agents** — Agents, Search Services, and Logic Apps used as tools by AI agents
4. Verify that remediation steps were taken correctly.
5. Wait **24 hours** and check again.
6. If still active, create CRI:
7. Wait **48 hours** and check again.
8. If still active, create CRI:

---

## Scenario 3: SCC AI Inventory (UI)
> 来源: ado-wiki-b-tsg-scc-ai-inventory-ui.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to the agent's resource page → take screenshot.
2. Click **Go hunt** button → advanced hunting opens with:
3. Note the map node ID. Check if query yielded results. Screenshot the Properties field.
4. Have customer run:
5. Provide to IcM: TenantID, Id, Name, Platform + screenshots of all steps.
6. Go to agent's resource page → take screenshot.
7. Click **Go hunt** button:
8. Note the agent ID from the query.
9. Run detailed query:
10. Compare `AIAgentsInfo`, `ExposureGraphNodes`, `ExposureGraphEdges` with UI data:
11. Verify onboarding: In MDC portal → **Secure AI Agents** → confirm **Copilot Studio AI Agents** is enabled and **AI Agents inventory** is connected.
12. Follow Missing Agent TSG to trace data flow.
13. Verify CSPM is enabled on agent's subscription: MDC → **Environment settings**.
14. Follow Missing Agent TSG.

### Portal 导航路径
- the agent's resource page → take screenshot
- agent's resource page → take screenshot

### Kusto 诊断查询
**查询 1:**
```kusto
search in (ExposureGraphNodes)
   NodeId == "<nodeID>"
```

**查询 2:**
```kusto
let nodeId = "<nodeID>";
   ExposureGraphEdges
   | where TargetNodeId == nodeId or SourceNodeId == nodeId
   | project SourceNodeId, SourceNodeLabel, EdgeLabel, TargetNodeId, TargetNodeLabel
```

**查询 3:**
```kusto
AIAgentsInfo
   | where AIAgentId == "<agentID>"
   | summarize arg_max(Timestamp, *) by AIAgentId
```

**查询 4:**
```kusto
AIAgentsInfo
   | where AIAgentId == "<agentId>"
   | summarize arg_max(Timestamp, *) by AIAgentId
   | project
       agentId = AIAgentId,
       agentName = AIAgentName,
       agentCreationTime = AgentCreationTime,
       agentCreatedBy = CreatorAccountUpn,
       platform = "copilotStudio",
       status = AgentStatus,
       environmentId = EnvironmentId,
       authenticationType = UserAuthenticationType,
       accessControlPolicy = case(
           tolower(AccessControlPolicy) == "copilot readers", "CopilotReaders",
           tolower(AccessControlPolicy) == "group membership", "GroupMembership",
           tolower(AccessControlPolicy) == "any multi tenant", "AnyMultiTenant",
           tolower(AccessControlPolicy) == "not applicable", "NotApplicable",
           AccessControlPolicy
       ),
       authorizedSecurityGroupIds = AuthorizedSecurityGroupIds,
       owner = OwnerAccountUpns
```

**查询 5:**
```kusto
-- Check AIAgentsInfo
AIAgentsInfo
| where AIAgentId == "<agentId>"
```

---
