# AKS 内部负载均衡器 — cluster-delete -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: cluster-snapshot.md
**Generated**: 2026-04-07

---

## Phase 1: ARM bug: when customer performs a fast PUT on a ne

### aks-592: AKS cluster delete fails with PublicIPAddressCannotBeDeleted or similar errors —...

**Root Cause**: ARM bug: when customer performs a fast PUT on a network object after a previous DELETE, ARM honors the stale DELETE and removes the resource from ARM cache while it still exists in NRP/NFVRP. ARM and resource provider become permanently out-of-sync. Tracked by ARM team Bug 7832895.

**Solution**:
1) Use ARM 'Get resource' Jarvis action to confirm resource missing from ARM but present in NRP. 2) Run ARM 'sync resource state' Jarvis action to recreate the missing resource in ARM. 3) After sync, customer retries delete — should succeed. Permanent fix pending ARM migration to CosmosDB (PBI 6463105). Kusto: query NRP FrontendOperationEtwEvent for failed LB/PIP delete details.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAKS%20delete%20errors%20due%20to%20ARM%20cache%20issues)]`

## Phase 2: Cluster is associated with subnet, NSG, or public 

### aks-1150: Cannot delete AKS cluster: PublicIPAddressCannotBeDeleted, InUseSubnetCannotBeDe...

**Root Cause**: Cluster is associated with subnet, NSG, or public IP still in use by other resources (LB, App Service plan, etc.)

**Solution**:
Remove public IP associations from LB; remove LB rules, health probes, backend pools; dissociate NSG from subnet; remove App Service plan resources connected to AKS VNET, then retry delete

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-ip-subnet-nsg)]`

## Phase 3: Private link service on internal LB has active pri

### aks-1151: Cannot delete AKS cluster: CannotDeleteLoadBalancerWithPrivateLinkService or Pri...

**Root Cause**: Private link service on internal LB has active private endpoint connections preventing deletion

**Solution**:
Delete all private endpoint connections first, then delete the private link service, then retry AKS cluster deletion

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-load-balancer-private-link-service)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster delete fails with PublicIPAddressCannotBeDeleted or similar errors —... | ARM bug: when customer performs a fast PUT on a network obje... | 1) Use ARM 'Get resource' Jarvis action to confirm resource ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAKS%20delete%20errors%20due%20to%20ARM%20cache%20issues) |
| 2 | Cannot delete AKS cluster: PublicIPAddressCannotBeDeleted, InUseSubnetCannotBeDe... | Cluster is associated with subnet, NSG, or public IP still i... | Remove public IP associations from LB; remove LB rules, heal... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-ip-subnet-nsg) |
| 3 | Cannot delete AKS cluster: CannotDeleteLoadBalancerWithPrivateLinkService or Pri... | Private link service on internal LB has active private endpo... | Delete all private endpoint connections first, then delete t... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-load-balancer-private-link-service) |
