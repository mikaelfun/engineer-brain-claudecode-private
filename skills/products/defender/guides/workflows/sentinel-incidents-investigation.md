# Defender Sentinel 事件调查与 Hunting — 排查工作流

**来源草稿**: ado-wiki-a-alerts-incidents-telemetry.md, ado-wiki-a-how-to-export-incident.md, ado-wiki-a-m365-defender-incident-integration-tsg.md, ado-wiki-a-r3-microsoft-graph-for-security-support.md, ado-wiki-b-hunting-custom-graph-tsg.md, ado-wiki-b-mdc-advanced-hunting-tables-tsg.md, ado-wiki-b-r1-network-alerts-investigation.md, ado-wiki-b-support-boundaries-advanced-hunting.md, ado-wiki-b-xdr-m365d-advanced-hunting-tsg.md, ado-wiki-d-dns-alerts-investigation.md
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Find when an incident was created
> 来源: ado-wiki-a-alerts-incidents-telemetry.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 2: PowerBI - Getting Data
> 来源: ado-wiki-a-how-to-export-incident.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Start PowerBI desktop from your computer. When introduction Window opens, click on the Get Data link
2. Click on Other and then select Blank Query from the bottom of the list and click Connect
3. Open the Advanced Editor window, and enter below code

### Portal 导航路径
- the Advanced Editor window, and enter below code
- a new window called To Table

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: TSG Microsoft 365 Defender-Sentinel Bi-directional incident integration
> 来源: ado-wiki-a-m365-defender-incident-integration-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('wcdprod').database('TenantsStoreReplica').TenantsV2
| where AadTenantId =="{TenantId}"
| summarize arg_max(Timestamp, *) by AadTenantId
| project DcId,OrgId,ScrubbedKustoClusterName
| extend wcdCluster=strcat("https://",todynamic(ScrubbedKustoClusterName).Scrubbed.roleToCluster.Read,".kusto.windows.net")
```

**查询 2:**
```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlerts
| where AlertId == alertId
```

**查询 3:**
```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertStatus
| where AlertId == alertId
| order by Timestamp desc
```

**查询 4:**
```kusto
let alertId="{ALERT_ID}";
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertEvidence
| where OrgId == "{ORG_ID}"
| where AlertId contains alertId
| sort by FirstSeen desc
```

**查询 5:**
```kusto
let incidentId="{INCIDENT_NUMBER}";
let alertId="{ALERT_ID}";
let TenantIdValue=hash_sha1("{TENANT_ID}");
let cluster="{wcdCluster}";
cluster(cluster).database('scrubbeddata').MtpAlertIncidents
| where IncidentId == incidentId
| where AlertId == alertId
| where TenantId has TenantIdValue
```

---

## Scenario 4: What is Microsoft Graph?
> 来源: ado-wiki-a-r3-microsoft-graph-for-security-support.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. making REST API calls to any of the APIs listed under�Microsoft Graph REST API beta endpoint reference - Microsoft Graph beta | Microsoft Learn
2. running PowerShell cmdlets included in the�Microsoft Graph PowerShell documentation | Microsoft Learn�PowerShell module
3. using the�Microsoft Graph�SDK�overview - Microsoft Graph | Microsoft Learn�or the�GitHub - microsoftgraph/msgraph-sdk-dotnet: Microsoft Graph Client Library for .NET!

---

## Scenario 5: Hunting Graph & Custom Graph TSG
> 来源: ado-wiki-b-hunting-custom-graph-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Check for error in notification center (e.g., "An error occurred while fetching graph data" -> open support ticket)
2. Graph being built notification -> wait up to 24h after initial onboarding
3. No Defender products deployed -> deploy and provision
4. Insufficient scope permissions -> check with Security Administrator
5. Proper roles and permissions
6. Logged into Microsoft Sentinel extension
7. Latest VS Code extension installed
8. Graph spark pool selected (NOT notebook spark pools)
9. Microsoft Sentinel channel selected in Output pane for error logs

### Portal 导航路径
- support ticket)

### Kusto 诊断查询
**查询 1:**
```kusto
// cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs')
GatewayEvent | where CorrelationId == $CorrelationId
```

**查询 2:**
```kusto
GatewayEvent
| where CallerTenantId == $CustomerTenantId
| where Path contains "/interactive"
| order by ['time'] desc
```

---

## Scenario 6: TSG - MDC Advanced Hunting Tables
> 来源: ado-wiki-b-mdc-advanced-hunting-tables-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
CloudAuditEvents
| union cluster('teamx-prod-weu.westeurope').database('InvestigationData').CloudAuditEvents
| where ingestion_time() > ago(1h)
| where TenantId == "<customer-tenant-id>"
| summarize count() by DataSource
```

