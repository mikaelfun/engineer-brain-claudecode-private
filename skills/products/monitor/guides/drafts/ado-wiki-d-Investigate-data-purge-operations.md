---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Table management/How to: Investigate data purge operations conducted by customers"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FTable%20management%2FHow%20to%3A%20Investigate%20data%20purge%20operations%20conducted%20by%20customers"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to: Investigate data purge operations conducted by customers

> **Important**: CSS or PG cannot manually expedite purge operations. For faster deletion, recommend Delete Data API instead.

## Background
Customers use the Purge operation on their workspace per: https://learn.microsoft.com/rest/api/loganalytics/workspace-purge/purge

## When to use Delete-data API instead of Purge
1. Delete data API recommended for any non-GDPR delete.
2. Purge is intended for GDPR delete only.

## Expected Behavior and Limitations of Purge

1. **Supported operators**: `==`, `=~`, `in`, `in~`, `>`, `>=`, `<`, `<=`, `between`. For unsupported operators (regex, contains), see the ItemId workaround guide.

2. **Activity Log**: Entry appears for Purge initiation with timestamp and query details. However:
   - No Activity Log entry for purge completion
   - No operationId visible in the activity log for monitoring

3. **Purpose**: Only for GDPR scenarios. Not designed for general log cleanup.

4. **Billing**: Purging does not affect costs - data already ingested is billable regardless.

5. **Completion time**: Up to 30 days (usually a few days). Cannot be expedited. GDPR 30-day SLA applies.

6. **Time filter behavior**: The effective time filter references the timestamp of the API call, not when purge actually executes. E.g., `TimeGenerated<=now()` at 10:00 AM UTC on 10/03/2022 will use that exact datetime.

## Check purge status using telemetry

Access to the relevant Kusto cluster: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480522/

### By workspace ID (no operationId available, default 14d lookback):
```kusto
let wsid="affectedWsId";
let tablename="tableWhichPurgeWasExecutedOn"; //Optional
cluster('oiildc.kusto.windows.net').database("AMBackend_PROD").GetPurgeRequestsStatusByWorkspaceIdAndTableName(wsid, tablename)
```

### By workspace ID with start time:
```kusto
let wsid="affectedWsId";
let StartTime = todatetime(PutYourStartDatetimeHere);
let tablename="tableWhichPurgeWasExecutedOn"; //Optional
cluster('oiildc.kusto.windows.net').database("AMBackend_PROD").GetPurgeRequestsStatusByWorkspaceIdRequestTimeAndTableName(wsid, StartTime, tablename)
```

### By operationId (default 14d lookback):
```kusto
let operationId="PurgeRequestId";
cluster('oiildc.kusto.windows.net').database("AMBackend_PROD").GetPurgeRequestStatusByRequestId(operationId)
```

### By operationId with start time:
```kusto
let operationId="PurgeRequestId";
let StartTime = todatetime(PutYourStartDatetimeHere);
cluster('oiildc.kusto.windows.net').database("AMBackend_PROD").GetPurgeRequestStatusByRequestIdAndRequestTime(operationId, StartTime)
```

## IcM Escalation
After following this TSG and receiving SME/TA/EEE approval, use Product Group Escalation process with '_Azure Log Analytics | Draft_' template.
