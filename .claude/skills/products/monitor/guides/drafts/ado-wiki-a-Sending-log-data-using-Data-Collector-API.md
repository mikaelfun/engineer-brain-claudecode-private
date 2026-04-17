---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Collecting custom logs from VMs and servers/Sending log data using Data Collector API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FCollecting%20custom%20logs%20from%20VMs%20and%20servers%2FSending%20log%20data%20using%20Data%20Collector%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
The purpose of this workflow is to guide you to troubleshoot issues related with data being ingested via the HTTP Data Collector API.

> **Note**: This workflow should not be used to troubleshoot issues in the new DCR based custom logs API.

## Minimum information needed
* Subscription ID
* Time window of when the issue occurred
* Issue type: Data not ingested (with/without errors), Data appears with delay, Other
* Error message (if applicable)
* Workspace name or URI
* Name(s) of the table(s) / custom logs

## Troubleshooting
Please leverage the following TSG: [How to: Investigate Data Collector API Custom Logs](/Log-Analytics/Troubleshooting-Guides/Data-sources/APIs/How-to:-Investigate-HTTP-Data-Collector-API-Custom-Logs)

## Useful links
- [Send log data to Azure Monitor by using the HTTP Data Collector API](https://learn.microsoft.com/azure/azure-monitor/logs/data-collector-api)