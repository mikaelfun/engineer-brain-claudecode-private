# AKS 节点性能与资源管理 — general -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 8
**Last updated**: 2026-04-05

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: 1) 使用 ephemeral OS disks 解决 OS 磁盘节流；2) 考虑更换更大的 VM SKU；3) 为 Node/Pod 设置合理的资源 limits 避免 OOMKilled；4) 对 `[source: ado-wiki]`
2. Check: Disable mlocate cron: chmod -x /etc/cron `[source: onenote]`
3. Check: kubectl top pod or cat /sys/fs/cgroup/memory `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-performance-resource-general.md)
