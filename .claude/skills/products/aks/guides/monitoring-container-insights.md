# AKS Container Insights 与 Log Analytics -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container Insights tables (ContainerInventory, ContainerLog, InsightsMetrics, et... | ama-logs pods (daemonset or replicaset) not running, or comp... | 1) Verify ama-logs pods running (daemonset + deployment). 2)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FContainer%20Insights) |
| 2 | Container Insights logs incomplete with high latency (38min-2h50min); fluent-bit... | Default Fluent-bit config has conservative memory buffer (ta... | 1) Deploy configmap (aka.ms/container-azm-ms-agentconfig) to... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Azure Portal cannot enable Container Insights (Monitoring addon) for AKS cluster... | Mooncake Portal had not updated AKS resource provider API ve... | Use Azure CLI to enable Container Insights: 'az aks enable-a... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Verify ama-logs pods running (daemonset + deployment) `[source: ado-wiki]`
2. Check: 1) Deploy configmap (aka `[source: onenote]`
3. Check: Use Azure CLI to enable Container Insights: 'az aks enable-addons -a monitoring -n <cluster> -g <rg> `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/monitoring-container-insights.md)
