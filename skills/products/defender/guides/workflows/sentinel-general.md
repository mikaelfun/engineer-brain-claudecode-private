# Defender Sentinel 通用排查 — 排查工作流

**来源草稿**: ado-wiki-a-recovering-microsoft-sentinel.md, ado-wiki-a-sentinel-repositories-tsg.md, ado-wiki-a-what-is-sentinel-architecture.md, ado-wiki-b-mdc-xdr-connectors-sentinel.md, ado-wiki-b-sentinel-notebooks-private-endpoints.md, ado-wiki-b-sentinel-overview-blade-tsg.md, ado-wiki-b-sentinel-pricing-tsg.md, ado-wiki-b-sentinel-refund-unit-calculation.md, ado-wiki-b-sentinel-scoping.md, ado-wiki-c-powershell-commands-sentinel-analytics.md, mslearn-sentinel-automation-health-monitoring.md, onenote-cef-sentinel-monitoring.md
**场景数**: 12
**生成日期**: 2026-04-07

---

## Scenario 1: [Product Knowledge] - Recovering Microsoft Sentinel
> 来源: ado-wiki-a-recovering-microsoft-sentinel.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Confirm if the Log Analytics Workspace is still present. If it's been deleted, follow the public doc to recover the workspace: Recover a workspace in a soft-delete state. Seek the assistance of the Monitoring Team via a collab.
2. Confirm what date the customer removed Microsoft Sentinel or deleted the SecurityInsights solution. After you remove the service, there is a grace period of **30 days** to re-enable the solution. Data and analytics rules will be restored, but the configured connectors that were disconnected must be reconnected. Reference doc: Implications of removing Microsoft Sentinel from your workspace
3. Re-enable the solution by re-adding Microsoft Sentinel to the Log Analytics Workspace by performing the standard onboarding process on our public doc: Enable Microsoft Sentinel
4. Send a **DELETE** request using the following API: Sentinel Onboarding States - Delete.
5. Check that the SecurityInsights solution has been removed from the Log Analytics Workspace via the **Legacy Solutions** blade in the Log Analytics Workspace portal. If it has not been removed, delete it manually by clicking on the solution, then selecting Overview, and then clicking Delete.
6. Send a **PUT** request using the following API making sure to include a request body: Sentinel Onboarding States - Create
7. If you get an error "CapacityReservation sku can be changed only after 31 days" during the PUT request, create an ICM (Example: ICM-651159139).
8. Confirm that the customer can access data connectors and other blades in Microsoft Sentinel after a successful PUT operation.

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Known Limitations (Sentinel Repositories Tsg)
> 来源: ado-wiki-a-sentinel-repositories-tsg.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: What is Sentinel
> 来源: ado-wiki-a-what-is-sentinel-architecture.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Scuba-rule connectors - this type of connectors use Scuba to pull data into the LA workspace
2. UI Only Connectors
3. Costume hard-coded connectors (V1):
4. Schema based connectors (V2):
5. Four data sources: Agents, OBO/Shoebox, Data Collector API, Scuba/Security, Data Puller
6. ODS/GIG - ingestion gateway, routes between InMem and GT pipelines
7. InMem/GT - transformation (logical model <-> physical model)
8. Event Hubs
9. PSS - reads from EH, writes to Kusto clusters
10. KCM - determines tenant/workspace/schema placement in Kusto cluster
11. Portal - user interface for querying data
12. Draft - service enabling KQL queries on data, calls CMS for schema/transformation

### Portal 导航路径
- workspace, Graph Store, automation engine

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: 1. Overview
> 来源: ado-wiki-b-mdc-xdr-connectors-sentinel.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Sentinel Notebooks with Private Endpoints - Troubleshooting Guide
> 来源: ado-wiki-b-sentinel-notebooks-private-endpoints.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Create a VM jumpbox within the same VNET as the AML private endpoint
2. Use Bastion to access the VM
3. Open browser on jumpbox, go to Azure portal, log into Sentinel workspace
4. Create AML workspace from Sentinel notebook blade - in Networking tab, select Private Endpoint with the same VNET as VM jumpbox
5. In AML studio > Compute tab, create new compute with the same VNET
6. If only 1 private link: start uploading notebooks manually or run `git clone` on the terminal
7. If multiple private links with different VNETs:
8. Azure portal > Machine Learning > Select ML workspace > Launch studio > Notebooks > Terminal
9. Run: `git clone https://github.com/Azure/Azure-Sentinel-Notebooks.git`
10. Refresh files page to see all cloned notebooks
11. Download required files from https://github.com/Azure/Azure-Sentinel-Notebooks.git (save as .ipynb)
12. Azure portal > Machine Learning > Select ML workspace > Launch studio > Notebooks > Add files (+)
13. Upload the .ipynb files

