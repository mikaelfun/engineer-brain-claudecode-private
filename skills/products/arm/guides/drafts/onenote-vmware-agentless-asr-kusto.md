# VMware Agentless Migration (ASR) Kusto Troubleshooting - Mooncake

## Scenario
Initial replication stuck at "queued" / 0% progress for VMware agentless migration in Mooncake.

## Kusto Cluster
- Cluster: `asradxclusmc.chinanorth2.kusto.chinacloudapi.cn`
- Database: `ASRKustoDB`

## Step 1: Check Operation Status (SRSOperationEvent)

```kql
cluster('asradxclusmc.chinanorth2.kusto.chinacloudapi.cn').database('ASRKustoDB').SRSOperationEvent 
| where SubscriptionId == "<subscription-id>"
| where PreciseTimeStamp >= ago(20d)
| where SRSOperationName !contains "GetMonitoringJobsWorkflow" 
| where SRSOperationName !contains "WaitForUpdateFabricLayoutWorkFlow"
| sort by PreciseTimeStamp asc 
| project PreciseTimeStamp, ServiceName, ClientRequestId, SRSOperationName, State, ObjectType, ObjectName, Region, ContainerId, ResourceId, TimeTaken, ResourceArmId
```

## Step 2: Check InitialReplication Progress (SRSDataEvent)

```kql
cluster('asradxclusmc.chinanorth2.kusto.chinacloudapi.cn').database('ASRKustoDB').SRSDataEvent
| where ClientRequestId == @"<client-request-id>"
| where TIMESTAMP between (datetime(<start>)..datetime(<end>))
| where Message contains "InitialReplication"
| project PreciseTimeStamp, Level, Message, Tid, CallerInfo
| order by PreciseTimeStamp asc
```

Key fields to check in CbtProtectedVmDetails:
- `InitialReplicationCompletionStatus`: should be "Pending" → "Completed"
- `ProgressPercentage`: track progress
- `UploadedBytes` vs `TotalBytesToTransfer`

## Step 3: Check Snapshot Replication (GatewayOperationEvent)

```kql
database("ASRKustoDB").GatewayOperationEvent
| where ClientRequestId contains "<client-request-id>"
| extend monitoringPayload = parse_json(Message) 
| extend totalBytes = tolong(monitoringPayload.CumulativeProgress.TotalBytes)
| extend uploadedBytes = tolong(monitoringPayload.CumulativeProgress.UploadedBytes)
| extend downloadedBytes = tolong(monitoringPayload.CumulativeProgress.DownloadedBytes)
| extend ReplicationType = iif(monitoringPayload.IsInitialReplicationCycle == "true", "IR", 
    iif(monitoringPayload.IsPlannedFailoverDeltaCycle == "true", "PFO", "DeltaSync"))
| project TIMESTAMP, ServiceEventName, TotalMB=totalBytes/1024/1024, UploadedMB=uploadedBytes/1024/1024, 
    Percentage=todouble(uploadedBytes + downloadedBytes) * 100 / todouble(totalBytes * 2), ReplicationType, Message
```

## Step 4: Check Worker Scheduling (GatewayDiagnosticEvent)

```kql
let ServiceBusID = "<gateway-id>";
GatewayDiagnosticEvent
| where PreciseTimeStamp between (datetime(<start>)..datetime(<end>))
| where ServiceBusSessionId in (ServiceBusID)
| where Message contains "VmDetails added/updated. " 
    or (Message contains "VM added to scheduled list" and Message contains "Gateway ID") 
| parse Message with * "VmId: '" VmId1 "' " * "Gateway: '" GatewayId1 "' " * "DiskCount: '" DiskCount "' " * "Priority: '" Priority "'"
| parse Message with * "Gateway ID: '" GatewayId2 "', " * "VM to schedule: '" VmId2 "', " * "free workers: '" FreeWorkers "'."
| extend RequestTime = iff(Priority != "", PreciseTimeStamp, now(5d)) 
| extend ScheduleTime = iff(FreeWorkers != "", PreciseTimeStamp, now(5d))
```

## Step 5: Run Appliance Diagnostics
Access `https://localhost:44368` on the appliance to run diagnostics and collect report.

## Tags
azure-migrate, vmware-agentless, initial-replication, ASR, kusto, 21v, snapshot-replication
