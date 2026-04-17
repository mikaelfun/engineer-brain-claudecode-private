# Disk Avere vFXT & HPC Cache — 综合排查指南

**条目数**: 9 | **草稿融合数**: 13 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-avere-cli-cmdlets.md, ado-wiki-a-avere-fxt-vfxt-main-links.md, ado-wiki-a-avere-hpc-cache-restart-services.md, ado-wiki-a-avere-scoping-general.md, ado-wiki-a-avere-scoping-performance.md, ado-wiki-a-avere-scoping-system-failure.md, ado-wiki-a-avere-top-customer-scenarios-dfm.md, ado-wiki-a-basic-connectivity-testing.md, ado-wiki-a-basic-troubleshooting-steps.md, ado-wiki-a-hpc-quick-reference-sheet.md, ado-wiki-avere-vfxt-quick-reference-sheet.md, ado-wiki-rpc-slot-exhaustion-nfs.md, ado-wiki-how-to-get-logs-and-packet-captures.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Avere vFXT/FXT — CLI Command Reference
> 来源: ADO Wiki (ado-wiki-a-avere-cli-cmdlets.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Avere CLI cmdlets"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Troubleshooting/Avere%20CLI%20cmdlets"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Quick reference for CLI commands used when diagnosing and managing Avere clusters via debug host or edge jump.
6. | Command | Function / Comments |
7. |---------|---------------------|
8. | `ping -S <client_facing_IP> <Host_IP>` | Test connectivity from cluster-facing IP |
9. | `averecmd cluster.createProxyConfig myProxyName '{"url":"http://127.0.0.1"}'` | Enter proxy configuration |
10. | `nodestatus.py` | Check nodes — connects to other nodes via SSH |

### Phase 2: Avere FXT and vFXT — Main Links
> 来源: ADO Wiki (ado-wiki-a-avere-fxt-vfxt-main-links.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Main Links"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Main%20Links"
3. importDate: "2026-04-05"
4. - **Remote Dashboard for FXT and vFXT** (StatsViewer): https://averestatsviewer.azurewebsites.net/
5. - **Remote Dashboard for HPC Cache** (Virtual Dashboard): https://portal.microsoftgeneva.com/dashboard/AZSCmdmprod/HPC%20Cache%20Virtual%20Dashboard?overrides=...
6. - **AutoCheck for HPC vFXT and FXT** (AC): https://portal.microsoftgeneva.com/dashboard/AvereTelemetryProd/AC?overrides=...
7. - **Legacy Documentation**: https://azure.github.io/Avere/
8. - **Azure FXT Edge Filer documentation**: https://learn.microsoft.com/en-us/previous-versions/azure/fxt-edge-filer/
9. - **Avere vFXT for Azure documentation**: https://learn.microsoft.com/en-us/azure/avere-vfxt/
10. - **Avere OS Release Notes**: https://azure.github.io/Avere/#release_notes

### Phase 3: Restart Services
> 来源: ADO Wiki (ado-wiki-a-avere-hpc-cache-restart-services.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Restart Services"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Restart%20Services"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. *It needs SAW and AME account*
6. [Geneva](https://aka.ms/GenevaActions)
7. The **Restart Services** operation allows authorized users to restart services on specific nodes or the entire HPC cache using a Geneva Action. The restart of services is similar to the same function on an FXT or vFXT cluster and will take several mi
8. As Restart Services is a read/write action, a valid Access Token for the specified Endpoint is required.
9. The following parameters are required:
10. **Environment Parameter**

### Phase 4: Avere vFXT/FXT — Scoping Questions: General
> 来源: ADO Wiki (ado-wiki-a-avere-scoping-general.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Scoping questions | General"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Scoping%20questions%20%7C%20General"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Use these questions at the start of any Avere FXT or vFXT support case to establish baseline context.

### Phase 5: Avere vFXT/FXT — Scoping Questions: Performance Issues
> 来源: ADO Wiki (ado-wiki-a-avere-scoping-performance.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Scoping questions | Performance"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Scoping%20questions%20%7C%20Performance"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Use these questions when a customer reports slow I/O, high latency, or throughput degradation on their Avere cluster.
6. - Upload a Support Bundle via Remote Commands or have the customer upload a Support Bundle.
7. - Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#general-information-upload
8. - **Write-heavy + read-only policy** → expect slot exhaustion and high latency (cache policy mismatch)
9. - **Single-threaded / single-client** → workload may not saturate cache; check client-side bottleneck
10. - **Caches work best with ~80% read / 20% write ratio**

### Phase 6: Avere vFXT/FXT — Scoping Questions: System Failure
> 来源: ADO Wiki (ado-wiki-a-avere-scoping-system-failure.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Scoping questions | System Failure"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Scoping%20questions%20%7C%20System%20Failure"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Use these questions when a customer reports a node failure, cluster outage, service crash, or repeated service restarts.
6. - Upload a Support Bundle via Remote Commands or have the customer upload a Support Bundle.
7. Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#general-information-upload
8. - Upload any core filer dumps if present.
9. Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#core-dump-management
10. - Repeating service restarts on a single node → likely a node-specific issue; restart services on the affected node

### Phase 7: Top Customer Scenarios That Prompt Support Cases in DfM
> 来源: ADO Wiki (ado-wiki-a-avere-top-customer-scenarios-dfm.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Top Customer Scenarios That Prompt Support Cases in DfM"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FTop%20Customer%20Scenarios%20That%20Prompt%20Support%20Cases%20in%20DfM"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Below are common scenarios where customers typically open support cases for Avere FXT / vFXT or related cache-services:
6. 1. **Initial configuration issues**
7. Setting up the cache cluster, initial settings, or bootstrapping steps that fail.
8. 2. **Problems creating or building the cache**
9. Failures during cache construction, initialization, or cache validation.
10. 3. **Problems adding storage targets**

### Phase 8: Basic Connectivity Testing
> 来源: ADO Wiki (ado-wiki-a-basic-connectivity-testing.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Basic Connectivity Testing"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FBasic%20Connectivity%20Testing"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. From time to time, there will be a need to test IPs or services for connectivity. There are a few easy connectivity tests that customers can run from clients or the Azure Portal to test their network connectivity and to insure that services can be se
6. If the customer has access to a node or a client, you can run the following commands to test connectivity to an IP or TCP/UDP port. The tests vary slightly depending on which OS a client is using.
7. **UNIX IP CONNECTIVITY TESTING (PING)**
8. To test connectivity to an IP, use the ping command:
9. To ping from a specific source IP:
10. ping -c 10 -S <srcIP> <dstIP>

### Phase 9: Basic Troubleshooting Steps — Avere FXT / vFXT
> 来源: ADO Wiki (ado-wiki-a-basic-troubleshooting-steps.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Basic Troobleshooting steps"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FBasic%20Troobleshooting%20steps"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. See also: [Top Customer Scenarios in DfM] | [Main Links]
6. - Get the cluster's name
7. - Check it in **StatsViewer** to look for active conditions, alerts, or indications of failures
8. - Key insight: As long as Client-facing latency remains lower than Core-filer latency, the cluster is doing its job
9. - Check tabs: **Stats**, **Events**, **GSI**
10. - Cache / caching model

### Phase 10: Azure HPC Cache — Quick Reference Sheet
> 来源: ADO Wiki (ado-wiki-a-hpc-quick-reference-sheet.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/HPC Quick Reference Sheet"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FHPC%20Quick%20Reference%20Sheet"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. - **Throughput immutability**: SKU/throughput chosen at creation **cannot be changed** later
6. - **Identifiers you always need**: Subscription ID, Region, Resource Group, Cache Name
7. - **Virtual Dashboard**: latency (frontend vs storage target), throughput, operations
8. - **A/C Dashboard**: health checks & error details with remediation **playbooks**
9. - **Conditions** = active issues now; **Alerts** = historical events (already resolved)
10. - Time sanity: `date` — ensure host and cache-side context are UTC-aligned

### Phase 11: Avere vFXT Quick Reference Sheet
> 来源: ADO Wiki (ado-wiki-avere-vfxt-quick-reference-sheet.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Avere vFXT Quick Reference Sheet"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FAvere%20vFXT%20Quick%20Reference%20Sheet"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. **Avere vFXT Clusters**
6. * **Core Filer** = the backend storage the cluster talks to.
7. * **Namespace/Exports** = the client-visible paths served by the cluster (e.g., `/data/project/subdir1`).
8. * **Policies** govern data handling: **readonly**, **readwrite**, **writeback**, **full caching**, **bypass**.
9. * **Healthy latency rule**: once warm, **client-facing latency < core filer latency**.
10. * **Dashboards lag** ~**5 minutes**; **stats** are typically aggregated in **10-minute windows**.

### Phase 12: RPC Slot Exhaustion - NFS
> 来源: ADO Wiki (ado-wiki-rpc-slot-exhaustion-nfs.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/RPC Slot Exhaustion - NFS"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FRPC%20Slot%20Exhaustion%20-%20NFS"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. From time to time, clusters will show high client facing latency that will match a rise in core filer latency. This can sometimes occur because of situation known as RPC slot exhaustion. This document will describe why RPC slot exhaustion can occur, 
6. When an NFS client (Cluster Node) opens up a TCP connection with an NFS server (Core Filer), each side produces a queue that allows it hold a certain number of NFS operations that it wishes to send to the other side at any given time. For the Avere, 
7. When we want to send information to the core filer, the appropriate NFS operations are loaded into the send queue and, as soon as the core filer says it is ok to send, we begin to empty the queue in FIFO (first-in/first-out) order until all the opera
8. In normal cases, these NFS commands are sent very quickly to the core filer (microseconds or milliseconds) but if there is a delay somewhere, this can cause the operations to start backing up in the queue. If the operations back up too much, we fill 
9. If you think client facing latency may be related to RPC slot exhaustion, the first, and only real place, that you want to look at is stats. Make sure that you have the timeframe for when the latency is high and, using either latency_analyzer.py or d
10. **recv.timerExpire**: If that value is above zero, the problem is NOT RPC slot exhaustion — it's a situation where NFS calls are not being responded to properly by the core filer, causing them to go past the cluster.NfsBackEndTimeout (55s or larger).

### Phase 13: How to Collect Logs
> 来源: ADO Wiki (ado-wiki-how-to-get-logs-and-packet-captures.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/How to get Logs and packet captures"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FHow%20to%20get%20Logs%20and%20packet%20captures"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. The General Information Upload section to send system information about the node or cluster to Avere Global Services.
6. Note: The manual uploads available from this page supplement the automatic nightly uploads that you can configure on the [Cluster > Support](https://azure.github.io/Avere/legacy/ops_guide/4_7/html/gui_support.html#gui-support-settings) settings page.
7. 1. Choose the type of information to upload with the Choose gather mode selector. Options are described in detail [below](https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#support-gather-mode).
8. 2. Optional: Type a note for the upload in the Comment text field.
9. 3. Click the Upload information button.
10. A Packet Capture (pcap) is a form of data collection that can help us determine many different networking issues. A packet capture allows us to determine the root cause of many different problems involving security settings, permissions, connectivity

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | High client-facing latency on Avere vFXT with RPC slot exhaustion; req.hunt and req.asyncappend stats incrementing signi | NFS RPC queue slots (default 256 per TCP connection) fully consumed due to delays between cluster no | Increase TCP connection multiplier (massX.nfsConnMult custom setting) from default 4 to 8 (max 23, typically ≤16); alter | 🟢 8.5 | [ADO Wiki] |
| 2 | Avere vFXT high latency with recv.timerExpire counter incrementing (non-zero), often misdiagnosed as RPC slot exhaustion | Core filer not responding to NFS operations within NfsBackEndTimeout (55s+); this is NOT RPC slot ex | Collect packet capture between cluster and core filer for analysis; investigate core filer health and network path; do N | 🟢 8.5 | [ADO Wiki] |
| 3 | Azure HPC Cache throughput cannot be changed after creation; customer needs more performance but cannot scale up or add  | HPC Cache throughput/SKU is fixed at creation and cannot be scaled up or out by adding nodes, unlike | Destroy and recreate the HPC Cache with a larger throughput configuration/SKU; plan capacity requirements before initial | 🟢 8.5 | [ADO Wiki] |
| 4 | Write-heavy workload with ReadOnly cache policy causes NFS slot exhaustion, cache recycling, and high client-facing late | Cache policy set to ReadOnly while workload is write-heavy (>20% writes); write attempts cause permi | Change cache policy to ReadWrite or WriteBack to match the workload pattern; ReadOnly is designed for ~80% read / 20% wr | 🟢 8.0 | [ADO Wiki] |
| 5 | Avere vFXT cache full with increased latency and 'recycling by space' visible on dashboard | Cache storage capacity exceeded, triggering cache eviction (recycling by space) which competes with  | Monitor cache fullness via dashboard; add vFXT nodes to expand capacity, or adjust caching policy to reduce cache footpr | 🟢 8.0 | [ADO Wiki] |
| 6 | Long-running revocations and stuck NFS operations on Avere vFXT node; conditions remain active on dashboard | NFS operations stuck due to stale locks or revocations not clearing on a specific node | Restart services on the node that first raised the condition to release stuck ops; use 'averecmd support.executeNormalMo | 🟢 8.0 | [ADO Wiki] |
| 7 | Swap pressure and performance degradation on Avere vFXT nodes with very long uptime | Very long node uptime leads to accumulated swap usage and memory fragmentation drift | Plan periodic node reboots as maintenance hygiene; use HA-mode reboot for minimal disruption or simultaneous reboot in m | 🟢 8.0 | [ADO Wiki] |
| 8 | Azure HPC Cache queued requests, stuck operations, and latency spikes with all request slots consumed | Slot exhaustion — all NFS request slots fully consumed, causing operations to queue and back up | Align caching policy to workload, smooth client concurrency, cautiously increase slots only if backend and network can h | 🟢 8.0 | [ADO Wiki] |
| 9 | Azure HPC Cache elevated frontend latency caused by slow backend storage target | Backend storage target (core filer) slowdowns propagate as elevated frontend (client-facing) latency | Compare frontend vs storage target latency on Virtual Dashboard; investigate backend storage health, network path, and c | 🟢 8.0 | [ADO Wiki] |
