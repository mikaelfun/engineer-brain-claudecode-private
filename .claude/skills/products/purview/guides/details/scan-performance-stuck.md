# Purview 扫描性能与异常终止 -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-scan-performance-diagnosis.md](..\guides/drafts/ado-wiki-scan-performance-diagnosis.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-scan-performance-diagnosis.md

1. Scan Performance Degradation Diagnosis `[source: ado-wiki-scan-performance-diagnosis.md]`
2. Get Details `[source: ado-wiki-scan-performance-diagnosis.md]`
3. 1) Scan Run ID of a scan with good performance `[source: ado-wiki-scan-performance-diagnosis.md]`
4. 2) Get SHIR Report ID `[source: ado-wiki-scan-performance-diagnosis.md]`
5. 3) Check SHIR Version `[source: ado-wiki-scan-performance-diagnosis.md]`
6. 4) Scan run ID of a scan with poor performance `[source: ado-wiki-scan-performance-diagnosis.md]`
7. 5) Get SHIR Report ID `[source: ado-wiki-scan-performance-diagnosis.md]`
8. 6) Check SHIR Version `[source: ado-wiki-scan-performance-diagnosis.md]`
9. 7) If SHIR is not the latest available download, then have customer update and try again `[source: ado-wiki-scan-performance-diagnosis.md]`
10. 8) Check the amount of data scanned before the performance issue and during the issue `[source: ado-wiki-scan-performance-diagnosis.md]`

### Phase 2: Data Collection (KQL)

```kusto
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
`[tool: ado-wiki-scan-performance-diagnosis.md]`

```kusto
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
`[tool: ado-wiki-scan-performance-diagnosis.md]`

```kusto
// Babylon gateway errors
cluster('babylon.eastus2').database('babylonMdsLogs').GatewayEvent
| where AccountId == '<account-id>'
| where Message contains 'error'
| where ['time'] >= now(-6d)
| where Status >= 400
| summarize count() by bin(TIMESTAMP, 1d), Status
```
`[tool: ado-wiki-scan-performance-diagnosis.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Cannot export or download glossary terms as CSV files from Purview portal; expor... | Multiple possible causes: (1) Browser blocks automatic downl... | (1) Check browser site settings: set Automatic downloads to Ask or Allow. (2) Tr... |
| Purview scan for Azure Files or ADLS Gen2 fails with Scan_TerminatedStuckScan er... | Parser gets stuck on certain files (large or corrupt). Task ... | Use Kusto: 1) Check CustomerFacingEvent for Scan_TerminatedStuckScan. 2) Query G... |
| Scan executor task stuck in queued state for days, scan never starts or complete... | Insufficient capacity in the Azure Batch Pool backing the sc... | Use Azure Batch Diagnostics tool (https://azurebatchdiagnostics.azurewebsites.ne... |
| Asset import failure: 0 resources processed, 0 resources successfully imported, ... | Ingest request to Data Map failed due to operation timeout, ... | Check OfflineTierWarmPathAgentLogs with traceId for failure count; then OnlineTi... |
| On-prem SQL or Azure Synapse dedicated pool scan completes with exceptions — tes... | Synapse server does not have enough capacity to run the quer... | Collect scan result logs and Kusto logs (DataScanAgentLinuxEvent for Azure IR or... |
| Purview service experiences slow response time and timeouts: browsing/clicking a... | Network configuration issues causing Purview to timeout. | 1) Review network configuration with networking teams. 2) Check Azure portal set... |
| Scan jobs initiated in late November run for unusually long time and transition ... | Backend infrastructure upper execution limit for ingestion o... | Backend execution limit removed across all regions on Dec 10. Scans after Dec 10... |
| Information Protection Scanner process stuck / times out while scanning large re... | Exhausted dynamic port range or SharePoint list view thresho... | Increase dynamic ports for the OS. For SharePoint, increase list view threshold ... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot export or download glossary terms as CSV files from Purview portal; export button appears stu... | Multiple possible causes: (1) Browser blocks automatic downloads from Purview we... | (1) Check browser site settings: set Automatic downloads to Ask or Allow. (2) Try exporting smaller ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Glossary/Cannot%20import%20or%20export%20glossary%20term%20using%20template/Export%20terms%20using%20template) |
| 2 | Purview scan for Azure Files or ADLS Gen2 fails with Scan_TerminatedStuckScan error; scan runs for e... | Parser gets stuck on certain files (large or corrupt). Task slot remains in Wait... | Use Kusto: 1) Check CustomerFacingEvent for Scan_TerminatedStuckScan. 2) Query GetScanAgentLinuxEven... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FKnown%20Issues%2FAzure%20Files%2C%20ADLS%20Gen2%20Issues) |
| 3 | Scan executor task stuck in queued state for days, scan never starts or completes | Insufficient capacity in the Azure Batch Pool backing the scan executor; not eno... | Use Azure Batch Diagnostics tool (https://azurebatchdiagnostics.azurewebsites.net/) to check task st... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Troubleshoot%20why%20executor%20is%20queued%20for%20days) |
| 4 | Asset import failure: 0 resources processed, 0 resources successfully imported, N resources failed w... | Ingest request to Data Map failed due to operation timeout, transient network fa... | Check OfflineTierWarmPathAgentLogs with traceId for failure count; then OnlineTierWebRequests for /a... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 5 | On-prem SQL or Azure Synapse dedicated pool scan completes with exceptions — test connection succeed... | Synapse server does not have enough capacity to run the query, causing it to wai... | Collect scan result logs and Kusto logs (DataScanAgentLinuxEvent for Azure IR or TraceGatewayLocalEv... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FOn-Prem%20SQL%20or%20Synapse%20SQL%20scan%20completed%20with%20exceptions) |
| 6 | Purview service experiences slow response time and timeouts: browsing/clicking assets timeout, data ... | Network configuration issues causing Purview to timeout. | 1) Review network configuration with networking teams. 2) Check Azure portal settings. 3) Monitor Pu... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FAutoContent%2FTroubleshooting%20Slow%20Response%20Time%20and%20Timeouts%20in%20Microsoft%20Purview%20Service) |
| 7 | Scan jobs initiated in late November run for unusually long time and transition to Cancelled status ... | Backend infrastructure upper execution limit for ingestion operations prevented ... | Backend execution limit removed across all regions on Dec 10. Scans after Dec 10 process normally. S... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 8 | Information Protection Scanner process stuck / times out while scanning large repositories | Exhausted dynamic port range or SharePoint list view threshold exceeded, prevent... | Increase dynamic ports for the OS. For SharePoint, increase list view threshold above default 5000. ... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/information-protection-scanner/resolve-deployment-issues) |