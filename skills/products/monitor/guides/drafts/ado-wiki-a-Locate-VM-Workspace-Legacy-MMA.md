---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To locate VM reporting Data to which Workspace using Legacy Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%20locate%20VM%20reporting%20Data%20to%20which%20Workspace%20using%20Legacy%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To locate VM reporting Data to which Workspace using Legacy Agent (MMA)

## Scenario

How to locate which Workspace a customer's VM is reporting data to in the last 24 hours, and what the current Legacy MMA agent version is.

This information is usually available in Azure Support Center if:
- You know the Azure Subscription ID of the VM
- The customer VM is only connected to a single workspace (non-MDE workspace)

## Query (Legacy MMA Agent)

Execute in [Azure Data Explorer - genevaagent/Telemetry](https://dataexplorer.azure.com/clusters/genevaagent/databases/Telemetry):

```kusto
AgentTelemetry
| where TIMESTAMP > ago(24h)
| where tolower(ResourceId) contains '<COMPUTER RESOURCE URI>'
| distinct ResourceId, WorkspaceId, AgentId, AgentVersion
```

This returns the ResourceId, WorkspaceId, AgentId, and AgentVersion for the specified VM.
