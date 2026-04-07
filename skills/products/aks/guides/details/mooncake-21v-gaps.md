# AKS Mooncake 21V 功能差异 -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-in-transit-encryption-using-wireguard.md
**Generated**: 2026-04-07

---

## Phase 1: KMS plugin for AKS was in public preview globally 

### aks-007: KMS (Key Management Service) for etcd secrets encryption not available in AKS Az...

**Root Cause**: KMS plugin for AKS was in public preview globally around March 2023. No Mooncake landing date confirmed in team notes.

**Solution**:
KMS-based secrets encryption availability in Azure China is unconfirmed. Use Azure Key Vault CSI driver (secrets-store-csi-driver) for secrets management as an alternative.

`[Score: [B] 7.5 | Source: [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS Fleet Manager is not available in Azure China 

### aks-003: Customer asks about AKS Fleet Manager availability or multi-cluster management i...

**Root Cause**: AKS Fleet Manager is not available in Azure China (21Vianet). Confirmed as explicit feature gap in Mooncake PG sync (Nov 2025).

**Solution**:
AKS Fleet Manager is not supported in 21V. No direct replacement. Consider manual multi-cluster management approaches. Feature owner: liqianluo.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [21v-gap](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview)]`

## Phase 3: The Hub cluster has a built-in policy that prevent

### aks-445: Cannot stop AKS Fleet Manager Hub cluster - error: client ID does not have permi...

**Root Cause**: The Hub cluster has a built-in policy that prevents it from being stopped. This is by design to ensure Fleet management operations remain available.

**Solution**:
This is expected behavior. Fleet Member clusters can be stopped to save costs, but the Hub cluster cannot be stopped. Advise customer this is by design.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ)]`

## Phase 4: A Delete Lock exists on the target AKS cluster res

### aks-453: Unable to remove AKS cluster from Fleet - az fleet member delete command fails o...

**Root Cause**: A Delete Lock exists on the target AKS cluster resource. The fleet member delete operation triggers a DELETE request at ARM level which conflicts with existing resource locks, even though it only removes fleet membership and does not delete the actual cluster.

**Solution**:
1) Remove Delete Lock from the target AKS cluster resource. 2) Run `az fleet member delete` to remove the member from fleet. 3) Re-add the Delete Lock if needed. Debug with Kusto: FleetAPIQoSEvents (operationName==DeleteFleetMember) and FleetAsyncQoSEvents to find the error details.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FUnable%20to%20Remove%20AKS%20Cluster%20from%20Fleet)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | KMS (Key Management Service) for etcd secrets encryption not available in AKS Az... | KMS plugin for AKS was in public preview globally around Mar... | KMS-based secrets encryption availability in Azure China is ... | [B] 7.5 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Customer asks about AKS Fleet Manager availability or multi-cluster management i... | AKS Fleet Manager is not available in Azure China (21Vianet)... | AKS Fleet Manager is not supported in 21V. No direct replace... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview) |
| 3 | Cannot stop AKS Fleet Manager Hub cluster - error: client ID does not have permi... | The Hub cluster has a built-in policy that prevents it from ... | This is expected behavior. Fleet Member clusters can be stop... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ) |
| 4 | Unable to remove AKS cluster from Fleet - az fleet member delete command fails o... | A Delete Lock exists on the target AKS cluster resource. The... | 1) Remove Delete Lock from the target AKS cluster resource. ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FUnable%20to%20Remove%20AKS%20Cluster%20from%20Fleet) |
