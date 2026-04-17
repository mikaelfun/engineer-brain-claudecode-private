---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get stateful log alert rule state change history (Active,Resolved) from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20stateful%20log%20alert%20rule%20state%20change%20history%20(Active%2CResolved)%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get stateful log alert rule state change history (Active,Resolved) from Kusto

> **Note:** Log alerts evaluation telemetry retention is limited to 30 days (GDPR).

## Before You Begin

Install Kusto Explorer and add a connection for the **azalertsprodweu** Kusto cluster.

Database: **LogSeachRule**

## Prerequisites

1. Open ASC from the support request
2. Navigate to Resource Explorer
3. Locate the alert rule under **microsoft.insights** → **scheduledqueryrules**
4. Copy the resource ID

## Kusto Queries

### Query 1: State changes in a specific timeframe

```kql
let startTime = STARTTIMEGOESHERE; //example: todatetime("2024-07-01T00:00:00.000Z")
let endTime = ENDTIMEGOESHERE;
let _ruleId = "ALERTRULEIDGOESHERE";
PlotAlertStateChanges(startTime=startTime, endTime = endTime, _locations="REGIONNAMEGOESHERE", ruleId=_ruleId)
| where AlertDimensionCombination !has "EvaluationHeartbeatDimension"
| where StateChanged
| project timestamp,queryEndTime,EvaluationResult,ActivationMode,StateChanged,Details,operation_ParentId,AlertDimensionCombination
```

> Remove `| where StateChanged` to see all evaluations including those where state did not change.

### Query 2: State changes for a specific dimension value

Same as Query 1, but add filter:
```kql
| where AlertDimensionCombination has "DIMENSIONVALUEGOESHERE" and AlertDimensionCombination !has "EvaluationHeartbeatDimension"
```

### Query 3: State changes for a specific evaluation

Add `operationParentId` parameter to `PlotAlertStateChanges()`:
```kql
PlotAlertStateChanges(startTime=startTime, endTime=endTime, _locations="REGIONNAMEGOESHERE", ruleId=_ruleId, operationParentId="OPERATIONPARENTIDGOESHERE")
```

## Result Properties Reference

| Property | Description |
|:---------|:------------|
| timestamp | UTC time when Log search alert engine processed the request |
| queryEndTime | End time of the evaluation query window |
| EvaluationResult | Whether threshold was met or unmet |
| ActivationMode | Alert state lifecycle: **Activating** (threshold first met, not yet sent to AMP) → **Active** (sent to AMP) → **Resolving** (resolution conditions met, e.g. 15 min elapsed since last unhealthy; resolution not yet sent) → **Resolved** (resolution sent to AMP) |
| StateChanged | Whether alert state changed from previous evaluation |
| Details | Additional info (activation mode changed, additional threshold met, resolution condition satisfied, etc.) |
| AlertDimensionCombination | Dimension name; if no dimensions configured, shows alert scope resource ID |
