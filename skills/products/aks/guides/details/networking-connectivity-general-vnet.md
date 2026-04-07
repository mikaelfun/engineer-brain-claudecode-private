# AKS 网络连通性通用 — vnet -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-acr-content-trust-delegation.md, ado-wiki-agic-private-ip-only-workaround.md, mslearn-same-vnet-connectivity.md
**Generated**: 2026-04-07

---

## Phase 1: When AKS cluster uses Azure CNI Overlay or Pod Sub

### aks-743: Cannot delete subnet or VNet after AKS cluster deletion - subnet is delegated to...

**Root Cause**: When AKS cluster uses Azure CNI Overlay or Pod Subnet, subnet delegation creates a ServiceAssociationLink (SAL). After cluster deletion, SAL should be auto-removed but sometimes persists.

**Solution**:
1) Remove delegation via Azure Portal: VNet > Subnets > select subnet > Delegate subnet = None > Save. 2) Via CLI: az network vnet subnet update --remove delegations. 3) If above fails, use Jarvis actions for undelegation (CSS can perform, except China which is restricted).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FUndelegate%20Subnet)]`

## Phase 2: Once AKS cluster is created, subnet CIDR and VNET 

### aks-172: Cannot change subnet CIDR or IP address range for existing AKS cluster without r...

**Root Cause**: Once AKS cluster is created, subnet CIDR and VNET IP configuration cannot be changed directly. This is a platform limitation.

**Solution**:
Workaround: 1) Remove/move nodes from the subnet 2) Change the CIDR 3) Go to resources.azure.com, do GET then PUT on the cluster to re-create nodes 4) Re-apply YAML files with updated CIDR if workloads reference original CIDR.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: The managed-cluster option in VNet delegation is n

### aks-250: VNet delegation to managed-cluster fails during AKS VNet selection in portal

**Root Cause**: The managed-cluster option in VNet delegation is not yet a supported delegation target. It appears in the portal but is not functional.

**Solution**:
Do not select managed-cluster as VNet delegation type. AKS does not require VNet delegation for standard deployment.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot delete subnet or VNet after AKS cluster deletion - subnet is delegated to... | When AKS cluster uses Azure CNI Overlay or Pod Subnet, subne... | 1) Remove delegation via Azure Portal: VNet > Subnets > sele... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FUndelegate%20Subnet) |
| 2 | Cannot change subnet CIDR or IP address range for existing AKS cluster without r... | Once AKS cluster is created, subnet CIDR and VNET IP configu... | Workaround: 1) Remove/move nodes from the subnet 2) Change t... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | VNet delegation to managed-cluster fails during AKS VNet selection in portal | The managed-cluster option in VNet delegation is not yet a s... | Do not select managed-cluster as VNet delegation type. AKS d... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
