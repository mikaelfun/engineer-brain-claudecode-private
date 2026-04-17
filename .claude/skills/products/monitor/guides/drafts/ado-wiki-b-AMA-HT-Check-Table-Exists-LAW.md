---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if a table exists in a Log Analytics workspace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20a%20table%20exists%20in%20a%20Log%20Analytics%20workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies To:
- Azure Monitor:- Custom Tables for log ingestion

## Description

Several methods to determine if a table has been created in a Log Analytics workspace.

## Azure Support Center (ASC)

### Kusto Query
In ASC, navigate to Subscription->Microsoft.OperationalInsights->workspaces-><WorkspaceName>
Select the **Query Customer Data** tab
Replace "<NameOfTable>" with that of the table and run the Kusto query.

```
let tablename = "<NameOfTable>";
union withsource=Table_Name *
| summarize by Table_Name
| where Table_Name == tablename
```

### Metadata Tab
In ASC, navigate to Subscription->Microsoft.OperationalInsights->workspaces-><WorkspaceName>
Select the **Query Customer Data** tab
Reference the **Table Name** dropdown list

## Azure Portal

Navigate <LogAnalytics workspace>->Settings->Tables
