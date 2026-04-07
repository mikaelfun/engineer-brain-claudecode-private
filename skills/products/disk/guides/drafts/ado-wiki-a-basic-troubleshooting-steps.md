---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Basic Troobleshooting steps"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FBasic%20Troobleshooting%20steps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Basic Troubleshooting Steps — Avere FXT / vFXT

See also: [Top Customer Scenarios in DfM] | [Main Links]

---

## 1. Identify Cluster & Check Status

- Get the cluster's name
- Check it in **StatsViewer** to look for active conditions, alerts, or indications of failures
- Key insight: As long as Client-facing latency remains lower than Core-filer latency, the cluster is doing its job
- Check tabs: **Stats**, **Events**, **GSI**

## 2. Review Configuration, Stats & Events

Check:
- Cache / caching model
- Uptime of the cluster / nodes
- OS version
- Core filer(s)
- Junctions / exports
- Current usage statistics and event logs

## 3. Use the AutoCheck Dashboard

Highlights various `check_names` in the latest GSI that may affect the cluster.

Access: https://portal.microsoftgeneva.com/s/EFFE8D88

Filters available: Cluster, Version, Region, Time window, Result status (Fail/Warn/Pass)

## 4. Request a New GSI (if needed)

- If remote GSI option is enabled, run from StatsViewer
- Otherwise, request from customer
- Remote command endpoint: `https://aka.ms/SPSRemoteCommand?cluster=<clustername>`
- In remote command UI, select:
  - Type: `support.execute` / `NormalMode`
  - Scope: cluster
  - Command: support bundle (GSI + current stats)
  - Or XML-RPC commands

## 5. Create a Debug Environment

- Requires AME account and corporate machine
- Use internal teams/channels to move setup file to SAW machine
- Debug environment URL: https://production-averedebugenvironment.azurewebsites.net/

## 6. Download Logs and Run High-Level Analysis

- Ensure you are in the `/sps` directory
- Fetch the latest logs

## 7. Inspect the `messages` File

Look for events, conditions, disconnections, raised alerts.

File path pattern:
```
/sps/cluster/<clustername>/<nodename>/support/gsi/log/messages
```

Example command to search for raised alerts:
```
bzcat /sps/*/support/gsi/2020-07-0*/log/mess* | egrep "Raised Alert" | sort | uniq
```

## 8. Gather & Analyze Stats for Latency / Cluster Health

- Locate the **leader node** (holds cluster-level stats)
- Use `latency_analyzer.py`:
```
latency_analyzer.py node0/support/gsi/stats_2022-12-04T01:01:00+00:00/statsclient.cluster_2022-12-03T0{6:50,7:00}* | less
```
- Examine: Client access, Back-end throughput, NFS front & back latencies, RPC usage / slot exhaustion

---

## Common Issues / Special Checks

### RPC Slot Exhaustion (NFS)
If RPC slots are exhausted, NFS operations may bottleneck.
See: https://eng.ms/docs/.../azure-avere-fxt-edge-filer-tsg/troubleshooting-procedures/rpc-slot-exhaustion-nfs

### Stuck Revokes
Revokes (cache invalidations) that don't complete can cause stale or inconsistent behavior.
See "Stuck Revokes Cookbook": https://eng.ms/docs/.../stuck-revokes-cookbook

### High Swap / Memory Pressure
Swap usage is normal, but heavy use (especially for `armada_main` or `smbd`) is problematic.

Example error when swap is exhausted:
```
Sep 19 10:31:39 node2 kernel: swap_pager_getswapspace(17): failed
```
If critical processes are constantly paged in/out, performance will degrade.