### Portal 导航路径
- browser on jumpbox, go to Azure portal, log into Sentinel workspace
- AML workspace Resource Group > Private DNS zone

---

## Scenario 6: TSG - Sentinel Overview Blade
> 来源: ado-wiki-b-sentinel-overview-blade-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
ServiceFabricOperations
| where env_time > ago(5d)
| where operationName == "Sentinel.Overview.OverviewArmApi.Controllers.OverviewController.ExecuteOverviewRequestInputParametersForSection"
| project env_time,serviceName, operationName, resultSignature, resultType, customData, durationMs, clusterName
| extend correlationId = customData["x-ms-correlation-request-id"]
| extend WS = tostring(customData.WorkspaceName)
| extend WSID = tostring(customData.WorkspaceId)
| extend section = tostring(customData.SectionKind)
| where WSID == ""
| where WS =~ ""
```

**查询 2:**
```kusto
let startTime = ago(3d);
ServiceFabricOperations
| where env_time > startTime
| where operationName == "Sentinel.Overview.OverviewArmApi.Controllers.ConnectorsController.GetOverviewConnectorsData"
| project env_time,serviceName, operationName, resultSignature, resultType, customData, durationMs, deploymentId
| extend WSID = tostring(customData.workspaceId)
| where WSID == ""
```

**查询 3:**
```kusto
ServiceFabricOperations
| where env_time > ago(5d)
| where operationName == "Sentinel.LogAnalyticsClient.LogAnalyticsClient.RunQueryAsync"
| extend correlationId = customData["x-ms-forward-internal-correlation-id"]
| extend WSID = tostring(customData.WorkspaceId)
| where WSID == ""
| where correlationId == ""
```

---

## Scenario 7: - Microsoft Sentinel Pricing
> 来源: ado-wiki-b-sentinel-pricing-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Access the Geneva Action Portal using SAW with gme/ame account
2. Under Filter, search for `opt`. 3 options available:
3. Insert workspace details:
4. Submit and wait for access approval
5. Run both `Opt out of 31 day capacity reservation` and `Opt out of 31 day capacity reservation for Sentinel`
6. Both results must succeed

### Portal 导航路径
- **Change history** for who/when/old+new values

### Kusto 诊断查询
**查询 1:**
```kusto
Operation
| where OperationKey == "Benefit type used: SentinelMicrosoft365" or OperationKey == "Benefit type used: MicrosoftDefender"
| parse OperationKey with "Benefit type used: " benefitType
| where TimeGenerated >= ago(31d)
| parse Detail with "Benefit amount used: " benefitAmount " GB"
| extend benefitAmount = todouble(benefitAmount)
| summarize benefitAmount = max(benefitAmount) by bin(TimeGenerated, 1d), benefitType
```

---

## Scenario 8: Sentinel Refund Unit Calculation and Procedure
> 来源: ado-wiki-b-sentinel-refund-unit-calculation.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Customers found an issue/problem/bug
2. Customers create a technical case/reach the technical support
3. The issue is fixed -> We have an RCA for the issue/problem. Keep in mind the team owning the bug needs to do this - only route to Sentinel billing if this is pure billing issue.
4. With the RCA, the Azure subscription management team (ASMS) checks if a credit can be provided based on the credit policy.
5. If the credit can be provided, the subscription management calculates the amount and request the approvals. Credit can be approved or rejected.
6. The subscription management team provides the credit status to the customer.

### Kusto 诊断查询
**查询 1:**
```kusto
let timeSeriesStart = datetime(12/7/2022);
let timeSeriesEnd = datetime(03/03/2023);
cluster('oibeftprdflwr').database('AMSTelemetry').WorkspaceSnapshot
| where SnapshotTimestamp between (timeSeriesStart..timeSeriesEnd)
| where Solutions has "SecurityInsights"
| where WorkspaceId contains "<workspace-id>"
| distinct TenantId, WorkspaceId
| join kind=inner cluster('oibeftprdflwr').database('KcmTelemetry').BillingStatistics on $left.WorkspaceId == $right.CustomerId
| where StartTime between (timeSeriesStart..timeSeriesEnd)
| project Table, BillableSize, RecordCount, CustomerId, TenantId
| summarize CustomerCount = dcount(TenantId), GBytes=sum(BillableSize)/1024/1024/1024 by Table
```

**查询 2:**
```kusto
let timeSeriesStart = datetime(12/7/2022);
let timeSeriesEnd = datetime(03/03/2023);
let meterInfo = materialize(cluster('Appinsightstlm').database("AzureMonitorUsage").MeterInfo);
cluster('appinsightstlm').database("AzureMonitorUsage").UsageByResourceEx
| where resourceUri contains "<resource-uri>"
| where usageTime between (timeSeriesStart..timeSeriesEnd)
| extend YearMonth=strcat(datetime_part("Year", usageTime),"-",iff(datetime_part("Month",usageTime)<10,"0",""), datetime_part("Month",usageTime))
| where meterId in ((meterInfo | where meterName contains "Benefit" | project meterId))
| join kind=leftouter (meterInfo) on meterId
| project units, meterName, meterId, YearMonth
| summarize GBytes = sum(units) by meterName, YearMonth
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: Troubleshooting Guide for Microsoft Sentinel Scoping
> 来源: ado-wiki-b-sentinel-scoping.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 10: Updating Tactics & Techniques in Microsoft Sentinel Alert Rules (via Azure CLI)
> 来源: ado-wiki-c-powershell-commands-sentinel-analytics.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 11: Sentinel Automation Health Monitoring Guide
> 来源: mslearn-sentinel-automation-health-monitoring.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. 启用 Sentinel Health Monitoring: Settings > Health monitoring
2. 对需监控的 Playbook 启用 Logic Apps 诊断日志 -> 发送到 Log Analytics workspace

