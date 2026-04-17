# AKS ACI 网络与 DNS — subnet -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot delete subnet - InUseSubnetCannotBeDeleted error due to ACI service assoc... | Subnet has active service association links from Azure Conta... | Use Azure REST API to delete the service association link fi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Subnet%20Deletion%20Error%3A%20InUseSubnetCannotBeDeleted) |
| 2 | AKS cluster enters Failed state with SubnetIsFull - subnet does not have enough ... | The subnet available IP address space is exhausted. Cannot p... | Either: 1) Reduce node count to free up address space; 2) Cr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 3 | AKS cluster operations fail with SubnetIsFull error: Subnet does not have enough... | The subnet assigned to the AKS node pool has exhausted its a... | Either reduce the node count to free up address space, or cr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 4 | AKS cluster operations fail with SubnetIsFull error: subnet does not have enough... | The subnet assigned to the AKS cluster has insufficient avai... | Either reduce node count to free address space, or create a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State) |
| 5 | AKS cluster upgrade fails with SubnetIsFull error: subnet does not have enough c... | Subnet IP address range exhausted - not enough free IPs to c... | Reduce cluster nodes to free IPs for upgrade. If not possibl... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-subnetisfull-upgrade) |

## Quick Troubleshooting Path

1. Check: Use Azure REST API to delete the service association link first: az rest --method delete --uri https `[source: ado-wiki]`
2. Check: Either: 1) Reduce node count to free up address space; 2) Create temporary nodepool in a different s `[source: ado-wiki]`
3. Check: Either reduce the node count to free up address space, or create a temporary nodepool in a temporary `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/aci-networking-subnet.md)
