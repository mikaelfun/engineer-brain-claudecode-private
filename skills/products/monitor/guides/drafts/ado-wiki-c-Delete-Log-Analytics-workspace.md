---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Create and manage Log Analytics workspaces/Delete Log Analytics workspace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FCreate%20and%20manage%20Log%20Analytics%20workspaces%2FDelete%20Log%20Analytics%20workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Scenario
---
The purpose of this workflow is to guide you to troubleshoot workspace deletion issues, either via the Azure portal, PowerShell, ARM template, Azure CLI or API calls.

Key notes:
- To find who deleted a workspace, check the subscription's activity log (retains 90 days by default)
- If deleted >90 days ago and no activity log export configured, the deleting user cannot be identified (PII policy)
- The Log Analytics PG does not store user information in its service database

##Minimum information needed
* Subscription ID 
* Time window of when the issue occurred
* Workspace name
* Error message
* Is the customer trying a soft or permanent delete?
