---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Review LAW Operation Table Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Review%20LAW%20Operation%20Table%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview:
The link below demonstrates how to use the Operation table on a Log Analytics Workspace (LAW) to diagnose errors related to AMA custom logs. 

[Monitor operational issues logged in your Azure Monitor Log Analytics workspace - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/monitor-workspace)

# Scope
The operations evaluated by this table includes **WRITE** data (i.e. incorrect data types, column limitations, etc.).

The operations evaluated by these diagnostic settings are related to **INCOMING** data (i.e. log delivery errors, invalid KQL, non-200/202 http responses, malformed data, ingestion/throttling limits). See [this](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2056258/AMA-HT-Review-DCR-Diagnostic-Settings-Logs-(DCRErrorLogs-DCR-Metrics)) article for more details.

# Known Issues
