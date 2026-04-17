# ARM Kusto Query Reference (Mooncake)

> Source: Mooncake POD Support Notebook / VM / Tools / 2. Kusto / ARM Logs

## Kusto Endpoint

```
https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
```

## Key Tables

### EventServiceEntries

Activity logs (also viewable on portal). When ARM calls another resource provider, it generates a `serviceRequestId` which becomes the `operationId` or `activityId` in other RP Kusto logs.

```kql
EventServiceEntries 
| where subscriptionId == "<subscription-id>"
| where PreciseTimeStamp >= datetime(2022-01-10 00:00:00) and PreciseTimeStamp <= datetime(2022-01-10 05:00:00)
// | where correlationId contains "<cor-ID>"
| where resourceUri contains "resourcegroups/<rg-name>"
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| where operationName contains "Microsoft.Compute/virtualMachines/write"
| sort by PreciseTimeStamp asc nulls last
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, properties, resourceUri, eventName, operationId, armServiceRequestId, subscriptionId, claims
```

### HttpIncomingRequests

Requests arriving at ARM.

```kql
HttpIncomingRequests
| where subscriptionId == "<subscription-id>"
| where PreciseTimeStamp >= datetime(2022-01-10 00:00:00) and PreciseTimeStamp <= datetime(2022-01-12 00:00:00)
| where targetUri contains "resourcegroups/<rg-name>/providers/Microsoft.Compute/virtualMachines/<vm-name>"
| where httpMethod contains "PUT"
| sort by PreciseTimeStamp asc nulls last
| project PreciseTimeStamp, TaskName, durationInMilliseconds, operationName, httpMethod, serviceRequestId, httpStatusCode, subscriptionId, ActivityId, targetUri, correlationId, exceptionMessage
```

### HttpOutgoingRequests

Requests going out from ARM to resource providers.

```kql
HttpOutgoingRequests
| where subscriptionId == "<subscription-id>"
| where PreciseTimeStamp >= datetime(2022-01-10 00:00:00) and PreciseTimeStamp <= datetime(2022-01-12 00:00:00)
| where targetUri contains "resourcegroups/<rg-name>/providers/Microsoft.Compute/virtualMachines/<vm-name>"
| where operationName contains "PUT"
| sort by PreciseTimeStamp asc nulls last
| project PreciseTimeStamp, TaskName, durationInMilliseconds, operationName, httpMethod, serviceRequestId, httpStatusCode, subscriptionId, ActivityId, targetUri, correlationId, exceptionMessage
```

## Cross-Layer Tracing

`serviceRequestId` in ARM EventServiceEntries = `operationId` in CRP ApiQosEvent = `activityId` in CRP ContextActivity

## Related

- `onenote-arm-crp-fabric-topology.md` - Architecture overview
- `onenote-crp-kusto-reference.md` - CRP Kusto queries
- `onenote-diskrp-kusto-reference.md` - DiskRP Kusto queries
