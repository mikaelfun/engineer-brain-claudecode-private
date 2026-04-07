# AKS 节点性能与资源管理 — oom -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container Insights ama-logs (ama-logs-rs) pod OOMKilled; monitoring addon pod re... | ama-logs replicaset pod memory usage exceeds default limit. ... | Customer self-tunes via configmap: 1) kubectl get cm -n kube... | [G] 9.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | High rate of HTTP 429 responses from API Server. aks-managed-apiserver-guard flo... | API Server OOM killed event frequency exceeds 10 occurrences... | 1) Inform customer this is protective throttling. 2) Custome... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAPI%20Server%20Priority%20And%20Fairness%20Throttling) |
| 3 | kube-state-metrics (KSM) pod CrashLoopBackOff after AKS patch update; logs show ... | KSM v1.8 uses deprecated v1beta1 API endpoints removed in ne... | 1) Delete old KSM deployment. 2) Redeploy from official v2.1... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS API server OOMKilled on large cluster (900 nodes) causing control plane unav... | Rapid cluster scale-up (1 to 900 nodes in 10 minutes) combin... | 1) Enable uptime-SLA for production clusters with high node ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Customer self-tunes via configmap: 1) kubectl get cm -n kube-system | grep container-azm-ms-agentcon `[source: onenote]`
2. Check: 1) Inform customer this is protective throttling `[source: ado-wiki]`
3. Check: 1) Delete old KSM deployment `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-performance-resource-oom.md)
