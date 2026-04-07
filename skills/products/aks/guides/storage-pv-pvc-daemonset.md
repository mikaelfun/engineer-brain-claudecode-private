# AKS PV/PVC 与卷管理 — daemonset -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node sysctl configuration changes (e.g., net.netfilter.nf_conntrack_tcp_be_l... | 'sysctl -w' only applies changes in-memory; without adding t... | 1) Add module: 'echo nf_conntrack >> /etc/modules-load.d/mod... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FMaking%20conntrack%20settings%20persistent%20in%20AKS%20Nodes) |
| 2 | omsagent pod not running on one AKS node; DaemonSet has fewer running pods than ... | omsagent (Azure Monitor agent) DaemonSet pod failed to sched... | 1) Delete the stuck omsagent pod — DaemonSet will auto-recre... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Customer needs to customize AKS node OS/kernel parameters (e.g. net.ipv4.tcp_ret... | AKS does not support custom VMSS images. Node OS modificatio... | Workaround A (cluster-wide): Deploy a DaemonSet that applies... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |

## Quick Troubleshooting Path

1. Check: 1) Add module: 'echo nf_conntrack >> /etc/modules-load `[source: ado-wiki]`
2. Check: 1) Delete the stuck omsagent pod — DaemonSet will auto-recreate: 'kubectl delete pod <omsagent-pod>  `[source: onenote]`
3. Check: Workaround A (cluster-wide): Deploy a DaemonSet that applies the desired OS/kernel params on every n `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-pv-pvc-daemonset.md)
