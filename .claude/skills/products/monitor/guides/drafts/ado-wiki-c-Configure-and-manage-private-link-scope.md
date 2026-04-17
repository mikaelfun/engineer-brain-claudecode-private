---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Create and manage Log Analytics workspaces/Configure and manage private link scope"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FCreate%20and%20manage%20Log%20Analytics%20workspaces%2FConfigure%20and%20manage%20private%20link%20scope"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Scenario
---
The purpose of this workflow is to guide you to troubleshoot Azure Monitor Private Link Scope (AMPLS) issues, either related with ingestion or query access mode.

# Understanding the issue
---
##Minimum information needed
* Subscription ID 
* Time window of when the issue occurred
* Issue type:
     * Cannot complete the Azure Monitor Private Link Scope configuration
     * Data is not flowing into the workspace from the agents inside the VNET
     * Cannot query the data from the configured virtual network
     * Other
* Error message (if applicable)
* Workspace name
* AMPLS name or resourceID
* Virtual machine name or resourceID (in case of ingestion issues)
* VNET name or resourceID
