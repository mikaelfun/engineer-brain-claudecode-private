---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Alerts Management/How to get Alert Processing Rule (Action Rule) evaluation logs from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAlerts%20Management%2FHow%20to%20get%20Alert%20Processing%20Rule%20(Action%20Rule)%20evaluation%20logs%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Alert Processing Rule (Action Rule) Evaluation Logs from Kusto

## Prerequisites

- Kusto Explorer installed
- Connection to **azalertsprodweu** Kusto cluster
- Database: **AzureAlertsManagement**

## Required Information

- Subscription Id
- Alert rule Id / Fired Alert instance Id
- Timestamp

## Step 1: Find Matching Action Rules by Alert Rule ID

```kql
let startTime = datetime(2021-08-01 09:00);
let endTime = datetime(2021-08-01 10:00);
let AlertRuleId = "ALERTRULEGOESHERE";
Traces
| where timestamp between(startTime .. endTime)
| where tostring(customDimensions.AlertRuleId) == AlertRuleId
| where message has "Alert has" and message contains "action rules in database"
| extend matchedActionRules = tostring(customDimensions.MatchedActionRuleIds)
| project operation_Id, timestamp, message, matchedActionRules
```

## Step 1 (Alternative): Find by Fired Alert ID

```kql
let startTime = datetime(2021-08-01 09:00);
let endTime = datetime(2021-08-01 10:00);
let FiredAlertId = "FIREDALERTIDGOESHERE";
Traces
| where timestamp between(startTime .. endTime)
| where tostring(customDimensions.AlertInstanceId) == FiredAlertId
| where message has "Alert has" and message contains "action rules in database"
| extend matchedActionRules = tostring(customDimensions.MatchedActionRuleIds)
| project operation_Id, timestamp, message, matchedActionRules
```

## Step 2: Get Full Evaluation Flow by Operation ID

Copy the `operation_Id` from Step 1, then run:

```kql
let startTime = datetime(2021-08-01 09:00);
let endTime = datetime(2021-08-01 10:00);
let opreationId = "OPERATIONIDGOESHERE";
Traces
| where callerMemberName == "Matches" or callerFilePath contains "ActionRuleEngineHelper.cs" or callerFilePath contains "ActionRuleHandler.cs"
| where timestamp between(startTime .. endTime)
| where operation_Id == opreationId
```

## Step 3 (Optional): Full Debug Log

```kql
let startTime = datetime(2021-08-01 09:00);
let endTime = datetime(2021-08-01 10:00);
let opreationId = "OPERATIONIDGOESHERE";
Traces
| where timestamp between(startTime .. endTime)
| where operation_Id == opreationId
```

## Example: Matched Action Rule

Evaluation logs show step-by-step matching:
1. Scope match: Action rule scope matches alert scope
2. Time window: Alert fired time within effective dateTime window
3. Recurrence: Alert fired time matches recurrence schedule
4. Conditions: Alert fields (Severity, AlertContext) match conditions
5. Result: "Alert has N action rules in database, M action rules left after filter evaluation"

## Example: No Matching Action Rules

Message: "Alert has 8 action rules in database, 0 action rules left after filter evaluation"

## Common Reasons for Non-Match

- Fired time outside effective dateTime window
- Scope mismatch between action rule and alert
- AlertContext field doesn't match condition
