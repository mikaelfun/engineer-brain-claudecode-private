# AKS 节点 NotReady -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 2 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-Managed-Prometheus.md, mslearn-node-not-ready-basic-troubleshooting.md
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: Node available memory fell below kubelet hard evic

### aks-477: AKS node goes NotReady with MemoryPressure=True; pods enter Terminating state (n...

**Root Cause**: Node available memory fell below kubelet hard eviction threshold (default 100Mi). Kubelet evicts pods by QoS class priority to reclaim memory.

**Solution**:
Set proper memory requests to prevent overcommit on nodes. Scale horizontally (more nodes) or vertically (larger VM SKU). Check kubelet eviction-hard flag for threshold value.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s)]`

## Phase 2: Since Jan 3 2023, AKS expanded auto-stop: clusters

### aks-126: AKS cluster unexpectedly stopped; cluster with 0 Ready nodes or all NotReady aut...

**Root Cause**: Since Jan 3 2023, AKS expanded auto-stop: clusters with 0 Ready nodes, all NotReady, or 0 running VMs auto-stopped after 30 days

**Solution**:
Run az aks start to restart. Avoid leaving clusters with all nodes stopped/NotReady >30 days

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: PID/thread exhaustion on node - application spawns

### aks-1097: Node NotReady with pthread_create failed: Resource temporarily unavailable in sy...

**Root Cause**: PID/thread exhaustion on node - application spawns too many threads exceeding default PID limit (32768). kubelet and containerd fail to allocate new threads

**Solution**:
Identify offending app consuming excessive PIDs; monitor thread count per cgroup; configure --pod-max-pids in kubelet; consider PID-based eviction; increase VM size as temp mitigation

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy)]`

## Phase 4: PID exhaustion on AKS worker node. Default pid_max

### aks-022: AKS node goes NotReady and all service pods are evicted; syslog shows 'resource ...

**Root Cause**: PID exhaustion on AKS worker node. Default pid_max=32768 is reached by runaway application processes creating excessive threads. When PID table is full, new processes/threads cannot be created; containerd crashes, kubelet cannot spawn helpers (du, nice), causing node failure and pod eviction.

**Solution**:
1) Diagnose: check /proc/sys/kernel/pid_max (default 32768) and current PID usage via 'ps aux | wc -l' or Prometheus. 2) Check syslog/messages for 'resource temporarily unavailable' and 'pthread_create failed'. 3) Identify the offending process using 'ps aux --sort=pid | tail' or by namespace. 4) Fix the application (reduce thread leaks). 5) Deploy Prometheus to monitor PID as preventive measure. 6) Do NOT simply increase pid_max without fixing root cause. 7) AKS Remediator may auto-recover the node but root cause must be addressed.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 5: Cluster exceeded VM redeployment request rate limi

### aks-1095: Node auto-repair fails with TooManyVMRedeploymentRequests error

**Root Cause**: Cluster exceeded VM redeployment request rate limit; redeploy action cannot repair the node

**Solution**:
Manual troubleshooting of Node NotReady issue required. Follow basic Node Not Ready troubleshooting guide. If persistent, contact Azure support

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors)]`

## Phase 6: (1) API server unavailability causing readiness pr

### aks-1101: AKS node intermittently enters NotReady then automatically recovers; readiness p...

**Root Cause**: (1) API server unavailability causing readiness probe failures; (2) VM host faults

**Solution**:
kubectl describe node for errors; verify API server: kubectl get apiservices; check network config; review resource usage via Container Insights; ensure proper service tier; reduce watch/get requests to API server

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-then-recovers)]`

## Phase 7: A container exhausted all available PIDs (default 

### aks-1041: AKS node becomes NotReady. /var/log/syslog shows repeated pthread_create failed:...

**Root Cause**: A container exhausted all available PIDs (default ~32K). Linux cannot allocate new threads via clone syscall. Kubelet/containerd thread creation fails causing node NotReady.

**Solution**:
1) Identify offending container via ps -e -w -o thcount,cgname or Prometheus container_threads metric. 2) Configure --pod-max-pids via AKS custom node configuration. 3) Reboot node or wait for remediator. Do NOT blindly increase pid_max.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FLinux%20PID%20Exhaustion)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node goes NotReady with MemoryPressure=True; pods enter Terminating state (n... | Node available memory fell below kubelet hard eviction thres... | Set proper memory requests to prevent overcommit on nodes. S... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 2 | AKS cluster unexpectedly stopped; cluster with 0 Ready nodes or all NotReady aut... | Since Jan 3 2023, AKS expanded auto-stop: clusters with 0 Re... | Run az aks start to restart. Avoid leaving clusters with all... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Node NotReady with pthread_create failed: Resource temporarily unavailable in sy... | PID/thread exhaustion on node - application spawns too many ... | Identify offending app consuming excessive PIDs; monitor thr... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy) |
| 4 | AKS node goes NotReady and all service pods are evicted; syslog shows 'resource ... | PID exhaustion on AKS worker node. Default pid_max=32768 is ... | 1) Diagnose: check /proc/sys/kernel/pid_max (default 32768) ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 5 | Node auto-repair fails with TooManyVMRedeploymentRequests error | Cluster exceeded VM redeployment request rate limit; redeplo... | Manual troubleshooting of Node NotReady issue required. Foll... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors) |
| 6 | AKS node intermittently enters NotReady then automatically recovers; readiness p... | (1) API server unavailability causing readiness probe failur... | kubectl describe node for errors; verify API server: kubectl... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-then-recovers) |
| 7 | AKS node becomes NotReady. /var/log/syslog shows repeated pthread_create failed:... | A container exhausted all available PIDs (default ~32K). Lin... | 1) Identify offending container via ps -e -w -o thcount,cgna... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FLinux%20PID%20Exhaustion) |
