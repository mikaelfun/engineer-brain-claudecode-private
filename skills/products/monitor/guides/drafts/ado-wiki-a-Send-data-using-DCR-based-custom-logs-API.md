---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Collecting custom logs from VMs and servers/Send data using DCR based custom logs API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FCollecting%20custom%20logs%20from%20VMs%20and%20servers%2FSend%20data%20using%20DCR%20based%20custom%20logs%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
The purpose of this workflow is to guide you to troubleshoot issues related with data being ingested via the new Rest API that uses Data Collection Rules (DCR) and Data Collection Endpoints (DCE).

> **Note**: This workflow should not be used to troubleshoot issues on the legacy HTTP Data Collector API.

## Minimum information needed
* Subscription ID
* Time window of when the issue occurred
* Issue type: Data not ingested (with/without errors), Data appears with delay, Other
* Error message (if applicable)
* Workspace name or URI
* Name(s) of the table(s) / custom logs
* Name or URI of the Data Collection Rule (DCR)
* Name or URI of the Data Collection Endpoint (DCE)

## Troubleshooting
Please leverage the following TSG: [Custom Logs V2: Send Custom Logs(v2) using API overview and TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1441495/Custom-Logs-V2-Send-Custom-Logs(v2)-using-API)

## Useful links
- [Tutorial: Send data to Azure Monitor Logs using REST API](https://learn.microsoft.com/azure/azure-monitor/logs/tutorial-logs-ingestion-portal)