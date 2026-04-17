# AVD Log Analytics KQL Queries Reference

> Source: OneNote - Mooncake POD Support Notebook / AVD / TS Tools / LogA
> Quality: draft | Needs review before promotion

## Overview
KQL query collection for troubleshooting Azure Virtual Desktop (AVD) issues via Log Analytics. Covers WVDConnections, WVDErrors, and WVDCheckpoints tables.

## Key Queries

### Full Feed Activity (Connections + Errors + Checkpoints)
```kql
WVDConnections
| project-away TenantId, SourceSystem
| join kind=leftouter (
    WVDErrors
    | summarize Errors=makelist(pack('Code', Code, 'CodeSymbolic', CodeSymbolic, 'Time', TimeGenerated, 'Message', Message, 'ServiceError', ServiceError, 'Source', Source)) by CorrelationId
) on CorrelationId
| join kind=leftouter (
    WVDCheckpoints
    | summarize Checkpoints=makelist(pack('Time', TimeGenerated, 'Name', Name, 'Parameters', Parameters, 'Source', Source)) by CorrelationId
    | mv-apply Checkpoints on (
        order by todatetime(Checkpoints['Time']) asc
        | summarize Checkpoints=makelist(Checkpoints)
    )
) on CorrelationId
| project-away CorrelationId1, CorrelationId2
| order by TimeGenerated desc
```

### Session Start/End Times (Last 7 Days)
```kql
WVDConnections
| where State == "Connected" and TimeGenerated > ago(7d)
| project CorrelationId, UserName, ResourceAlias, StartTime = TimeGenerated
| join (WVDConnections | where State == "Completed" | project EndTime = TimeGenerated, CorrelationId) on CorrelationId
| project UserName, StartTime, EndTime, ResourceAlias
| sort by StartTime desc
```

### All Connections for a Single User
```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
```

### Connection Count by Day
```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```

### Session Duration by User
```kql
let Events = WVDConnections | where UserName == "userupn";
Events
| where State == "Connected"
| project CorrelationId, UserName, ResourceAlias, StartTime=TimeGenerated
| join (Events | where State == "Completed" | project EndTime=TimeGenerated, CorrelationId) on CorrelationId
| project Duration = EndTime - StartTime, ResourceAlias
| sort by Duration asc
```

### Errors for a Specific User
```kql
WVDErrors
| where UserName == "johndoe@contoso.com"
| take 100
```

### Error Distribution Across All Users
```kql
WVDErrors
| where ServiceError == "false"
| summarize usercount = count(UserName) by CodeSymbolic
| sort by usercount desc
| render barchart
```

## 21v Applicability
All queries work in Mooncake. Replace table names if using workspace-based (not resource-based) queries.
