# AVD Log Analytics Query Reference (OneNote)

Log Analytics workspace queries using WVDConnections, WVDErrors, WVDCheckpoints tables.

## View Feed Activity (Connections + Errors + Checkpoints)

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

## Session Start/End Times (Last 7 Days)

```kql
WVDConnections
| where State == "Connected" and TimeGenerated > ago(7d)
| project CorrelationId, UserName, ResourceAlias, StartTime = TimeGenerated
| join (WVDConnections | where State == "Completed" | project EndTime = TimeGenerated, CorrelationId) on CorrelationId
| project UserName, StartTime, EndTime, ResourceAlias
| sort by StartTime desc
```

## All Connections for a Single User

```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
```

## Connection Count by Day

```kql
WVDConnections
| where UserName == "userupn"
| take 100
| sort by TimeGenerated asc, CorrelationId
| summarize dcount(CorrelationId) by bin(TimeGenerated, 1d)
```

## Session Duration by User

```kql
let Events = WVDConnections | where UserName == "userupn";
Events
| where State == "Connected"
| project CorrelationId, UserName, ResourceAlias, StartTime=TimeGenerated
| join (Events | where State == "Completed" | project EndTime=TimeGenerated, CorrelationId) on CorrelationId
| project Duration = EndTime - StartTime, ResourceAlias
| sort by Duration asc
```

## Errors for Specific User

```kql
WVDErrors
| where UserName == "johndoe@contoso.com"
| take 100
```

## Error Occurrence by Code

```kql
WVDErrors
| where CodeSymbolic == "ErrorSymbolicCode"
| summarize count(UserName) by CodeSymbolic
```

## Error Distribution Across All Users (Non-Service Errors)

```kql
WVDErrors
| where ServiceError == "false"
| summarize usercount = count(UserName) by CodeSymbolic
| sort by usercount desc
| render barchart
```
