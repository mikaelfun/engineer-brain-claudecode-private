# Identify Container and Node Issues - Kusto Diagnostic Queries

> Source: MCVKB 2.23 | Applies to: Mooncake & Global

## Overview

Step-by-step Kusto queries to diagnose VM downtime caused by node-level issues (hardware failures, node unhealthy, healing operations).

## Step 1: Get VM Info

```kql
// Cluster: azurecm.chinanorth2.kusto.chinacloudapi.cn/azurecm
LogContainerSnapshot
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| where virtualMachineUniqueId == "<vmUniqueId>"
| project Tenant, containerId, nodeId, creationTime, tenantName, subscriptionId
```

## Step 2: Check Hardware Errors (WindowsEventTable)

```kql
// Cluster: vmainsight.kusto.windows.net/vmadb
WindowsEventTable
| where NodeId == "<nodeId>" and PreciseTimeStamp between (datetime(start)..datetime(end))
| project PreciseTimeStamp, TimeCreated, Level, ProviderName, EventId, Channel, Description, Cluster, NodeId
```

Look for:
- EventId 41: "System rebooted without cleanly shutting down"
- EventId 6008: "Previous system shutdown was unexpected"

## Step 3: Check Sparkle (SEL data)

```kql
cluster("sparkle.eastus").database("defaultdb").RhwSelandSpklSelbyNodeId(
    startTime=ago(1d), endTime=ago(1h), nodeId="<nodeId>")
```

## Step 4: Check VMA

NetVMA URL: `https://netvma.azure.net/?startTime=MM/DD/YYYY+HH:MM&endTime=MM/DD/YYYY+HH:MM&value=<nodeId>`

## Step 5: Container Status

```kql
TMMgmtSlaMeasurementEventEtwTable
| where ContainerID == "<containerId>"
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| project PreciseTimeStamp, TenantName, RoleInstanceName, Context, EntityState, ContainerID, NodeID, Detail0
```

Key states: `ContainerAction:Reboot` → `ContainerStateCreated` → `ContainerStateStarted` → `GuestOsStateHealthy`

## Step 6: Check Azure Watson Dumps

URL: `https://azurewatson.microsoft.com/?NodeId=<nodeId>`

## Step 7: Node Status

```kql
LogNodeSnapshot
| where nodeId == "<nodeId>"
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| project PreciseTimeStamp, nodeState, nodeAvailabilityState, containerCount, diskConfiguration, faultInfo, rootUpdateAllocationType, RoleInstance
```

Key transitions: `Ready` → `Unhealthy` → `PoweringOn` → `Raw` → `Recovering` → `Ready`

## Step 8: Healing Operations (Anvil)

```kql
AnvilRepairServiceForgeEvents
| where PreciseTimeStamp > datetime(start) and PreciseTimeStamp < datetime(end)
| where ResourceDependencies has_any ("<nodeId>")
| where isnotempty(TreeNodeKey) and TreeNodeKey !in ('Root', 'Node')
| summarize arg_max(PreciseTimeStamp, *) by RequestIdentifier, TreeNodeKey
| order by RequestIdentifier, PreciseTimeStamp asc
| where ResourceType == "Node"
| project PreciseTimeStamp, AnvilOperation=TreeNodeKey, NodeId=tostring(parse_json(ResourceDependencies).NodeId), AnvilRequestIdentifier=RequestIdentifier, ResourceId, ResourceType
```

## Step 9: Node Logs

```kql
TMMgmtNodeEventsEtwTable
| where NodeId == "<nodeId>"
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| where Message !contains "[AuditEvent]"
| project PreciseTimeStamp, Message, CloudName
```

## Step 10: Node Fault Recovery Result

```kql
cluster('Azurecm').database('azurecm').FaultHandlingRecoveryEventEtwTable
| where PreciseTimeStamp > datetime(start) and PreciseTimeStamp < datetime(end)
| where NodeId == '<nodeId>'
| where RecoveryAction == 'PowerCycle' and RecoveryResult == 'Successful'
| project PreciseTimeStamp, NodeId, RecoveryAction, RecoveryResult
| order by PreciseTimeStamp desc
| take 1
```
