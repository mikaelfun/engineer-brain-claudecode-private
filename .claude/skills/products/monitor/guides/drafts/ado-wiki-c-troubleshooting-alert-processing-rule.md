---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting alert processing rule not working as expected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20alert%20processing%20rule%20not%20working%20as%20expected"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Alert Processing Rule Not Working as Expected

## Scenario
Alert processing rule not working as expected — action or notification was not suppressed, or action group was not added to a fired alert.

## Information Needed
- Resource ID of the Alert processing rule
- Resource ID or name of the affected alert rule
- Timestamp in UTC when alert fired

## Troubleshooting

### Step 1: Navigate to alert processing rule in ASC
Find the rule under Microsoft.AlertsManagement/actionRules in Azure Support Center.

### Step 2: Check Execution History
Click on the **Execution History** tab. Set start/end time around the alert firing and click Run.

### Result Set Analysis

**Summary section**: Shows how many fired alerts matched the alert processing rule scope, and how many matched the condition.

**Detailed evaluations**: Grouped by alert rule name.

> **Important**: Results only show evaluations where the fired alert and alert processing rule **scopes matched**. If the alert rule name does not appear in results, the scopes did not match. Compare:
> - Alert processing rule scope (Properties tab)
> - Fired alert scope (alert rule's Fired Alerts tab → Target Resource column)

### Step 3: Filter to specific alert rule
Use the drop-down filter to narrow results to the customer's impacted alert rule.

### Step 4: Examine evaluation logs
Expand the evaluation matching the alert fire timestamp and press **logs**. The Kusto query shows evaluation logs from Alerts Management Platform.

Look for the entry matching your alert processing rule and examine subsequent lines to identify why it didn't match.

**Common causes**: Filter condition mismatch (e.g., alert fired with severity 1 while processing rule only targets Sev 2 and 3).

### Workaround for ASC Query Issue
If the ASC-generated query returns no results, modify the query by adding:
```kql
| take 1
| project operation_ParentId
| join (
    Traces
    | where timestamp between(startTime..endTime)
    | where cloud_RoleName contains "AlertProcessingRulesService"
    | where callerMemberName == 'Matches' or callerFilePath contains 'ActionRuleEngineHelper.cs' or callerFilePath contains 'ActionRuleHandler.cs'
) on operation_ParentId
```
