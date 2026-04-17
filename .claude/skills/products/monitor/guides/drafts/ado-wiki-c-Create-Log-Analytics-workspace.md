---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Create and manage Log Analytics workspaces/Create Log Analytics workspace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FCreate%20and%20manage%20Log%20Analytics%20workspaces%2FCreate%20Log%20Analytics%20workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Scenario
---
The purpose of this workflow is to guide you to **troubleshoot workspace creation issues**, either via the Azure portal, PowerShell, ARM template, Azure CLI or API calls.

It also covers two topics:
- Who/what created a workspace
- Why a workspace with the 'DefaultWorkspace-<GUID>-<Region>' naming convention got created

##Minimum information needed
* Subscription ID 
* Time window of when the issue occurred
* Error message
* Workspace name
