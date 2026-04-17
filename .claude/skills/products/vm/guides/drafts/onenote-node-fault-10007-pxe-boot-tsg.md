# TSG: NodeFault 10007 PXE Boot Timeout

> Source: MCVKB 2.16 | Applies to: Mooncake & Global

## Overview

Node fault code 10007 (HealthFailureRecoveryFailed) means the physical node failed to boot up within the 30-minute timeout. This is a surface fault code from compute fabric; the true RCA requires checking datacenter manager tables.

**Scope**: Only applies to nodes that failed recovery and went into OFR (OutForRepair) status. Event17 caused by Xstore or network will NOT have CSI diagnostic information.

## Step 1: Confirm Node OFR Status

Check `LogNodeSnapshot` to confirm the node went to HumanInvestigate/OFR state with PXE boot timeout.

```kql
// Cluster: azurecm.chinanorth2.kusto.chinacloudapi.cn/azurecm
LogNodeSnapshot
| where TIMESTAMP > datetime(YYYY-MM-DD HH:MM) and TIMESTAMP < datetime(YYYY-MM-DD HH:MM)
| where nodeId == "<nodeId>"
| project PreciseTimeStamp, nodeState, nodeAvailabilityState, faultInfo, containerCount, aliveContainerCount
```

Look for:
- `nodeState: HumanInvestigate`, `nodeAvailabilityState: Faulted` or `OutForRepair`
- `FaultCode: 10007` in faultInfo JSON
- Messages like "Node moved to HI since the node went unhealthy after a reboot node recovery action" or "Failed to see PXE boot request within power-on timeout"

## Step 2: Check CSI Diagnostic Result

Query `DCMLMResourceResultEtwTable` using the nodeId as ResourceId to find the hardware RCA.

```kql
// Cluster: azurecm.chinanorth2.kusto.chinacloudapi.cn/azurecm
DCMLMResourceResultEtwTable
| where TIMESTAMP > ago(3d)
| where ResourceId == '<nodeId>'
| project TIMESTAMP, ResourceId, ResultType, FaultCode, FaultReason
```

Common hardware failures identified by CSI diagnostics:
- **Replace Drive(s)** - Disk failure (e.g., failed read/write IO test)
- **Replace DIMM(s)** - Memory ECC errors
- **Processor issues** - CPU-related faults

The `FaultReason` JSON contains detailed information including manufacturer, serial number, model, location, and diagnostic summary.

## Key Tables Reference

| Table | Cluster | Purpose |
|-------|---------|---------|
| LogNodeSnapshot | azurecm | Node state transitions |
| DCMLMResourceResultEtwTable | azurecm | CSI diagnostic results (hardware RCA) |
