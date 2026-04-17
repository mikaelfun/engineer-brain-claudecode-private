# AKS 集群版本升级 — vmss -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS upgrade fails with CreateVMSSAgentPoolFailed: Cannot complete the operation ... | Customer manually resized VMSS OS disks at the IaaS level, c... | Identify affected node pools by per-nodepool upgrade. Compar... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Disk%20size%20mismatch%20causes%20upgrade%20failures) |
| 2 | During nodepool upgrade, autoscaler deletes the surge node causing GetSurgedVms_... | Race condition between AKS RP and cluster autoscaler. AKS RP... | 1) Recommend customer disable cluster autoscaler before perf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade) |
| 3 | AKS upgrade fails with CreateVMSSAgentPoolFailed: 'Cannot complete the operation... | Customer manually resized VMSS OS disks at the IaaS level ou... | Identify affected node pools by running per-nodepool upgrade... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FDisk%20size%20mismatch%20causes%20upgrade%20failures) |
| 4 | AKS upgrade with Availability Zones causes temporary zone imbalance; surge nodes... | AKS uses best-effort zone balancing in VMSS. During upgrade ... | Set upgrade surge to multiple of 3 nodes so VMSS can balance... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Identify affected node pools by per-nodepool upgrade `[source: ado-wiki]`
2. Check: 1) Recommend customer disable cluster autoscaler before performing nodepool upgrades; 2) Re-enable a `[source: ado-wiki]`
3. Check: Identify affected node pools by running per-nodepool upgrades `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-vmss.md)
