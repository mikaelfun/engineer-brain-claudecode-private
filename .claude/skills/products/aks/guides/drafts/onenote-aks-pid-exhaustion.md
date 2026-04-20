# [AKS] Node NotReady / Pods Evicted due to PID Exhaustion

**Source:** MCVKB/VM+SCIM/18.24  
**Type:** Known Issue  
**ID:** aks-onenote-014  
**Product:** AKS (Mooncake)  
**Date:** 2021-08-27

## Symptom

- AKS node goes **NotReady** (auto-remediated by Remediator)
- All service pods are **Evicted**
- `syslog` / `messages` shows:
  - `fork/exec /usr/bin/nice: resource temporarily unavailable`
  - `containerd: pthread_create failed: Resource temporarily unavailable`
  - `containerd: SIGABRT`
- kubelet cannot run helper commands (`du`, `nice`)

## Root Cause

**PID table exhausted.** Default `pid_max = 32768`. When a runaway application leaks threads or spawns excessive child processes, the PID table fills up. Once full, no new processes can be created — containerd crashes, kubelet fails to run subprocesses, causing node to go NotReady and pods to be evicted.

> ⚠️ **Do NOT blindly increase `pid_max`** — that masks the real issue.

## Troubleshooting

### 1. Check Kusto for Cluster Status

```kusto
-- akscn.kusto.chinacloudapi.cn / AKSprod
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where subscriptionID == "<sub-id>"
| where clusterName contains "<cluster-name>"
| where state != "Healthy"
| project ccpNamespace, fqdn, PreciseTimeStamp, state, reason, podsState, resourceState, msg
```

### 2. Check Remediator

```kusto
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').RemediatorEvent
| where ccpNamespace contains "<ccp-namespace>"
| project PreciseTimeStamp, reason, msg, correlationID
```

### 3. Inspect Node Logs

```bash
# On the affected node:
cat /var/log/messages | grep "resource temporarily unavailable"
cat /var/log/syslog | grep "pthread_create"

# Check current PID usage
cat /proc/sys/kernel/pid_max   # default: 32768
ps aux | wc -l

# Find process with most threads
ps -eLf | awk '{print $2}' | sort | uniq -c | sort -rn | head
```

### 4. Monitor PID with Prometheus

Use Prometheus `process_open_fds` or node exporter `node_processes_threads` metrics to track PID growth.

## Solution

1. **Identify** the offending workload (most threads/processes by namespace)
2. **Fix the application** — find the thread leak and patch it
3. **Deploy monitoring** — Prometheus alert when PID > 20000
4. AKS Remediator handles node recovery automatically; focus on preventing recurrence

## References

- https://kubernetes.io/docs/concepts/policy/pid-limiting/
- https://access.redhat.com/solutions/22105
