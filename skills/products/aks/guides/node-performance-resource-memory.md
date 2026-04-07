# AKS 节点性能与资源管理 — memory -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container OOM killed with exit code 137; journalctl shows mem_cgroup_out_of_memo... | Container memory usage exceeds pod memory resource limit (cg... | Check journalctl for 'oom-kill:constraint=CONSTRAINT_MEMCG' ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Analyzing%20journalctl%20logs%20for%20OOM%20kills) |
| 2 | Pod OOMKilled (exit code 137) with syslog showing oom_memcg pointing to pod-spec... | Container process allocated memory beyond its defined memory... | Increase container memory limits or investigate application-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 3 | Container OOMKilled (exit code 137) despite NOT exceeding its own memory limit; ... | Node-level memory exhaustion from aggressive allocation acro... | Distinguish from container-level OOM by checking oom_memcg p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 4 | High memory (working set) on disk-intensive pods, OOMKilled despite low actual a... | Linux kernel page cache (slab memory) inflates cgroup memory... | Set realistic memory requests and limits in pod spec. Verify... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/high-memory-consumption-disk-intensive-applications) |
| 5 | API server overloaded - too many Helm release revisions cause excessive ConfigMa... | Helm deployments with unlimited revision history (default) c... | Set --history-max parameter to a reasonable value when runni... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 6 | AKS Cost Analysis add-on cost-analysis-agent pod OOMKilled or stuck in Pending s... | Memory limit is 4GB (supports ~7000 containers). Large clust... | For OOMKill: disable the add-on as custom memory limits not ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues) |

## Quick Troubleshooting Path

1. Check: Check journalctl for 'oom-kill:constraint=CONSTRAINT_MEMCG' to confirm cgroup OOM (not system OOM) `[source: ado-wiki]`
2. Check: Increase container memory limits or investigate application-level memory leak `[source: ado-wiki]`
3. Check: Distinguish from container-level OOM by checking oom_memcg path: '/kubepods `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-performance-resource-memory.md)
