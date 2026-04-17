---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Check if Table schema is correctly defined"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Check%20if%20Table%20schema%20is%20correctly%20defined"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies To:
- Azure Monitor:- Data Collection Rules

## Description

This how to guide will demonstrate the steps to list the table schema for a Log Analytics Workspace table.

## Scenario: Text Logs
The Table schema must include the following columns and associated data types:
- TimeGenerated - datetime
- RawData - string

Optional columns:
- FilePath - string
- Computer - string

Custom columns are accepted but will require a KQL Transform to populate. DataTypes must also match.
For instance, if the data type in a transform is an **integer**, then the column must be defined as **int**

## Via Azure Support Center (ASC)

### Kusto Query
In ASC, navigate to Subscription->Microsoft.OperationalInsights->workspaces-><WorkspaceName>
Select the **Query Customer Data** tab
In the below query replace **<NameOfTable>** with that of the table and run the Kusto query.

```
<NameOfTable> | getschema
```

### Metadata Tab
In ASC, navigate to Subscription->Microsoft.OperationalInsights->workspaces-><WorkspaceName>
Select the **Query Customer Data** tab
Select the **Table Name** from the **Table Name** dropdown list
Click the **Show Table Schema** button

## Azure Portal

### Workspace Query
Navigate to <Workspace>->Logs
```
<NameOfTable> | getschema
```

### Workspace Table reference
Navigate to <Workspace>->Settings->Tables
Filter/Find the table, select Ellipse > Edit Schema, review the Schema
