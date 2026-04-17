# AKS 节点性能与资源管理 — memory -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 5 | **Kusto queries**: 1
**Source drafts**: ado-wiki-b-Map-processes-to-pods-resource-usage.md, ado-wiki-c-Using-ASI-to-Check-Node-Performance.md, ado-wiki-calculating-allocatable-memory-linux-node.md, ado-wiki-la-query-aks-node-cpu-memory-alerts.md, ado-wiki-tsg-resource-exhaustion.md
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: Container memory usage exceeds pod memory resource

### aks-472: Container OOM killed with exit code 137; journalctl shows mem_cgroup_out_of_memo...

**Root Cause**: Container memory usage exceeds pod memory resource limit (cgroup memory limit). The process with highest RSS and oom_score_adj is selected for killing.

**Solution**:
Check journalctl for 'oom-kill:constraint=CONSTRAINT_MEMCG' to confirm cgroup OOM (not system OOM). Compare 'memory: usage vs limit' line. Sum RSS pages × 4KB for per-process breakdown. Increase pod memory limits or optimize application memory usage.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Analyzing%20journalctl%20logs%20for%20OOM%20kills)]`

## Phase 2: Container process allocated memory beyond its defi

### aks-476: Pod OOMKilled (exit code 137) with syslog showing oom_memcg pointing to pod-spec...

**Root Cause**: Container process allocated memory beyond its defined memory limit, triggering cgroup-level OOM killer. Process with highest oom_score inside the container is killed.

**Solution**:
Increase container memory limits or investigate application-level memory leak. Check syslog for 'constraint=CONSTRAINT_MEMCG' and pod-specific oom_memcg path to confirm container-level OOM.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s)]`

## Phase 3: Node-level memory exhaustion from aggressive alloc

### aks-478: Container OOMKilled (exit code 137) despite NOT exceeding its own memory limit; ...

**Root Cause**: Node-level memory exhaustion from aggressive allocation across all pods. Kernel OOM killer triggered at node level, killing process with highest oom_score regardless of individual container limits.

**Solution**:
Distinguish from container-level OOM by checking oom_memcg path: '/kubepods.slice' = node-level vs '/kubepods.slice/.../pod<UID>.slice' = container-level. Set proper memory requests to prevent overcommit. Scale horizontally or vertically.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s)]`

## Phase 4: Linux kernel page cache (slab memory) inflates cgr

### aks-1092: High memory (working set) on disk-intensive pods, OOMKilled despite low actual a...

**Root Cause**: Linux kernel page cache (slab memory) inflates cgroup memory.current metric. working_set = memory.current - inactive_file. Disk-intensive apps cause kernel to cache filesystem data in slab_reclaimable, which counts toward pod memory usage

**Solution**:
Set realistic memory requests and limits in pod spec. Verify by: kubectl exec into pod → cat /sys/fs/cgroup/memory.stat → check slab vs anon ratio. Diagnostic: drop kernel cache on debug pod 'echo 1 > /proc/sys/vm/drop_caches' (non-prod only) to confirm

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/high-memory-consumption-disk-intensive-applications)]`

## Phase 5: Helm deployments with unlimited revision history (

### aks-1135: API server overloaded - too many Helm release revisions cause excessive ConfigMa...

**Root Cause**: Helm deployments with unlimited revision history (default) create large amounts of ConfigMap objects that consume node memory and cause API server usage spikes

**Solution**:
Set --history-max parameter to a reasonable value when running helm init (v2) or helm upgrade (v3) to limit stored revisions per release

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server)]`

## Phase 6: Memory limit is 4GB (supports ~7000 containers). L

### aks-1214: AKS Cost Analysis add-on cost-analysis-agent pod OOMKilled or stuck in Pending s...

**Root Cause**: Memory limit is 4GB (supports ~7000 containers). Large clusters exceed this limit causing OOMKill. Pending state caused by insufficient allocatable memory on nodes (request is 500MB)

**Solution**:
For OOMKill: disable the add-on as custom memory limits not supported. For Pending: ensure nodes have 500MB+ allocatable memory. Memory usage formula: ~200MB + 0.5MB per container

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container OOM killed with exit code 137; journalctl shows mem_cgroup_out_of_memo... | Container memory usage exceeds pod memory resource limit (cg... | Check journalctl for 'oom-kill:constraint=CONSTRAINT_MEMCG' ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Analyzing%20journalctl%20logs%20for%20OOM%20kills) |
| 2 | Pod OOMKilled (exit code 137) with syslog showing oom_memcg pointing to pod-spec... | Container process allocated memory beyond its defined memory... | Increase container memory limits or investigate application-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 3 | Container OOMKilled (exit code 137) despite NOT exceeding its own memory limit; ... | Node-level memory exhaustion from aggressive allocation acro... | Distinguish from container-level OOM by checking oom_memcg p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 4 | High memory (working set) on disk-intensive pods, OOMKilled despite low actual a... | Linux kernel page cache (slab memory) inflates cgroup memory... | Set realistic memory requests and limits in pod spec. Verify... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/high-memory-consumption-disk-intensive-applications) |
| 5 | API server overloaded - too many Helm release revisions cause excessive ConfigMa... | Helm deployments with unlimited revision history (default) c... | Set --history-max parameter to a reasonable value when runni... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 6 | AKS Cost Analysis add-on cost-analysis-agent pod OOMKilled or stuck in Pending s... | Memory limit is 4GB (supports ~7000 containers). Large clust... | For OOMKill: disable the add-on as custom memory limits not ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues) |
