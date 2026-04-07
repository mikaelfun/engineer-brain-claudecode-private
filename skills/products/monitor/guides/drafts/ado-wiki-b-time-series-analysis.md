---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Useful KQL Queries/Customer-facing queries (Log Analytics)/Time series analysis example"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FUseful%20KQL%20Queries%2FCustomer-facing%20queries%20(Log%20Analytics)%2FTime%20series%20analysis%20example"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Time Series Analysis - KQL Query Templates

This query is good for creating a time series of your data. Insert the table name (and column if applicable) you are trying to analyze and the query will give you a RecordCount for each category on a time-basis. It will then render a timechart (visible line graph) for easy analysis.

**Note:** ASC does not allow the `render` operator. You can ask the customer to run the query directly.

The query inserts 0 as the default count for any time period where no records are found.

## Use cases
- See VM historical uptime
- Count ingestion of certain records over time period
- See when latency was occurring

## Basic template

```kql
[tablename]
| make-series RecordCount = count() default=0 on TimeGenerated from ago(30d) to now() step 1d // by [column]
| mv-expand RecordCount, TimeGenerated
| extend todatetime(TimeGenerated), toint(RecordCount)
| sort by TimeGenerated asc
| render timechart
```

## Example: Find latency time window (VMConnection)

Adapted to find when latency > 60 minutes was occurring on VMConnection table:

```kql
let VMConnectionAvgs = VMConnection
    | make-series Latency = avg(_TimeReceived - TimeGenerated) default=0
    on TimeGenerated from ago(30d) to now() step 1h by Computer
    | mv-expand Latency, TimeGenerated
    | where Latency > 60m;
let Earliest60mLatency = toscalar(VMConnectionAvgs
    | summarize min(todatetime(TimeGenerated)));
let Latest60mLatency = toscalar(VMConnectionAvgs
    | summarize max(todatetime(TimeGenerated)));
print Earliest60mLatency = Earliest60mLatency, Latest60mLatency = Latest60mLatency
```

## Example: Heartbeat time series per Computer

```kql
Heartbeat
| make-series RecordCount = count() default=0 on TimeGenerated from ago(30d) to now() step 1d by Computer
| mv-expand RecordCount, TimeGenerated
| extend todatetime(TimeGenerated), toint(RecordCount)
| sort by TimeGenerated asc
| render timechart
```

References:
- https://learn.microsoft.com/azure/data-explorer/kusto/query/mvexpandoperator
- https://learn.microsoft.com/azure/data-explorer/kusto/query/make-seriesoperator
