# AKS 节点性能与资源管理 — general -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: 磁盘 IOPs 或吞吐量达到上限导致 IO 延迟，常见原因包括多个日志采集工具（如 Azure Mo

### aks-498: AKS 节点磁盘 IO 性能问题：AppLens 检测到 Disk IOPs Throttling、Cluster Node Issues、API Server...

**Root Cause**: 磁盘 IOPs 或吞吐量达到上限导致 IO 延迟，常见原因包括多个日志采集工具（如 Azure Monitor + Fluentd + DataDog 等）共存导致磁盘饥饿

**Solution**:
1) 使用 ephemeral OS disks 解决 OS 磁盘节流；2) 考虑更换更大的 VM SKU；3) 为 Node/Pod 设置合理的资源 limits 避免 OOMKilled；4) 对 API Server OOMKilled 启用 Uptime SLA；5) 确保集群内仅运行一个日志采集工具

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20Performance%20Investigation%20Flow)]`

## Phase 2: Ubuntu mlocate package runs daily cron (updatedb.m

### aks-121: AKS worker nodes experience periodic high IO spikes; updatedb/mlocate cron job c...

**Root Cause**: Ubuntu mlocate package runs daily cron (updatedb.mlocate) scanning entire filesystem. On AKS nodes with many container layers this causes significant IO overhead.

**Solution**:
Disable mlocate cron: chmod -x /etc/cron.daily/mlocate or remove the package. For AKS Engine add custom script extension. Ref: https://github.com/Azure/aks-engine/issues/2971

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: (1) Memory limits too low; (2) App memory leak; (3

### aks-1104: User pod repeatedly OOMKilled (exit code 137); continuous restarts

**Root Cause**: (1) Memory limits too low; (2) App memory leak; (3) User workloads on system node pool

**Solution**:
kubectl top pod or cat /sys/fs/cgroup/memory.current; increase memory limits; move to user node pools; check memory leaks; verify Java/.NET runtime version for cgroup v2 after K8s 1.25 upgrade

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters)]`

## Phase 4: All nodes fully utilized or pod CPU request exceed

### aks-1106: Pod Pending: Insufficient CPU

**Root Cause**: All nodes fully utilized or pod CPU request exceeds available CPU

**Solution**:
kubectl describe nodes; az aks nodepool scale; use larger VM sizes; optimize CPU requests/limits

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors)]`

## Phase 5: Subscription-level or tenant-level ARM throttling 

### aks-1202: Deleting AKS cluster fails with HTTP 429 TooManyRequestsReceived / SubscriptionR...

**Root Cause**: Subscription-level or tenant-level ARM throttling limits reached; too many concurrent requests to Azure Resource Manager

**Solution**:
Wait for the Retry-After period specified in the HTTP response header before retrying the delete operation; reduce concurrent ARM calls

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/toomanyrequestsreceived-error)]`

## Phase 6: Pod resource limits not properly configured. When 

### aks-213: AKS pod CPU rapidly spikes causing pod eviction (Evicted status). Multiple pods ...

**Root Cause**: Pod resource limits not properly configured. When pod CPU usage spikes beyond node capacity, kubelet evicts pods to protect node stability. Standard Kubernetes eviction behavior triggered by node resource pressure.

**Solution**:
Set proper resource requests and limits in pod spec. Check node resource pressure: kubectl describe node. Review eviction events: kubectl get events --field-selector reason=Evicted. Consider PodDisruptionBudget. Scale out nodepool if persistent.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: AKS reserves a flat amount of CPU and regressive p

### aks-995: Pods stuck in Pending state. kubectl describe shows 'Insufficient memory' or 'In...

**Root Cause**: AKS reserves a flat amount of CPU and regressive percentage of memory for kubelet/OS processes. This non-configurable reservation reduces allocatable resources below what 'kubectl top nodes' might suggest.

**Solution**:
1) Run 'kubectl describe node' to check Allocatable vs Allocated resources. 2) Calculate usable = Allocatable - Allocated. 3) If insufficient, reduce pod resource requests or add nodes to the pool. Use kube-scheduler Kusto query (ControlPlaneEvents, category=='kube-scheduler') to confirm scheduling failure reasons.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPods%20Stuck%20in%20Pending%20State%20due%20to%20resource%20limits)]`

## Phase 8: CrowdStrike Container Drift Prevention runtime pro

### aks-1047: ama-logs-rs and ama-logs pods restart with exit code 137, NOT due to OOM. CrowdS...

**Root Cause**: CrowdStrike Container Drift Prevention runtime protection blocks new processes in containers, killing ama-logs processes.

**Solution**:
Advise customer to review CrowdStrike Runtime Protection - Container Drift Prevention policy. Add exception for AMA pods or adjust policy. First confirm restarts are not from node resource issues.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FAMA%20Pod%20Restarts%20with%20exit%20code%20137)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 节点磁盘 IO 性能问题：AppLens 检测到 Disk IOPs Throttling、Cluster Node Issues、API Server... | 磁盘 IOPs 或吞吐量达到上限导致 IO 延迟，常见原因包括多个日志采集工具（如 Azure Monitor + Fl... | 1) 使用 ephemeral OS disks 解决 OS 磁盘节流；2) 考虑更换更大的 VM SKU；3) 为 N... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20Performance%20Investigation%20Flow) |
| 2 | AKS worker nodes experience periodic high IO spikes; updatedb/mlocate cron job c... | Ubuntu mlocate package runs daily cron (updatedb.mlocate) sc... | Disable mlocate cron: chmod -x /etc/cron.daily/mlocate or re... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | User pod repeatedly OOMKilled (exit code 137); continuous restarts | (1) Memory limits too low; (2) App memory leak; (3) User wor... | kubectl top pod or cat /sys/fs/cgroup/memory.current; increa... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters) |
| 4 | Pod Pending: Insufficient CPU | All nodes fully utilized or pod CPU request exceeds availabl... | kubectl describe nodes; az aks nodepool scale; use larger VM... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors) |
| 5 | Deleting AKS cluster fails with HTTP 429 TooManyRequestsReceived / SubscriptionR... | Subscription-level or tenant-level ARM throttling limits rea... | Wait for the Retry-After period specified in the HTTP respon... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/toomanyrequestsreceived-error) |
| 6 | AKS pod CPU rapidly spikes causing pod eviction (Evicted status). Multiple pods ... | Pod resource limits not properly configured. When pod CPU us... | Set proper resource requests and limits in pod spec. Check n... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | Pods stuck in Pending state. kubectl describe shows 'Insufficient memory' or 'In... | AKS reserves a flat amount of CPU and regressive percentage ... | 1) Run 'kubectl describe node' to check Allocatable vs Alloc... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPods%20Stuck%20in%20Pending%20State%20due%20to%20resource%20limits) |
| 8 | ama-logs-rs and ama-logs pods restart with exit code 137, NOT due to OOM. CrowdS... | CrowdStrike Container Drift Prevention runtime protection bl... | Advise customer to review CrowdStrike Runtime Protection - C... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FAMA%20Pod%20Restarts%20with%20exit%20code%20137) |
