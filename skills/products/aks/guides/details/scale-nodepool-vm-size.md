# AKS 节点池扩缩容 — vm-size -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 1
**Source drafts**: ado-wiki-check-physical-zone-logical-zone-mapping.md
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Requested VM SKU restricted, unavailable, or not o

### aks-756: Cluster or node pool creation fails with SKU Not Found or VM Size Not Available ...

**Root Cause**: Requested VM SKU restricted, unavailable, or not offered in target region/zone due to platform capacity limitations or subscription SKU restrictions.

**Solution**:
Check SKU availability: az vm list-skus --location <region> --size <sku>. Check ASC Resource Explorer SKU Restrictions. Use alternative VM size or zone. For quota increase route to SAP: Azure > Subscription management > Compute-VM subscription limit increases.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues)]`

## Phase 2: Requested VM size is not available in the subscrip

### aks-956: AKS cluster or nodepool creation fails with SkuNotAvailable / VM Size Not Availa...

**Root Cause**: Requested VM size is not available in the subscription due to regional restrictions, zonal limitations, or platform capacity constraints.

**Solution**:
1) Check SKU availability: az vm list-skus --location <region> --size <size> --all; 2) Check ASC Resource Explorer > Subscription > RP Details > SKU Restrictions; 3) Advise alternative VM size or zone; 4) Transfer to SAP: Azure > Subscription management > Compute-VM (cores-vCPUs) subscription limit increases.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues)]`

## Phase 3: Requested VM size is restricted at the subscriptio

### aks-1039: AKS cluster or node pool creation fails with 'SKU Not Found' or 'VM Size Not Ava...

**Root Cause**: Requested VM size is restricted at the subscription level (ASC > Resource Explorer > Subscription > RP Details > SKU Restrictions), or the VM size is not offered in the specific region/zone due to platform limitations

**Solution**:
Check SKU availability: `az vm list-skus --location <region> --size <vmsize> --all --output table`. If subscription-level restriction, create collaboration request to Azure\Service and subscription limits (quotas)\ComputeVM with: Subscription ID, Region, SKU Size, Restriction Type, cores requested. If platform limitation, advise customer to select alternative VM size or zone using Compute Capacity Advisor.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FSKU%20Not%20Found%20OR%20VM%20Size%20Not%20Available)]`

## Phase 4: Constraint validation pipeline fails at AzSm step:

### aks-273: Cannot create D4ds_v5/v4 VM size node pools in AzSm (availability zone stamped) ...

**Root Cause**: Constraint validation pipeline fails at AzSm step: EphemeralDisk + VMSize + AzSm constraints together eliminate all candidate compute stamps. No stamps remain after applying all constraints.

**Solution**:
PG-side fix deployed (2023-05-23). For troubleshooting use Kusto: query ContextActivity for OverConstrainedAllocationRequestException with Azsm in Constraints field. Cross-check with ApiQosEvent_nonGet for OverconstrainedAllocationRequest resultCode on VMSS PUT operations.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cluster or node pool creation fails with SKU Not Found or VM Size Not Available ... | Requested VM SKU restricted, unavailable, or not offered in ... | Check SKU availability: az vm list-skus --location <region> ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 2 | AKS cluster or nodepool creation fails with SkuNotAvailable / VM Size Not Availa... | Requested VM size is not available in the subscription due t... | 1) Check SKU availability: az vm list-skus --location <regio... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 3 | AKS cluster or node pool creation fails with 'SKU Not Found' or 'VM Size Not Ava... | Requested VM size is restricted at the subscription level (A... | Check SKU availability: `az vm list-skus --location <region>... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FSKU%20Not%20Found%20OR%20VM%20Size%20Not%20Available) |
| 4 | Cannot create D4ds_v5/v4 VM size node pools in AzSm (availability zone stamped) ... | Constraint validation pipeline fails at AzSm step: Ephemeral... | PG-side fix deployed (2023-05-23). For troubleshooting use K... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
