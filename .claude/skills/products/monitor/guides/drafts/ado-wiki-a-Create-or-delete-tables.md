---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Configure and Manage Log Analytics tables/Create or delete tables"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FConfigure%20and%20Manage%20Log%20Analytics%20tables%2FCreate%20or%20delete%20tables"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
The purpose of this workflow is to guide you to troubleshoot issues related with the creation or deletion of tables (via custom logs, API or Tables UI).

## Minimum information needed
* Subscription ID
* Time window of when the issue occurred
* Issue type: Cannot create a table, Cannot delete a table, Other
* Error message (if applicable)
* Workspace name or URI, region
* Name(s) of the table(s) being created or deleted

## Troubleshooting
* For table creation: [Send-data-using-DCR-based-custom-logs-API](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750343/Send-data-using-DCR-based-custom-logs-API)
* For table deletion: [Custom logs deletion and restore](/Log-Analytics/Common-Concepts/Custom-logs-management)

## Useful links
- [Configure Basic Logs in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/logs/basic-logs-configure)