# AKS 网络连通性通用 — vnet -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot delete subnet or VNet after AKS cluster deletion - subnet is delegated to... | When AKS cluster uses Azure CNI Overlay or Pod Subnet, subne... | 1) Remove delegation via Azure Portal: VNet > Subnets > sele... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FUndelegate%20Subnet) |
| 2 | Cannot change subnet CIDR or IP address range for existing AKS cluster without r... | Once AKS cluster is created, subnet CIDR and VNET IP configu... | Workaround: 1) Remove/move nodes from the subnet 2) Change t... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | VNet delegation to managed-cluster fails during AKS VNet selection in portal | The managed-cluster option in VNet delegation is not yet a s... | Do not select managed-cluster as VNet delegation type. AKS d... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Remove delegation via Azure Portal: VNet > Subnets > select subnet > Delegate subnet = None > Sav `[source: ado-wiki]`
2. Check: Workaround: 1) Remove/move nodes from the subnet 2) Change the CIDR 3) Go to resources `[source: onenote]`
3. Check: Do not select managed-cluster as VNet delegation type `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-connectivity-general-vnet.md)
