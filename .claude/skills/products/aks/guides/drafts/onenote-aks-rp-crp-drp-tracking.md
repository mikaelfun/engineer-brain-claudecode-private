# [AKS] Track Request from AKS RP to CRP/DRP

**Source:** MCVKB/VM+SCIM/18.23  
**Type:** Diagnostic Guide  
**Product:** AKS (Mooncake)  
**Date:** 2021-07-15

## Overview

Step-by-step Kusto query chain to trace an AKS operation from the RP layer down to CRP (Compute Resource Provider) and DRP (Disk Resource Provider), useful when cluster create/upgrade fails with an unclear error.

## Kusto Query Chain

### Step 1 — Find Operation ID by Subscription + Resource Name

```kusto
-- Cluster: akscn.kusto.chinacloudapi.cn / DB: AKSprod
union
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp >= datetime(START) and PreciseTimeStamp <= datetime(END)
| where subscriptionID == "<sub-id>" and resourceName == "<cluster-name>"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project PreciseTimeStamp, correlationID, operationID, Count,
          operationName, suboperationName, result, resultSubCode, resultCode, errorDetails
```

### Step 2 — Get Detailed Error for an Operation

```kusto
-- DB: AKSprod
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where operationID == "<operation-id>"
| where level != "info"
| project PreciseTimeStamp, level, msg, fileName, lineNumber, operationID
```

> **Example error:** `vmextension.put.request: error: Future#WaitForCompletion: context deadline exceeded`  
> `AKSTeam: NodeProvisioning` — escalate to Node Provisioning team.

### Step 3 — Find VM Container ID (rdosmc / LogContainerSnapshot)

```kusto
-- Cluster: azurecm.chinanorth2.kusto.chinacloudapi.cn / DB: azurecm
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where subscriptionId == "<sub-id>" and roleInstanceName contains "<vm-name>"
| project TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName,
          availabilitySetName, updateDomain, subscriptionId, RoleInstance
| sort by TIMESTAMP asc nulls last
```

### Step 4 — Check Guest Agent Extension Events (rdosmc)

```kusto
-- Cluster: rdosmc.kusto.chinacloudapi.cn / DB: rdos
GuestAgentExtensionEvents
| where ContainerId == "<container-id>"
| where Operation !in ('HeartBeat', 'HttpErrors')
| project PreciseTimeStamp, ContainerId, Level, GAVersion, Version, Operation, Message, Duration
```

### Step 5 — AKS RP Outgoing Requests to CRP (OutgoingRequestTrace)

```kusto
-- DB: AKSprod
OutgoingRequestTrace
| where operationID == "<operation-id>"
| where targetURI contains "<extension-name>"
| project TIMESTAMP, correlationID, clientRequestID, operationID,
          msg, operationName, statusCode, level, Environment, targetURI
```
> Take `correlationID` from result → use in Step 6.

### Step 6 — CRP ApiQosEvent by Correlation ID

```kusto
-- Cluster: azcrpmc.kusto.chinacloudapi.cn / DB: crp_allmc
ApiQosEvent
| where correlationId == "<correlation-id>"
| where operationName !contains "GET"
| project resourceGroupName, resourceName, goalSeekingActivityId, operationId
```
> Take `goalSeekingActivityId` = `operationId` → use in Step 7.

### Step 7 — CRP ContextActivity Detail

```kusto
ContextActivity
| where activityId == "<goal-seeking-activity-id>"
```

## Additional Resources

- Node extension logs: `/var/log/` on agent node
- AKS RP source: `aks-rp/msi/vendor/.../engine/virtualmachinescalesets.go`
