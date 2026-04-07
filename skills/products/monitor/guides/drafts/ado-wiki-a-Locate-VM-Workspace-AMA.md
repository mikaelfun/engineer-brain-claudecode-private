---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To locate VM reporting Data to which Workspace using AMA Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%20locate%20VM%20reporting%20Data%20to%20which%20Workspace%20using%20AMA%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To locate VM reporting Data to which Workspace using AMA Agent

## Scenario

How to locate which Workspace a customer's VM is reporting data to in the last 24 hours, and what the current AMA agent version is.

This information is usually available in Azure Support Center if:
- You know the Azure Subscription ID of the VM
- The customer VM is only connected to a single workspace (non-MDE workspace)

## Query (AMA Agent)

Execute in [Azure Data Explorer - genevaagent/AMA](https://dataexplorer.azure.com/clusters/genevaagent/databases/AMA):

```kusto
HealthReport
| where TIMESTAMP > ago(24h)
| where tolower(ResourceId) == tolower("<COMPUTER RESOURCE ID HERE>")
| where Ods == true
| extend workspace = tostring(_Ods)
| distinct ResourceId, Ods, AgentVer, workspace
```

This returns the ResourceId, ODS endpoint, Agent Version, and connected workspace for the specified VM.
