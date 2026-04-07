---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Review DCR Diagnostic Settings Logs (DCRErrorLogs, DCR Metrics)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Review%20DCR%20Diagnostic%20Settings%20Logs%20(DCRErrorLogs%2C%20DCR%20Metrics)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA: How To Review DCR Diagnostic Settings Logs (DCRErrorLogs, DCR Metrics)

## Overview

How to enable diagnostic settings on a **Data Collection Rule** and query the **DCRErrorLogs** table in a Log Analytics Workspace to diagnose errors with a Data Collection Rule.

Reference: [Monitor DCR data collection in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-monitor)

## Scope

The operations evaluated by these diagnostic settings are related to **INCOMING** data:
- Log delivery errors
- Invalid KQL
- Non-200/202 HTTP responses
- Malformed data
- Ingestion/throttling limits

The operations evaluated by these diagnostic settings do **NOT** include **WRITE** data:
- Incorrect data types
- Column limitations
- etc.

For WRITE data issues, see the [LAW Operations Table Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2062714/AMA-HT-Review-LAW-Operations-Table-Logs) article.