**查询 2:**
```kusto
GetCurrentEnvironments()
| where TenantId == "<customer-tenant-id>"
| project HierarchyId, TenantId, Plans
```

---

## Scenario 7: Network Alerts Investigation — TSG
> 来源: ado-wiki-b-r1-network-alerts-investigation.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where SystemAlertId == "{Alert ID provided}"
```

**查询 2:**
```kusto
cluster("Netcapplan").database("NetCapPlan").RealTimeIpfixWithMetadata
| where TimeStamp > todatetime("06-23-2020 00:01:00")  // StartTime of the alert
| where TimeStamp < todatetime("06-23-2020 22:59:00")  // End time of the Alert
| where SrcIpAddress == "<VictimIP/AttackerIP>" and DstIpAddress == "<VictimIP/AttackerIP>"
```

**查询 3:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where Metadata["StoreManager.Published"] == "True"
| where AzureResourceSubscriptionId == "<SubscriptionId>"
| where StartTimeUtc >= ago(2d)
| where AlertDisplayName contains "traffic"
| order by StartTimeUtc
| project AlertDisplayName, ProviderName
```

**查询 4:**
```kusto
cluster("Netcapplan").database("NetCapPlan").RealTimeIpfixWithMetadata
| where TimeStamp > todatetime("01-28-2020 00:01:00")
| where TimeStamp < todatetime("01-29-2020 23:59:00")
| where SrcIpAddress == "X.X.X.X" and DstIpAddress == "X.X.X.X"
```

---

## Scenario 8: Advanced Hunting - Support Boundaries & Table Ownership Reference
> 来源: ado-wiki-b-support-boundaries-advanced-hunting.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Data missing/incorrect in a table** -> Route to the table's owning team (SAP)
2. **Advanced Hunting feature questions** -> Defender for Endpoint drives
3. **Query writing assistance** -> CSA (Cloud Solution Architect)
4. **MDC tables (CloudAuditEvents, CloudProcessEvents)** -> Microsoft Defender for Cloud team

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: User Scenarios
> 来源: ado-wiki-b-xdr-m365d-advanced-hunting-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Tenant is not eligible or opted-in to Sentinel in M365D.
2. User is not exposed to the Sentinel workload in M365D.
3. Error in getting tenant status or user permissions.
4. Error in loading Sentinel content in Advanced Hunting.
5. **Check that the tenant is eligible and opted-in to Sentinel:** Run the following query to check if the tenant is eligible, configured and opted-in to MTP:
6. **Check that user is exposed to the Sentinel workload:** From the portal, refresh the page and open the browser dev tools. Search in the Network tab for the TenantContext API call and make sure that:
7. **Check that the issue is specific to Advanced Hunting:** Navigate to other pages in the portal and check that Sentinel content is available. For example, make sure that the left navigation bar contains the Sentinel section and that Sentinel alerts are shown in the M365D alerts queue.
8. **Check if the issue is consistent on all Sentinel content in Advanced Hunting:** If all of Sentinel content is missing from Advanced Hunting, including tables, queries and functions, this usually means that there is an issue checking the onboarding status of the tenant or permission status of the user.
9. The tenant or user is not eligible to the Sentinel workload in M365D.
10. Specific tables are filtered out from the Sentinel schema.
11. Error in loading Sentinel schema from Log Analytics.
12. **Check tenant and user eligibility to Sentinel workload:** Follow the steps mentioned above in the Permission Issues section, to make sure the tenant and user are eligible and exposed to the Sentinel workload.
13. Check if all Sentinel tables are missing or only specific ones:
14. **Check errors in loading the Sentinel schema:** Run the following query to check failures in getting the Log Analytics schema:
15. Query is also failing from Sentinel workspace.
16. Query contains tables, functions or operators that are not supported in M365D.
17. Query is timing out or using too many resources.
18. **Verify that the query is working in the Sentinel workspace:** Execute the query from the Sentinel workspace and make sure it runs successfully. If the query is showing the same error in the Sentinel workspace, then the error in M365D is expected.
19. **Check unsupported tables, functions or operators:**
20. **Check if issue is related to resource consumption:** From the query error shown in the portal, check it indicates timeout, reaching memory or CPU limitations, or exceeding query resources. Advanced Hunting is using a CPU quota to limit excessive query usage, and there are also built-in Kusto limitations on resource consumption.

### Portal 导航路径
- the browser dev tools
- other pages in the portal and check that Sentinel content is available
- the browser dev tools and check the Console and Network tabs for possible errors

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 10: Overview (Dns Alerts Investigation)
> 来源: ado-wiki-d-dns-alerts-investigation.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts
| where SystemAlertId == "{Alert ID provided}
```

---
