---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Avere vFXT Quick Reference Sheet"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FAvere%20vFXT%20Quick%20Reference%20Sheet"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Avere vFXT Quick Reference Sheet

**Avere vFXT Clusters**

> **What it is:** A caching layer that sits between **NFS clients** and **core filers** (e.g., NFS servers, sometimes Blob) to accelerate access. Performance and behavior depend on **policy** and **namespace** configuration.

## 1) Foundations

* **Core Filer** = the backend storage the cluster talks to.
* **Namespace/Exports** = the client-visible paths served by the cluster (e.g., `/data/project/subdir1`).
* **Policies** govern data handling: **readonly**, **readwrite**, **writeback**, **full caching**, **bypass**.
* **Healthy latency rule**: once warm, **client-facing latency < core filer latency**.
* **Dashboards lag** ~**5 minutes**; **stats** are typically aggregated in **10-minute windows**.

## 2) Access & Data Flow

* **On cluster**: logs and bundles land under `support/`, `GSI/`.
* **Upload server**: bundles are uploaded automatically.
* **Two access methods**:
  * **Edge Jump (recommended)**: SSH to the edge jump, then `connect` to the target cluster's debug host.
  * **Debug Host (single cluster)**: analysis sandbox tied to one cluster.

## 3) Monitoring & Analysis Tools

* **Statsviewer / Remote Dashboard**: ops/s, latency, throughput, conditions (active) and alerts (historical).
* **Latency Analyzer**: shows where time accrues by layer (e.g., NFS back, mount back) and avg time/call.
* **GSI / Support Bundle**: authoritative logs+stats snapshot for targeted windows.

## 4) Caching Policies

* **ReadOnly**: serves reads; writes denied — write attempts cause permission errors or backpressure.
* **ReadWrite / WriteThrough / WriteBack**: writes accepted; writeback flushes to core filer on a timer.
* **Full Caching**: high locality (esp. for blob-backed workflows).
* **Clients Bypass Cluster**: new writes go direct to core filer; cache periodically verifies backend changes (~30s sweeps).

> **Rule of thumb:** Caches shine with ~**80% read / 20% write** workloads. **Write-heavy + readonly** = **slot exhaustion**, **recycling**, **high latency**.

## 5) Zero-to-Triage: Step-by-Step

1. **Check dashboard**: Are there conditions right now? Note cache fullness & throughput trends. (Remember 5min lag.)
2. **Latency analyzer**: Compare bad vs baseline windows — identify hot layers (often NFS back, mount back) and operations (read/write/getattr).
3. **First-touch vs warm-cache**: Initial reads fetch from core filer → latency spike. Subsequent reads should drop significantly.
4. **Cache state**: If cache is full, expect recycling by space, which raises latency.
5. **Confirm with GSI/logs**: Correlate with the same UTC windows.

## 6) NFS & Network Checks (Core Filer path)

```bash
# Reachability & ports
ping <core_filer_ip_or_host>
nc -vz <core_filer_ip_or_host> <port>

# RPC/NFS services and ports
rpcinfo -p <server>

# NFS statistics (client/server)
nfsstat -c
nfsstat -s
```

* Validate /etc/exports (client lists/options, root squash), UID/GID mapping, and directory permissions.

## 7) Namespaces & Test Traffic

* Export the parent directory; create readable namespace paths for subdirs.
* Trigger measurable I/O: `cp -r /path/source /path/cache_mount`
* Graphs reflect movement after ~5 minutes (dashboard lag).

## 8) Node Lifecycle (Add/Remove/Reboot)

* **Add node**: Install → set initial password → configure network → join cluster.
* **Remove node**: Node is wiped/reset; cluster rebalances IPs across remaining nodes.
* **Reboots**:
  * **HA-mode**: orchestrated, minimal disruption, slower overall.
  * **Simultaneous**: faster, brief global disruption — use a maintenance window.
* **Long-running revocations**: Restart services on the node that first raised the condition.
* **Swap & uptime**: Very long uptimes can lead to swap pressure — plan reboots as hygiene.

## 9) Command Primer

```bash
cluster exec.py uptime
node ssh.py <node_name>
node status
netstat -an | grep <port>
iperf -s
iperf -c <server_ip> -t 30 -P 4
date
```

## 10) Checklist

- [ ] Host & cluster clocks are UTC; windows align to 10-minute buckets
- [ ] Policy matches workload (no write-heavy on readonly)
- [ ] Warm-cache reads are much faster than first-touch
- [ ] Client vs core filer latency compared and understood
- [ ] Exports, root squash, UID/GID mapping verified; rpcinfo lists required services
- [ ] Recent GSI pulled; leader node identified; dashboards interpreted with 5min lag in mind
