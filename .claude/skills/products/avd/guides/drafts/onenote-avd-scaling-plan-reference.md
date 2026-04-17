# AVD Scaling Plan (Autoscale) Reference (OneNote)

## Key Concepts

- Scale up/down is only triggered by **connect/disconnect events**
- RBAC required: **Desktop Virtualization Power On Off Contributor** (vs StartOnConnect which only needs Power On Contributor)
- Workflow: RD → ARM → CRP

## Phases

| Phase | Behavior |
|-------|----------|
| Ramp-up + Peak | Used capacity > threshold → scale up |
| Ramp-down + Off-peak | Used capacity < threshold → scale down |

## Configuration Parameters

- `CapacityThresholdPercent`: Trigger threshold for scaling (e.g., 50%)
- `MinActiveSessionHostsPercent`: Minimum active hosts to keep (e.g., 20%)
- `LoadBalancingAlgorithm`: BreadthFirst or DepthFirst
- `RampDownForceLogoffUsers`: Whether to force logoff during ramp-down
- `StopHostsWhen`: ZeroSessions or ZeroActiveSessions
- `RampDownWaitTimeMinutes`: Wait time before deallocating
- `ScalingMethod`: PowerManage

## Kusto Diagnostics

```kql
RDOperation
| where TIMESTAMP >= datetime(YYYY-MM-DD HH:MM)
| where SessionHostPoolId == "<host-pool-id>"
| where host_Role == "RDScaling"
| project TIMESTAMP, Name, ActivityId, ResType, ResDesc, HostPoolArmPath = ArmPath, Props, AADTenantId
```

Key fields in Props:
- `ScalingReasonType`: e.g., "DeallocateVMs_BelowMinSessionThreshold"
- `ReasonText`: Human-readable scaling decision explanation
- `CurrentSessionOccupancyPercent`: Current load
- `ActiveSessionHostCount` / `TotalSessionHostCount`
- `Action.BeginDeallocateVmTryCount` / `BeganStartVmCount`: Scaling actions taken

## References

- Wiki: [Autoscale for Pooled Host Pools](https://supportability.visualstudio.com/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466077/Autoscale-for-Pooled-Host-Pools)
- Doc: [Autoscale scaling plans and example scenarios](https://learn.microsoft.com/en-us/azure/virtual-desktop/autoscale-scenarios)
