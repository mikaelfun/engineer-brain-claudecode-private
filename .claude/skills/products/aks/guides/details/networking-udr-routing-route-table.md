# AKS UDR 与路由 — route-table -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-move-pv-data-between-clusters.md
**Generated**: 2026-04-07

---

## Phase 1: The route table used by the AKS cluster is shared 

### aks-1067: Node event logs (kubectl describe node) show 'Warning FailedToCreateRoute' with ...

**Root Cause**: The route table used by the AKS cluster is shared between multiple AKS clusters using Kubenet CNI, and the pod CIDRs of these clusters overlap. This causes route table entries to be modified by different clusters simultaneously, leading to etag mismatches and precondition failures in the route controller.

**Solution**:
Each AKS Kubenet cluster must use a unique route table. Update the subnet to use a dedicated route table, or recreate the cluster with a non-overlapping pod CIDR. Reference: https://docs.microsoft.com/en-us/azure/aks/configure-kubenet#bring-your-own-subnet-and-route-table-with-kubenet. Use AppLens 'Shared Route Tables' detector or Kusto query on ManagedClusterSnapshot to identify shared route tables.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FFailedToCreateRoute%20PreconditionFailed%20logged%20on%20all%20nodes%20Describe)]`

## Phase 2: AKS cloud provider config (cloudconfig) is hard-co

### aks-239: Cannot move AKS VNet or route table to a different resource group after cluster ...

**Root Cause**: AKS cloud provider config (cloudconfig) is hard-coded in RP at cluster creation time referencing specific resource group paths. Moving VNet route table or related resources breaks the reference.

**Solution**:
Do not move AKS-associated networking resources (VNet, route table, NSG) to other resource groups after cluster creation. Plan resource group layout before creating the cluster.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: The AKS cluster's associated route table is still 

### aks-1187: AKS cluster deletion fails with InUseRouteTableCannotBeDeleted. Route table is i...

**Root Cause**: The AKS cluster's associated route table is still linked to a subnet, preventing deletion.

**Solution**:
Dissociate the route table from the subnet first, then retry deleting the AKS cluster.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/inuseroutetablecannotbedeleted-error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Node event logs (kubectl describe node) show 'Warning FailedToCreateRoute' with ... | The route table used by the AKS cluster is shared between mu... | Each AKS Kubenet cluster must use a unique route table. Upda... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FFailedToCreateRoute%20PreconditionFailed%20logged%20on%20all%20nodes%20Describe) |
| 2 | Cannot move AKS VNet or route table to a different resource group after cluster ... | AKS cloud provider config (cloudconfig) is hard-coded in RP ... | Do not move AKS-associated networking resources (VNet, route... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster deletion fails with InUseRouteTableCannotBeDeleted. Route table is i... | The AKS cluster's associated route table is still linked to ... | Dissociate the route table from the subnet first, then retry... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/inuseroutetablecannotbedeleted-error) |
