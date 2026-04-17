# VMSS Kusto Queries Reference

> Source: OneNote MCVKB 2.28 | Draft - pending SYNTHESIZE review

## Required Clusters
- **ARMProd** - ARM operation logs
- **Azcrp** - CRP activity and QoS events
- **Azcsup** - Scaling history
- **Azurecm** - Cluster management, UD walk
- **Azureinsights** - Autoscale triggers

Access: https://aka.ms/kustosupport

## ARMProd - EventServiceEntries
Track what was sent through ARM for operations:
```kql
cluster('ARMProd').database('ARMProd').EventServiceEntries
| where subscriptionId == "{subscriptionId}"
| where PreciseTimeStamp >= datetime(YYYY-MM-DD) and PreciseTimeStamp <= datetime(now)
| where resourceUri contains '{vmssName}'
| where authorization !contains 'checkPolicyCompliance'
```

## Azcrp - ContextActivity
Detailed CRP logs (same as MDM links in VMSS Events):
```kql
cluster('Azcrp').database('crp_allprod').ContextActivity
| where subscriptionId contains '{subscriptionId}'
| where activityId contains '{serviceRequestId}'
| where PreciseTimeStamp >= datetime(YYYY-MM-DD HH:MM:SS) and PreciseTimeStamp <= datetime(YYYY-MM-DD HH:MM:SS)
```

## Azcrp - ApiQosEvents
```kql
cluster('Azcrp').database('crp_allprod').ApiQosEvent
| where subscriptionId contains '{subscriptionId}'
| where operationId contains '{serviceRequestId}'
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
```

## Azcsup - Scaling History
```kql
cluster('Azcsup').database('azcsup').GetScaleSetScalingHistoryFromContextActivity(
    'subscriptionId', 'resourceGroup', 'vmssName',
    datetime(startTime), datetime(endTime))
```

## Azurecm - Tenant Change Profiling
Useful for Service Fabric UDWalkBlock scenarios:
```kql
cluster('Azurecm').database('AzureCM').TMMgmtTenantChangeProfilingEventEtwTable
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| where TenantName contains "{tenantId}"
| project PreciseTimeStamp, CurrentUD, ChangeEventType, FromState, ToState, RoleName, RoleInstanceName, NodeId, ContainerId, Region
```
Look for UDWalkBlock -> customer must unblock MR for operation to proceed.

## Azureinsights - Autoscale Triggers
```kql
cluster('azureinsights').database('Insights').JobTraces
| where jobPartition contains '{subscriptionId}'
| where jobId contains 'AUTOSCALE'
| where message contains 'triggered'
| where message contains '{vmssName}'
| where PreciseTimeStamp >= datetime(start) and PreciseTimeStamp <= datetime(end)
| project PreciseTimeStamp, message
```

## VMSS Scale Operation Tracking
```kql
let querySubscriptionId = "{subscriptionId}";
let queryResourceGroupName = "{resourceGroupName}";
cluster('azcrp').database('crp_allprod').ApiQosEvent_nonGet
| where PreciseTimeStamp > datetime(start) and PreciseTimeStamp < datetime(end)
| where subscriptionId == querySubscriptionId
| where resourceGroupName has queryResourceGroupName
| join (
    cluster('azcrp').database('crp_allprod').VmssQoSEvent
    | where PreciseTimeStamp > datetime(start) and PreciseTimeStamp < datetime(end)
    | where subscriptionId == querySubscriptionId
    | where resourceGroupName has queryResourceGroupName
) on $left.operationId == $right.operationId
| distinct PreciseTimeStamp, resourceName, operationName, targetInstanceCount, vMCountDelta, userAgent, correlationId, operationId, clientPrincipalName, errorDetails, resourceGroupName, resultCode, e2EDurationInMilliseconds, durationInMilliseconds, httpStatusCode, region, clientApplicationId, subscriptionId, requestEntity
```
