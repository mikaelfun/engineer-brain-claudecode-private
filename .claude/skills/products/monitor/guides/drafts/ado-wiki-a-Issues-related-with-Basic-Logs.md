---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Configure and Manage Log Analytics tables/Issues related with Basic Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FConfigure%20and%20Manage%20Log%20Analytics%20tables%2FIssues%20related%20with%20Basic%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
The purpose of this workflow is to guide you to troubleshoot issues with Basic Logs.

> **Important**: Confirm that the Support Area Path (SAP) is correct first. See [Log Analytics SAP review](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750425/LogAnalytics-SAP-review).

## Minimum information needed
* Subscription ID
* Time window of when the issue occurred
* Issue type: Cannot set table plan to Basic, Cannot set table plan back to Analytics, Other
* Error message (if applicable)
* Workspace name or URI, region
* Name(s) of the table(s)

## Troubleshooting
Please leverage the following TSG: [Basic Logs, Archive, Search Jobs and Restore](/Log-Analytics/Troubleshooting-Guides/Table-management/Basic-and-Auxiliary-table-plans-)

> **Important**: You can switch a table plan only once a week. If customers set the plan to Basic by mistake, they must wait one week. The PG cannot change this on the backend. Do not raise IcMs requesting a table plan switch.

## Useful links
- [Configure Basic Logs in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/logs/basic-logs-configure)
- [Log sources to use for Basic Logs ingestion](https://learn.microsoft.com/azure/sentinel/basic-logs-use-cases)