# Purview 扫描性能与异常终止 — 排查工作流

**来源草稿**: `ado-wiki-scan-performance-diagnosis.md`
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 8) Check the amount of data scanned before the performance issue and during the issue
> 来源: ado-wiki-scan-performance-diagnosis.md | 适用: 未标注

### 排查步骤
#### a. Use Monitoring Metrics
Show customer how to use Monitoring Metrics to see the change in usage.

**Action plan for Ingestion Service Quantity(CU) too high**

Either scanning or lineage will affect number of assets and time for ingestion. Customers may complain billing is too high but there are no many scanning jobs. This is usually because ADF, Synapse or Power BI is pushing lineage information to Purview, and customer is not aware of it.

To check: go to Purview Studio > https://learn.microsoft.com/en-us/azure/purview/how-to-monitor-data-map-population#monitor-links to verify asset number and lineage.

If lineage is the root cause, stop the lineage from Synapse/ADF into Purview by disconnecting the connection:
https://learn.microsoft.com/en-us/azure/synapse-analytics/catalog-and-governance/quickstart-connect-azure-purview

**Action plan for Catalog Quantity(CU) too high**

Go to Azure portal to check size of metadata stored in Purview DataMap.
- 1 Capacity Unit stores up to 10GB metadata
- Cost per CU per month is ~$300
- If metadata size is root cause, reduce metadata by deleting assets

#### b. Ask customer for the size of the dataset they are scanning

#### c. Compare the number of assets discovered and classified

Use Kusto to find the number of assets discovered and classified before/during the issue:

```kql
// Change cluster to match customer's Purview region (use Nanite/Kusto wiki)
// Change account id and dates
let reg = "newAssetsDiscovered\":(.*?),";
let reg1 = "newAssetsClassified\":(.*?),";
cluster('purviewadxscus.southcentralus').database('DataScanLogs').DataScanAgentEvent
| where AccountId == '<customer-account-id>'
| where env_time >= datetime('YYYY-MM-DD') and env_time <= datetime('YYYY-MM-DD')
| where Message matches regex reg
| where Message matches regex reg1
| project Message
| project NewAssetsDiscovered = toint((extract(reg, 1, Message))), NewAssetsClassified = toint((extract(reg1, 1, Message)))
| summarize sum(NewAssetsDiscovered), sum(NewAssetsClassified)
```

`[来源: ado-wiki-scan-performance-diagnosis.md]`

---

## Scenario 2: 9) Check for errors, throttling on resource
> 来源: ado-wiki-scan-performance-diagnosis.md | 适用: 未标注

### 排查步骤
```kql
// ARM throttling check
// Execute: https://armprod.kusto.windows.net/ARMProd
let subid = "<subscription-id>";
HttpIncomingRequests
| where TIMESTAMP >= now(-1d)
| where subscriptionId == subid
| where httpStatusCode >= 400
| summarize count() by bin(PreciseTimeStamp, 1d), targetUri
| order by count_ desc
```

```kql
// Babylon gateway errors
cluster('babylon.eastus2').database('babylonMdsLogs').GatewayEvent
| where AccountId == '<account-id>'
| where Message contains 'error'
| where ['time'] >= now(-6d)
| where Status >= 400
| summarize count() by bin(TIMESTAMP, 1d), Status
```

`[来源: ado-wiki-scan-performance-diagnosis.md]`

---
