# AKS 节点 NotReady -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 7
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node goes NotReady with MemoryPressure=True; pods enter Terminating state (n... | Node available memory fell below kubelet hard eviction thres... | Set proper memory requests to prevent overcommit on nodes. S... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/High%20memory%20usage%20handling%20in%20k8s) |
| 2 | AKS cluster unexpectedly stopped; cluster with 0 Ready nodes or all NotReady aut... | Since Jan 3 2023, AKS expanded auto-stop: clusters with 0 Re... | Run az aks start to restart. Avoid leaving clusters with all... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Node NotReady with pthread_create failed: Resource temporarily unavailable in sy... | PID/thread exhaustion on node - application spawns too many ... | Identify offending app consuming excessive PIDs; monitor thr... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy) |
| 4 | AKS node goes NotReady and all service pods are evicted; syslog shows 'resource ... | PID exhaustion on AKS worker node. Default pid_max=32768 is ... | 1) Diagnose: check /proc/sys/kernel/pid_max (default 32768) ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 5 | Node auto-repair fails with TooManyVMRedeploymentRequests error | Cluster exceeded VM redeployment request rate limit; redeplo... | Manual troubleshooting of Node NotReady issue required. Foll... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors) |
| 6 | AKS node intermittently enters NotReady then automatically recovers; readiness p... | (1) API server unavailability causing readiness probe failur... | kubectl describe node for errors; verify API server: kubectl... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-then-recovers) |
| 7 | AKS node becomes NotReady. /var/log/syslog shows repeated pthread_create failed:... | A container exhausted all available PIDs (default ~32K). Lin... | 1) Identify offending container via ps -e -w -o thcount,cgna... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FLinux%2FLinux%20PID%20Exhaustion) |

## Quick Troubleshooting Path

1. Check: Set proper memory requests to prevent overcommit on nodes `[source: ado-wiki]`
2. Check: Run az aks start to restart `[source: onenote]`
3. Check: Identify offending app consuming excessive PIDs; monitor thread count per cgroup; configure --pod-ma `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-not-ready.md)
