---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To: Check a Log Analytics Workspace for Agent Heartbeat Connectivity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%3A%20Check%20a%20Log%20Analytics%20Workspace%20for%20Agent%20Heartbeat%20Connectivity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Check a Log Analytics Workspace for Agent Heartbeat Connectivity

- Azure Monitor Agents: All versions

## Note
- The screenshot and output provided are from test labs there is no pii data present.

## Scenario
The following guide can be used to validate heartbeat connectivity for any given Log Analytics Agent resource or group of resources.

## Sample Queries

The sample queries provided can be used to check for heartbeat activity from either individual resources or any given grouping of resources. These queries can also be modified to check heartbeat activity for a specific timeframe, or to count the number of hearts by any given resource depending on the nature of the investigations.

### Last heartbeat for a specific Computer (30-day window)

```kql
Heartbeat
| where Computer contains "Hostname of the Computing Resource" and TimeGenerated > ago(30d)
| summarize LastCall = argmax(TimeGenerated, *) by Computer, OSType, ResourceGroup
```

> **Note**: The value in the **Computer** field will be the **hostname** of the computing resource, and this may not be the same name as the given **Azure Resource name**.

If we remove the resource specific criteria from the query, we expand our results to include the last heartbeat for all Resources connected to the Workspace.

### Heartbeat count for a specific Computer (1-hour window)

```kql
Heartbeat
| where Computer contains "Hostname of the Computing Resource" and TimeGenerated > ago(1h)
| summarize count() by Computer, OSType, ResourceGroup
```

## Where to query

The queries can be executed in two locations:
1. **ASC (Azure Support Center)**: If the customer provided workspace access, locate the workspace under **Microsoft.OperationalInsights** > workspaces, select the **Query Customer Data** Tab, and execute in the **Kusto Query** Window
2. **Portal**: Locate the workspace resource, find the **Logs** blade under the **General Grouping** at the workspace dashboard, execute in the **New Query** Window
