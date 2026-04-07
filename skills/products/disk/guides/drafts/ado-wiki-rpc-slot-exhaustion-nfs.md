---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/RPC Slot Exhaustion - NFS"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FRPC%20Slot%20Exhaustion%20-%20NFS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# RPC Slot Exhaustion - NFS

From time to time, clusters will show high client facing latency that will match a rise in core filer latency. This can sometimes occur because of situation known as RPC slot exhaustion. This document will describe why RPC slot exhaustion can occur, how to troubleshoot it, and what you can do to resolve it.

## INTRODUCTION TO RPC QUEUES AND SLOTS

When an NFS client (Cluster Node) opens up a TCP connection with an NFS server (Core Filer), each side produces a queue that allows it hold a certain number of NFS operations that it wishes to send to the other side at any given time. For the Avere, this number is defaulted to 256 operations (slots) per TCP connection to the core filer, but it may actually be lower due to core filer limitations (16/32/64).

When we want to send information to the core filer, the appropriate NFS operations are loaded into the send queue and, as soon as the core filer says it is ok to send, we begin to empty the queue in FIFO (first-in/first-out) order until all the operations have cleared. This repeats as new operations come in, with the oldest being sent first, draining the operations in the queue until it is empty again.

In normal cases, these NFS commands are sent very quickly to the core filer (microseconds or milliseconds) but if there is a delay somewhere, this can cause the operations to start backing up in the queue. If the operations back up too much, we fill up all of the slots in the RPC queue and this causes what is known as RPC slot exhaustion.

## TROUBLESHOOTING

If you think client facing latency may be related to RPC slot exhaustion, the first, and only real place, that you want to look at is stats. Make sure that you have the timeframe for when the latency is high and, using either latency_analyzer.py or diff_all_stats.py, look at the nfs_back_proc statistics to see if the cluster is experiencing RPC slot exhaustion.

### Key Stats to Check

**recv.timerExpire**: If that value is above zero, the problem is NOT RPC slot exhaustion — it's a situation where NFS calls are not being responded to properly by the core filer, causing them to go past the cluster.NfsBackEndTimeout (55s or larger). A packet capture may help in this case.

**req.hunt and req.asyncappend**: These stats tell you that requests can't be placed in the queues because they are full and we are waiting some time (req.hunt) to put them in. If these numbers are significant, then there is RPC slot exhaustion.

**cwndlimit (command window limit)**: When incremented, lets you know that the cluster has had an instance where the RPC queues have filled. This alone is sufficient to confirm RPC slot exhaustion, but follow up with asyncappend, hunt, and noxid as well.

### Example nfs_back_proc Output

```
by Mass       Time (unit)    Calls (unit)        %Time       %Calls   Avg Time/Call Max Time(>500ms)
----------  --------------- ---------------  ------------ ------------ --------------- ---------------
mass11          162.6 min          11.1 m        38.80        54.31         882.8  us          1-2s
mass2           256.5 min           9.3 m        61.20        45.69           1.7  ms          1-2  s

RPC Slot Exhaustion Stats (note: % async = asyncappend/(asyncappend+sync)
req.sync        req.hunt       req.noxid req.asyncappend         % async recv.timerExpire
----------  ---------------  --------------- --------------- --------------- ---------------
mass11           11037520          289110            1092          148090            1.30              0
mass2             9273607          605354            1074          260600            2.81              0
```

## RESOLUTION

**IMPORTANT:** Before increasing TCP connections, verify:
1. Core filer utilization is below 80% — if higher, consider load redistribution first
2. No network congestion — run 100-packet ping, traceroute, iperf between Avere and core filer
3. Talk to Escalation or Management before applying custom settings

### Method 1: Increase the Connection Multiplier (Preferred)

Custom setting: `massX.nfsConnMult`

- Default value: 4
- First recommended increase: 8 (doubles TCP connections)
- Maximum value: 23 (typically don't go above 16)
- After applying, cluster begins increasing TCP connections as needed; latency should fall after a short time
- Verify fix with new Support Bundle

### Method 2: Increase the Number of Cluster IPs

If connection multiplier is near maximum or not practical:
- Increase cluster IPs and IPs per node to create additional TCP connections
- Consider reducing massX.nfsConnMult when adding IPs (unless already at default)
- This is a bigger change — each new IP opens connections equal to nfsConnMult value
- Let cluster run, then collect Support Bundle to verify
