---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get fired alert details from a log alert evaluation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20fired%20alert%20details%20from%20a%20log%20alert%20evaluation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get fired alert details from a log alert evaluation

## Prerequisites
- Access to Azure Support Center (ASC)
- Access to Kusto clusters: azalertsprodweu.westeurope, aznscluster.southcentralus

## Steps

### 1. Open ASC Resource Explorer
Open the support request in Azure Support Center and navigate to Resource Explorer.

### 2. Locate the alert rule
Find the desired alert rule either by Resource Group or by expanding providers → microsoft.insights → scheduledqueryrules.

### 3. Get evaluation logs
Navigate to **execution history** tab, filter by Start Time and End Time (UTC), click **Run**.
Expand the operation matching the timestamp of interest. Click the **Logs** link in the **Evaluation logs** section to open Kusto Explorer with a pre-populated query:

```kql
lsa_supportabilityEvaluationTraces(datetime(2025-02-16 14:57:21Z),datetime(2025-02-16 16:57:21Z),'<operationParentId>')
| order by timestamp
```

### 4. Build the comprehensive query
Add variable declarations at the top:
```kql
let startTime = datetime(); //Copy first timestamp from function
let endTime = datetime();   //Copy second timestamp from function
let operationParentId = ''; //Copy operation parent ID from function
```

Then append the detailed analysis query below `lsa_supportabilityEvaluationTraces(...)`:

**Key query sections:**
1. **Alert context extraction** — parses `AlertBuilderUsingAlertsMgmtIngestionMessage new alert context` from LSA traces
2. **AMP join** — joins with `lsa_dependencies` (name=="AMP") for muting info and dimension correlation
3. **Alert instance ID** — joins with `AzureAlertsManagement.traces` for AlertInstanceId, FiredTimestamp, CorrelationId
4. **Alert Processing Rules** — joins for matched APRs, NotificationSkippedReason, ActionGroupIds sent
5. **Mute action details** — checks if LSA and/or AMP is muting the notification
6. **AzNS notification details** — joins with `AzNSPROD.AzNSTransmissions_All` for notification state/substates/failure reasons

### 5. Interpret results

| Column | Description |
|--------|-------------|
| AlertInstanceId | Alert instance ID |
| Condition | Whether Fired or Resolved, and when LSA invoked AMP |
| FiredTimestamp | Time the alert fired from AMP |
| alertDimensions | Dimension names and values |
| alertContext | Full alert context |
| AlertProcessingRuleData | matchedAlertProcessingRules, targetResourceAPR, NotificationSkippedReason, ActionGroupIdsSentToNotification |
| MuteActionDetails | LSA muting status + AMP muting status |
| NotificationData | NotificationId, State, SubState, FailureReason, CreatedTime, CompleteTime, ActionGroupResourceId |
| operation_ParentId | Parent operation ID of the evaluation |
| SourceAlertId | Internal fired alert ID (join key) |
| CorrelationId | Internal fired alert ID (join key) |

## Kusto Clusters Used
- `azalertsprodweu.westeurope.kusto.windows.net` — LogSearchRule database, AzureAlertsManagement database
- `aznscluster.southcentralus.kusto.windows.net` — AzNSPROD database

## Note
This guide covers the complete end-to-end flow from LSA evaluation → AMP → APR → AzNS notification. For general fired alert history, see the simpler query in "How to get history of fired alerts from Kusto".
