# Azure Arc Enabled Servers - Kusto Diagnostics Guide (Mooncake)

## Kusto Cluster

- **Endpoint**: `hcrpmc.chinaeast2.kusto.chinacloudapi.cn`
- **Permission SG**: `Arc enabled servers telemetry - Mooncake RO`

## Key Tables

### HCRPEvents
ARM-level resource lifecycle events for Arc-enabled servers.

```kql
HCRPEvents
| where SubscriptionId contains "<subscription-id>"
| where TIMESTAMP >= ago(1d)
// | where CorrelationId contains "<correlation-id>"
// | where RequestMethod != "GET"
| project PreciseTimeStamp, Event, ResourceName, ResourceLocation, OsName, OsVersion, VmId, VmUUId, ResourceType, ArmRequestId, ClientRequestId
```

Key events: `ResourceCreated`, `ResourceUpdatedViaDataPlane`

### HISEvents
Hybrid Identity Service events - agent status and connectivity.

```kql
HISEvents
| where ResourceId contains "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.HybridCompute/machines/<machine-name>"
| where PreciseTimeStamp >= ago(1d)
| project PreciseTimeStamp, LogLevel, Environment, Role, Location, CorrelationId, AgentStatus, AgentVersion, Event, MachineId
```

Key events: `CreatingResourceMetadataRecord`, `UpdatedCloudDataRequired`, `SendingNewAgentData`

### HISTraces
Detailed agent heartbeat messages with full JSON payload (agentData, osProfile, extension status, detected properties).

```kql
HISTraces
| where ResourceId contains "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.HybridCompute/machines/<machine-name>"
| where PreciseTimeStamp >= ago(1d)
```

Payload includes: agent status, OS info, VM UUID, agent configuration (proxy, extensions enabled, guest configuration), service statuses.

### NginxLog / NginxError
Raw ingress traffic logs for the HIS service. Useful for network-level troubleshooting.

## Troubleshooting Flow

1. Check `HCRPEvents` for ARM-level resource creation/update status
2. Check `HISEvents` for agent connectivity and heartbeat
3. Drill into `HISTraces` for detailed agent payload and configuration
4. Check `NginxLog`/`NginxError` for network-level issues