### Kusto 诊断查询
**查询 1:**
```kusto
SentinelHealth
| where SentinelResourceType == "Automation rule"
| mv-expand TriggeredPlaybooks = ExtendedProperties.TriggeredPlaybooks
| extend runId = tostring(TriggeredPlaybooks.RunId)
| join (AzureDiagnostics
    | where OperationName == "Microsoft.Logic/workflows/workflowRunCompleted"
    | project
        resource_runId_s,
        playbookName = resource_workflowName_s,
        playbookRunStatus = status_s)
    on $left.runId == $right.resource_runId_s
| project
    TimeGenerated,
    AutomationRuleName = SentinelResourceName,
    AutomationRuleStatus = Status,
    Description,
    playbookName,
    playbookRunStatus
```

---

## Scenario 12: CEF-Based Security Monitoring in Sentinel
> 来源: onenote-cef-sentinel-monitoring.md | 适用: Mooncake ✅

### 排查步骤
1. Configure DCR rules via AMA connector - set Facility and log level matching the CEF data source syslog profile. Add log forwarder VM/Arc VM to DCR resources.
2. Deploy AMA agent to the log forwarder VM.
3. Run Forwarder_AMA_installer.py on the log forwarder VM to open port 514 TCP/UDP:
4. Configure syslog profile on the network/security device, pointing to the log forwarder VM IP on port 514.
5. **AMA + OMS coexistence**: CEF logs are NOT collected when both agents exist. Remove OMS agent first.
6. **Check port**: `netstat -an | grep 514`
7. **Run diagnostic script**:
8. **Check firewall**: `firewall-cmd --state`, then `firewall-cmd --list-all-zones`. Add port if needed: `firewall-cmd --add-port=514/udp`
9. **Verify syslog reception**: `sudo tcpdump -ni any port 514 -vv`
10. **Send test CEF log**:
11. **ProcessName not parsed correctly**: Create rsyslog conf to reformat syslog with CEF as ProcessName (see known-issue defender-onenote-015).

### Portal 导航路径
- port 514 TCP/UDP:

### 脚本命令
```powershell
sudo wget -O Forwarder_AMA_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/Syslog/Forwarder_AMA_installer.py && sudo python Forwarder_AMA_installer.py
```

```powershell
sudo wget -O cef_AMA_troubleshoot.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_AMA_troubleshoot.py && sudo python cef_AMA_troubleshoot.py
```

```powershell
logger -p local4.warn -P 514 -n <log_forwarder_IP> -t CEF: "0|Mock-Test|MOCK|common=event-format-test|end|TRAFFIC|1|..."
```

---
