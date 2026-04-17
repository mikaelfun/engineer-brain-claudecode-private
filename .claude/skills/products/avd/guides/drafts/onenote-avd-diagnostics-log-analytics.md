# AVD Diagnostics with Log Analytics — KQL Query Patterns

**Source**: OneNote Lab Verification (Ning, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Overview

Azure Virtual Desktop diagnostics can be analyzed through Log Analytics using the `WVDConnections` table. This guide covers common KQL query patterns for connection analysis.

## Key Table: WVDConnections

### List recent connections for a user

```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
```

### Daily connection count

```kql
WVDConnections
| where UserName contains "username"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```

### Session duration calculation

```kql
let Events = WVDConnections | where UserName contains "username";
Events
| where State == "Connected"
| project CorrelationId, UserName, ResourceAlias, StartTime=TimeGenerated
| join (Events
    | where State == "Completed"
    | project EndTime=TimeGenerated, CorrelationId)
on CorrelationId
| project Duration = EndTime - StartTime, ResourceAlias
| sort by Duration asc
```

## Notes

- `CorrelationId` links Connected and Completed events for the same session
- `State` values: "Connected", "Completed"
- Use `bin(TimeGenerated, 1d)` for daily aggregation
- Reference: [Azure Virtual Desktop diagnostics log analytics](https://docs.microsoft.com/en-us/azure/virtual-desktop/diagnostics-log-analytics)
