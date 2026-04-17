# AKS ACI 网络与 DNS — subnet -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: Subnet has active service association links from A

### aks-470: Cannot delete subnet - InUseSubnetCannotBeDeleted error due to ACI service assoc...

**Root Cause**: Subnet has active service association links from Azure Container Instances (Microsoft.ContainerInstance) that prevent deletion

**Solution**:
Use Azure REST API to delete the service association link first: az rest --method delete --uri https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}/providers/Microsoft.ContainerInstance/serviceAssociationLinks/default?api-version=2018-10-01, then retry subnet deletion

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Subnet%20Deletion%20Error%3A%20InUseSubnetCannotBeDeleted)]`

## Phase 2: The subnet available IP address space is exhausted

### aks-778: AKS cluster enters Failed state with SubnetIsFull - subnet does not have enough ...

**Root Cause**: The subnet available IP address space is exhausted. Cannot provision new nodes/pods

**Solution**:
Either: 1) Reduce node count to free up address space; 2) Create temporary nodepool in a different subnet, migrate workloads, then recreate original nodepool

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 3: The subnet assigned to the AKS node pool has exhau

### aks-788: AKS cluster operations fail with SubnetIsFull error: Subnet does not have enough...

**Root Cause**: The subnet assigned to the AKS node pool has exhausted its available IP address space

**Solution**:
Either reduce the node count to free up address space, or create a temporary nodepool in a temporary subnet, move workloads over, and recreate the initial nodepool

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 4: The subnet assigned to the AKS cluster has insuffi

### aks-968: AKS cluster operations fail with SubnetIsFull error: subnet does not have enough...

**Root Cause**: The subnet assigned to the AKS cluster has insufficient available IP addresses for the requested node scaling or upgrade operation.

**Solution**:
Either reduce node count to free address space, or create a temporary nodepool in a different subnet, migrate workloads, then recreate the original nodepool with proper subnet sizing.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 5: Subnet IP address range exhausted - not enough fre

### aks-1163: AKS cluster upgrade fails with SubnetIsFull error: subnet does not have enough c...

**Root Cause**: Subnet IP address range exhausted - not enough free IPs to create new nodes during upgrade surge.

**Solution**:
Reduce cluster nodes to free IPs for upgrade. If not possible and VNet CIDR has room, add new node pool with unique larger subnet, switch original to system type, scale up new, scale down original.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-subnetisfull-upgrade)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot delete subnet - InUseSubnetCannotBeDeleted error due to ACI service assoc... | Subnet has active service association links from Azure Conta... | Use Azure REST API to delete the service association link fi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Subnet%20Deletion%20Error%3A%20InUseSubnetCannotBeDeleted) |
| 2 | AKS cluster enters Failed state with SubnetIsFull - subnet does not have enough ... | The subnet available IP address space is exhausted. Cannot p... | Either: 1) Reduce node count to free up address space; 2) Cr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 3 | AKS cluster operations fail with SubnetIsFull error: Subnet does not have enough... | The subnet assigned to the AKS node pool has exhausted its a... | Either reduce the node count to free up address space, or cr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 4 | AKS cluster operations fail with SubnetIsFull error: subnet does not have enough... | The subnet assigned to the AKS cluster has insufficient avai... | Either reduce node count to free address space, or create a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State) |
| 5 | AKS cluster upgrade fails with SubnetIsFull error: subnet does not have enough c... | Subnet IP address range exhausted - not enough free IPs to c... | Reduce cluster nodes to free IPs for upgrade. If not possibl... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-subnetisfull-upgrade) |
