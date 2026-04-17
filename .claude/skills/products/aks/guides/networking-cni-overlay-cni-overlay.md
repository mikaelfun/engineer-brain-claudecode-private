# AKS CNI 与 Overlay 网络 — cni-overlay -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | CNI Overlay AKS 集群中 IP 不足时，尝试使用同 VNET 新 subnet 添加 node pool 报错 GetVnetError: Get... | AKS 在 MC_ 资源组中查找 virtual network 但 CNI Overlay 模式下 VNET 不在 M... | 1) 参考文档 https://learn.microsoft.com/en-us/azure/aks/node-poo... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | NAP nodes stuck NotReady in Azure CNI Overlay cluster. NodeNetworkConfig events:... | Pod CIDR exhaustion in CNI Overlay. Each node pre-allocates ... | Expand Pod CIDR without cluster recreation: see https://lear... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted) |
| 3 | Cannot delete subnet or parent VNet after removing AKS cluster. Error: InUseSubn... | When AKS cluster with Azure CNI Overlay or Pod Subnet is del... | 1) Remove delegation via Azure Portal: VNet > Subnets > sele... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/Undelegate%20Subnet) |

## Quick Troubleshooting Path

1. Check: 1) 参考文档 https://learn `[source: onenote]`
2. Check: Expand Pod CIDR without cluster recreation: see https://learn `[source: ado-wiki]`
3. Check: 1) Remove delegation via Azure Portal: VNet > Subnets > select subnet > Delegate to 'None' > Save `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-cni-overlay-cni-overlay.md)
