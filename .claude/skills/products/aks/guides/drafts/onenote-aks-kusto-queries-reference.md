# AKS Kusto Queries Reference

> Source: OneNote - Mooncake POD Support Notebook / AKS / Troubleshooting / Kusto Queries + Kusto query with flow chat
> Status: guide-draft (pending SYNTHESIZE review)

## Kusto Table Rules

- RP service has frontend and backend: frontend* tables for user requests, async* for internal RP requests
- FrontEndQoSEvents: user-facing requests
- AsyncQoSEvents: frontend-to-backend internal requests
- BlackboxMonitoring: NOT an RP component, it's a monitoring component that continuously scans master pod status
- **ServiceRequestId** in ARM EventServices == **OperationID** in AKS RP QOS tables
- **OperationID** in AKS RP QOS tables == **OperationID** in ContextActivity

## Cluster/Database

- Mooncake AKS RP: `akscn.kusto.chinacloudapi.cn` / `AKSprod`
- Mooncake AKS Hub: `mcakshuba.chinaeast2.kusto.chinacloudapi.cn` / `AKSprod`
- ARM: `Armmcadx.chinaeast2.kusto.chinacloudapi.cn` / `armmc`

## Common Scenarios

### 1. Cluster Creation Failed

```kql
// Step 1: Get operation ID
FrontEndQoSEvents
| where PreciseTimeStamp >= datetime(<start>) and PreciseTimeStamp <= datetime(<end>)
| where subscriptionID == "<subID>" and resourceGroupName == "<RG>" and resourceName == "<cluster>"
| where operationName == "PutManagedClusterHandler.PUT"
| take 20

// Step 2: Query by operation ID
union FrontEndContextActivity, AsyncContextActivity, HcpAsyncContextActivity
| where PreciseTimeStamp > ago(20d)
| where operationID == "<opID>"
| project PreciseTimeStamp, level, msg, fileName, lineNumber
```

### 2. Cluster in Failed Status

```kql
// Find ARM errors
EventServiceEntries
| where subscriptionId == "<subId>"
| where resourceUri contains "<clusterName>"
| where status == "Failed"
| where TIMESTAMP > ago(2d)
| project PreciseTimeStamp, status, operationName, correlationId, properties
```

### 3. Check Cluster Error (non-GET operations)

```kql
union FrontEndQoSEvents, AsyncQoSEvents
| where PreciseTimeStamp > ago(20d)
| where subscriptionID == "<subId>"
| where resourceName contains "<cluster>"
| where operationName !contains "get"
| where operationName !contains "list"
```

### 4. Node Not Ready

```kql
// Check BlackboxMonitoring
BlackboxMonitoringActivity
| where PreciseTimeStamp >= datetime(<start>) and PreciseTimeStamp <= datetime(<end>)
| where fqdn == "<fqdn>"
| where (state != "Healthy" or podsState != "Healthy" or resourceState != "Healthy" or addonPodsState != "Healthy")
| project PreciseTimeStamp, reason, Underlay, msg, ccpNamespace, tunnelVersion, ccpIP

// Check RemediatorEvent
RemediatorEvent
| where PreciseTimeStamp >= datetime(<start>) and PreciseTimeStamp <= datetime(<end>)
| where ccpNamespace contains "<ccpNamespace>"
| where reason contains "CustomerLinuxNodesNotReady"
| project PreciseTimeStamp, reason, msg, correlationID
```

### 5. Cluster Status Chart (Timechart)

```kql
BlackboxMonitoringActivity
| where TIMESTAMP > datetime(<start>) and fqdn contains "<fqdn>"
| project PreciseTimeStamp, state, reason
| summarize count() by bin(PreciseTimeStamp, 30m), state
| render timechart
```

## Troubleshooting Flow (RP Request Path)

1. **IncomingRequestTrace** - Initial request arrives
2. **FrontEndQoSEvents** - Frontend processes request
3. **FrontEndContextActivity** - Frontend detailed logs (parse msg as JSON for error codes)
4. **AsyncQoSEvents** - Backend async processing
5. **AsyncContextActivity** - Backend detailed logs
6. **HcpSyncContextActivity** - HCP component called
7. **OverlaymgrEvents** - Overlay components readiness
8. **BlackboxMonitoringActivity** - Ongoing health monitoring

## Key Tips

- Filter out GET/list operations when investigating mutations
- Use `parse_json(msg)` in ContextActivity tables to extract error codes
- `LinuxAgentsCount` in AsyncQoSEvents.propertiesBag shows node count
- OverlaymgrEvents `id` field contains the cluster version ID
- Use `eventObjectName` and `eventReason` in OverlaymgrEvents for K8s events
