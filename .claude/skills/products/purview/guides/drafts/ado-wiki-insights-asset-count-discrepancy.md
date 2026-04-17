---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Insights/Incorrect number of assets in the Insights view"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FInsights%2FIncorrect%20number%20of%20assets%20in%20the%20Insights%20view"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Incorrect Number of Assets in the Insights View

**Problem Statement**: Customer is scanning a source and is not seeing the expected number of assets in the Insights View.

## Scoping Questions

### 1. Time Since Scan Completion
What is the time since the scan completed and the count in insights assets view was seen? If more than 2 hours then this is an issue.

### 2. Expected vs Actual Asset Count
How many assets do we expect to see based on how many assets are actually in the source?

Key considerations:
- If assets were classified together, they would be represented as a **resource set**
- Each resource set is considered 1 asset
- In the case that all assets could be grouped together as 1 resource set, then the insights would only display 1 asset
- This can be verified in Kusto logs

### 3. Scan Scope Verification
Does the expected values match what the Purview Scan reported?
- Check scan run history for Assets Discovered vs Assets Classified
- Some assets are scanned but not classified due to unsupported file types
- Default supported data source & file types: https://docs.microsoft.com/en-us/azure/purview/sources-and-scans

### 4. Asset Count per Source Type
The view from Insights Asset Count Per Source Type with ALL categories and classifications filters may not reflect the same count as in the Insight Assets View.
- Check: Are some assets displaying under multiple resources? (e.g., Azure Blob and Azure File, or Azure SQL Database and Azure Synapse)
- If so, this is a current design issue and PG is working to improve

### 5. Missing Expected Assets
Are there some assets customer expects to see that are not there?
- Search Kusto Scanning Log for: file types not supported, filters, permissions not accessible
- If customer did a full scan with full permissions and assets are still missing → gather information to open an ICM

Reference: https://docs.microsoft.com/en-us/azure/purview/asset-insights

## Further Investigation

Debug link: https://aka.ms/debugpurviewinsights

### Jarvis (Production)
- Endpoint: "Diagnostics PROD"
- Namespace: "BabylonLinuxEUS"
- Events: ReportingLog, ReportingError

### Kusto Logs
- Cluster: https://babylon.eastus2.kusto.windows.net
- Database: babylonMdsLogs
- Tables: ReportingLog & ReportingError

Sample query:
```kql
ReportingLog
| where PreciseTimeStamp > now(-1d)
| where CorrelationId == "xxxxxxxxxxxxxxxxxxxxxxxx"
```
