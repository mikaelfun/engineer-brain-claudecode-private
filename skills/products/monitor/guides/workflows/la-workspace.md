# Monitor Log Analytics 工作区管理 — 排查工作流

**来源草稿**: [ado-wiki-a-LA-workspace-Data-Export-Troubleshooting.md], [ado-wiki-a-Locate-VM-Workspace-AMA.md], [ado-wiki-b-How-to-deploy-log-forwarder-to-ingest-syslog-to-log-analytics-workspace.md], [ado-wiki-c-AppLens-Workspace-Details-Detector.md], [ado-wiki-c-Check-LA-Workspace-Agent-Heartbeat-Connectivity.md], [ado-wiki-c-Create-Log-Analytics-workspace.md], [ado-wiki-c-Delete-Log-Analytics-workspace.md], [ado-wiki-c-find-workspace-info.md], ... (12 total)
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: How to locate which Workspace a customer's VM is reporting data to in the last 24 hours, and what th
> 来源: ado-wiki-a-Locate-VM-Workspace-AMA.md | 适用: Mooncake ✅

   ```kql
   HealthReport
   | where TIMESTAMP > ago(24h)
   | where tolower(ResourceId) == tolower("<COMPUTER RESOURCE ID HERE>")
   | where Ods == true
   | extend workspace = tostring(_Ods)
   | distinct ResourceId, Ods, AgentVer, workspace
   ```
   [来源: ado-wiki-a-Locate-VM-Workspace-AMA.md]

---

## Scenario 2: The following guide can be used to validate heartbeat connectivity for any given Log Analytics Agent
> 来源: ado-wiki-c-Check-LA-Workspace-Agent-Heartbeat-Connectivity.md | 适用: Mooncake ✅

   ```kql
   Heartbeat
   | where Computer contains "Hostname of the Computing Resource" and TimeGenerated > ago(30d)
   | summarize LastCall = argmax(TimeGenerated, *) by Computer, OSType, ResourceGroup
   ```
   [来源: ado-wiki-c-Check-LA-Workspace-Agent-Heartbeat-Connectivity.md]

   ```kql
   Heartbeat
   | where Computer contains "Hostname of the Computing Resource" and TimeGenerated > ago(1h)
   | summarize count() by Computer, OSType, ResourceGroup
   ```
   [来源: ado-wiki-c-Check-LA-Workspace-Agent-Heartbeat-Connectivity.md]

---

## Scenario 3: ---
> 来源: ado-wiki-c-Create-Log-Analytics-workspace.md | 适用: Mooncake ✅

---

## Scenario 4: ---
> 来源: ado-wiki-c-Delete-Log-Analytics-workspace.md | 适用: Mooncake ✅

---

## Scenario 5: ---
> 来源: ado-wiki-c-find-workspace-info.md | 适用: Mooncake ✅

---

## Scenario 6: Investigate changes on Workspace resource properties and Solutions using Log Analytics Control Plane
> 来源: ado-wiki-c-Investigate-Workspace-properties-Solutions-changes.md | 适用: Mooncake ✅

   ```kql
   let CustomerWorkspaceId = "00000000-0000-0000-0000-000000000000";
   cluster("oibeftprdflwr").database("AMSTelemetry").WorkspaceSnapshot
   | where WorkspaceId == CustomerWorkspaceId
   | extend splitlist = split(Solutions, ",")
   | order by SnapshotTimestamp asc
   | extend addedSolutions=set_difference((splitli
   ```
   [来源: ado-wiki-c-Investigate-Workspace-properties-Solutions-changes.md]

   ```kql
   let CustomersWorkspaceName = "WSNAME";
   cluster("oibeftprdflwr").database("AMSTelemetry").ResourceUpdates
   | where resourceType == "solutions"
   | where url has CustomersWorkspaceName
   ```
   [来源: ado-wiki-c-Investigate-Workspace-properties-Solutions-changes.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/la-workspace.md |
