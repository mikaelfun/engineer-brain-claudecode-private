# AKS PV/PVC 与卷管理 — configmap -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Container Insights alert 指标（cpuThresholdViolated, memoryRssThresholdViolated... | 这些 alertable metrics 默认仅在资源利用率超过阈值时才收集数据（CPU/Memory 默认 95%，P... | 修改 container-azm-ms-agentconfig ConfigMap 中的 alertable_metri... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FTesting%20alerting%20by%20generating%20synthetic%20load) |
| 2 | After scaling up Windows nodepool with Standard_E32s_v5 SKU, nodes enter NotRead... | ConfigMap containing Windows-specific UNC file paths and Pow... | Modify the ConfigMap to remove or encode UNC file paths and ... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/kubelet%20crash%20different%20memory%20arch) |
| 3 | Azure Monitor for containers generates excessive log volume from AKS causing hig... | By default Azure Monitor collects stdout/stderr from all nam... | 1) Check top sources: ContainerLog \| summarize count() by L... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |

## Quick Troubleshooting Path

1. Check: 修改 container-azm-ms-agentconfig ConfigMap 中的 alertable_metrics_configuration_settings，调整阈值百分比（如 cont `[source: ado-wiki]`
2. Check: Modify the ConfigMap to remove or encode UNC file paths and embedded PowerShell scripts `[source: ado-wiki]`
3. Check: 1) Check top sources: ContainerLog | summarize count() by LogEntrySource `[source: onenote]`
