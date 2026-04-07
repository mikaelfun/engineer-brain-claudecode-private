# TSG DeviceServiceSLA — Incident Response Guide

> Source: OneNote — Mooncake POD Support Notebook / Intune / ## MISC / TSG DeviceServiceSLA.md
> Quality: draft (from onenote-extract)

## Overview

DeviceService has ~70 clients; prolonged unhealthiness impacts multiple scenarios. **Prioritize mitigation over RCA.**

## Step 1: Assess Customer Impact

1. Get scale unit name + approximate start time
2. Check dashboard: [Intune Core Scenarios: CheckIn, Compliance, Enrollment](https://jarvis-west.dc.ad.msft.net/dashboard/share/18B65152)
3. Look for large SLA dips → if below Sev 2 threshold, raise to Sev 2
4. Check Device Service [ServiceView dashboard](https://jarvis-west.dc.ad.msft.net/dashboard/IntuneCore/DevicesAndSideCar/Infra/ServiceView) to determine if cause is StatelessDeviceService, StatefulDeviceService, or another service

## Step 2: Determine Root Cause & Perform Mitigations

### General Investigation
- Look at failure types:
  - **Timeouts (503, 499)** — usually DeviceService-related, but don't rule out slow upstream services
  - Check if total request count spiked (from 1 service or many? across many scenarios or just one?)
  - Check if failures on a single node → could be bad node infra, noisy neighbor, memory/CPU/lock contention

### Dashboards
| Dashboard | Purpose |
|-----------|---------|
| ServiceView | Start here — overall service health |
| InstanceView | Single node/instance drill-down |
| ThrottleView | Any scenarios being throttled |
| ScenarioView | Per-scenario failures |
| BackgroundTaskView | BGTask run rates and times |
| LazyWriterDeepDive | Lazy writer backups to Azure storage |
| DeviceServiceOverview | Uber dashboard with Kusto queries (limit to 3hr window when lookback >3d) |

### General Mitigation — Restart Affected Instance

> **WARNING**: Only safe when replica count >= 4 (1 Primary + 3 ActiveSecondaries)
> - 1P + 3AS → restart drops to 1P + 2AS (matches minimum) — OK
> - 1P + 2AS → restart drops to 1P + 1AS → **READONLY mode** — UNSAFE
> - If < 1P + 3AS, consult FSI OCE or ICD OCE

Procedure: [Restart Deployed CodePackage](https://www.intunewiki.com/wiki/Restart_Deployed_CodePackage)

### Memory Dumps
- Use [Node Diagnostics](https://www.intunewiki.com/wiki/Dump_Analysis)
- If fails, collect manually: [Manual Dump Collection](https://www.intunewiki.com/wiki/Dump_Analysis#Collecting_Dumps_Manually)

## DeviceService Event Publishers

| Publisher | Impact if Down |
|-----------|---------------|
| KustoDeviceEntityFastStream | Newly enrolled devices not visible in UI; device updates not reflected |
| KustoDeviceEntityHardDeleteFastStream | GDPR hard-delete reporting delayed |
| KustoDeviceScopeTagFastStream | Default scope tag missing; only tenant admins see new devices |
| DeviceUpdated | User/UDA, OAuth, Device Scope tag updates delayed |
| DeviceUpdates4Compliance | Compliance updates delayed on device lifecycle changes |
| DeviceDRMDelta | Grouping and Targeting workload impacted |

## Alert: Publisher Zero Load

If alert fires (publisher has not published in 60 minutes):
1. Check if publisher is failing to publish (reflected in dashboard)
2. Initialization failures may not show in dashboards → check Kusto queries
