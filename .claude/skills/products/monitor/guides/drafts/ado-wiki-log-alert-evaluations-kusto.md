---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get log alert rule evaluations from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20log%20alert%20rule%20evaluations%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Log Alert Rule Evaluations from Kusto

> **Note:** Log alerts evaluation telemetry retention is limited to 30 days (GDPR).

## Before You Begin

Install Kusto Explorer and add a connection for the **azalertsprodweu** Kusto cluster.

## Querying For Log Alert Rule Evaluations

1. Open ASC from the support request → navigate to Resource Explorer.
2. Locate the alert rule under **microsoft.insights** → **scheduledqueryrules**, copy the resource ID.
3. Open Kusto Explorer → **Home** → **New tab** → select **LogSearchRule** database under azalertsprodweu.
4. Run the following query (replace placeholders):

```kql
let RuleId = "ALERTRULEIDGOESHERE";
let startTime = STARTTIMEGOESHERE;
let endTime = ENDTIMEGOESHERE;
let requested_parentID = requests
| where timestamp > startTime and timestamp < endTime
| where customDimensions.ArmResourceId =~ RuleId
| extend expectedTriggerTime = todatetime(customDimensions.SchedulerExpectedTriggerTime),
         queryStartTime = todatetime(customDimensions.QueryStartTime),
         queryEndTime = todatetime(customDimensions.QueryEndTime)
| where timestamp > startTime
| summarize by operation_ParentId;
requests
| where timestamp > startTime and timestamp < endTime
| where operation_ParentId in (requested_parentID)
| project operation_ParentId,
          queryStartTime = todatetime(customDimensions.QueryStartTime),
          queryEndTime = todatetime(customDimensions.QueryEndTime),
          exception = tostring(customDimensions.Exception),
          timestamp,
          expectedTriggerTime = todatetime(customDimensions.SchedulerExpectedTriggerTime),
          name,
          alertId = tostring(customDimensions.AlertId),
          isThresholdMet = tostring(customDimensions.IsThresholdMet),
          monitorCondition = tostring(customDimensions.MonitorCondition),
          dimensionCombinationMeetingThreshold = tostring(customDimensions.DimensionCombinationMeetingThreshold)
| order by timestamp asc
| where name in ("kusto-execute-search","prepare-actions")
| summarize EvaluationTime = arg_max(timestamp,*), make_list(todynamic(name)) by operation_ParentId, queryStartTime, queryEndTime
| project EvaluationTime, queryStartTime, queryEndTime,
          isThresholdMet = iff(isempty(isThresholdMet),"False",isThresholdMet),
          exception, operation_ParentId
```

5. For deeper investigation of a specific evaluation, use:

```kql
traces
| where operation_ParentId == "OPERATIONPARENTIDGOESHERE"
```

## Key Fields

- **isThresholdMet**: Whether the alert threshold was met for that evaluation
- **exception**: Any exception during evaluation
- **operation_ParentId**: Unique ID linking all traces for one evaluation cycle
