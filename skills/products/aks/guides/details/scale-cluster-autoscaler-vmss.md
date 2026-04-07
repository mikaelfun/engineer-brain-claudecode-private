# AKS Cluster Autoscaler — vmss -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 5 | **Kusto queries**: 3
**Source drafts**: ado-wiki-a-Kusto-queries-Cluster-AutoScaler.md, ado-wiki-a-cluster-autoscaler-vms-agent-pool.md, ado-wiki-b-Audit-query-with-Kusto.md, ado-wiki-b-aci-atlas-investigation-flow-kusto.md, onenote-vmss-scaledown-kusto-tracking.md
**Kusto references**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS release 2025-07-20 changed default node pool t

### aks-076: New AKS node pool creation unexpectedly uses VirtualMachines type instead of VMS...

**Root Cause**: AKS release 2025-07-20 changed default node pool type from VirtualMachineScaleSets to VirtualMachines. VM type has limitations: no autoscaler, no snapshot, no InfiniBand, requires same VM family within pool.

**Solution**:
Explicitly specify --node-pool-type VirtualMachineScaleSets when creating node pools. For existing VMAS pools, migrate with: az aks update --migrate-vmas-to-vms. Use az aks nodepool manual-scale for VM type pools.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Quota exceeded for VMs attached to the VMSS used b

### aks-489: ClusterAutoscalerPodsStuckInPending: Cluster autoscaler fails to scale up, pods ...

**Root Cause**: Quota exceeded for VMs attached to the VMSS used by cluster autoscaler, or insufficient resources preventing scale-up

**Solution**:
Check cluster autoscaler logs for "Failed to scale up" or "QuotaExceeded" using Kusto (ControlPlaneEvents). Verify CRP logs for VMSS operation failures. Request quota increase for the relevant VM families in the Azure subscription.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FCluster%20Autoscaler%20pods%20stuck%20in%20pending)]`

## Phase 3: The vmssCSE (Custom Script Extension) was removed/

### aks-774: AKS cluster stays in Starting state, nodes not visible after start or scale-up d...

**Root Cause**: The vmssCSE (Custom Script Extension) was removed/deleted from the VMSS of the node pool. Without this extension, new nodes cannot complete provisioning and join the cluster.

**Solution**:
1) Abort any ongoing AKS operation: az aks operation-abort -n <name> -g <rg>. 2) Confirm abort succeeded (Status=Canceled): az aks operation show-latest. 3) Upgrade node pool image (works even if already on latest): az aks nodepool upgrade --node-image-only --cluster-name <name> -g <rg> --name <pool>. This reinstalls the vmssCSE extension. Verify with Kusto query checking for 'has no vmss cse extension' in AKSprod.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted)]`

## Phase 4: VMSS autoscale is enabled alongside AKS cluster au

### aks-837: AKS cluster autoscaler creates new VMSS instances but they get deleted within se...

**Root Cause**: VMSS autoscale is enabled alongside AKS cluster autoscaler. VMSS autoscale has a max instance count lower than what cluster autoscaler is trying to scale to. VMSS deletes nodes exceeding its configured maximum, then cluster autoscaler creates new ones again.

**Solution**:
Disable VMSS autoscale: use 'az monitor autoscale delete --name <autoscale-name> --resource-group <MC_RG>' or disable via Portal (VMSS > Scaling > Disable autoscale). After disabling, cluster autoscaler will work as expected.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FCluster%20Autoscaler%2FNew%20VMSS%20instances%20keep%20creating%20and%20deleting)]`

## Phase 5: Known NRP (Network Resource Provider) issue where 

### aks-925: VMSS scale down blocked by 'VM NIC not found' (NotFound) error when using Node P...

**Root Cause**: Known NRP (Network Resource Provider) issue where VM NIC cannot be found during VMSS scale-down operations with public IPTags configured. Under investigation (WI: 26231812).

**Solution**:
Retry the operation. This is a known intermittent NRP issue being tracked via work item https://msazure.visualstudio.com/One/_workitems/edit/26231812.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Public%20IPTags)]`

## Phase 6: Autoscaler uses ForceDelete for scaled-down VMSS i

### aks-127: AKS autoscaler triggers false Service Health/Resource Health alerts showing unex...

**Root Cause**: Autoscaler uses ForceDelete for scaled-down VMSS instances. ForceDelete creates Resource Health annotation appearing as unplanned restart. Owned by Service Health team

**Solution**:
Verify via VMApiQosEvent (operationName=VirtualMachineScaleSets.ForceDelete.POST with AKS RP user agent). ADO: msazure/One/_workitems/edit/17378188

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: Cluster-autoscaler deletes Not-Ready nodes; VMSS i

### aks-034: AKS cluster-autoscaler scaled down a Not-Ready node; need to identify which VMSS...

**Root Cause**: Cluster-autoscaler deletes Not-Ready nodes; VMSS instance names in autoscaler logs use base-36 suffix encoding (e.g., vmss00005r = decimal 207) which must be decoded before querying Kusto infra tables that use decimal instance IDs

**Solution**:
1) Kusto: union AKSccplogs.ControlPlaneEvents+NonShoebox filtered by category=cluster-autoscaler + properties contains "scale_down.go" to find deleted instance name (e.g., aks-nodepool-XXXXX-vmss00005r); 2) Convert base-36 suffix to decimal at unitconverters.net (e.g., 00005r = 207); 3) Query azurecm.LogContainerSnapshot with roleInstanceName contains VMSS name to get containerId/nodeId/virtualMachineUniqueId (summarize arg_max by containerId); 4) Query AllocatorServiceContainerAttributes with containerId to retrieve historical IP and MAC address

`[Score: [B] 6.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.5[AKS] H]]`

## Phase 8: (1) VMSS attached to cluster was deleted, (2) tags

### aks-1152: Cluster autoscaler fails with 'cannot scale cluster autoscaler enabled node pool...

**Root Cause**: (1) VMSS attached to cluster was deleted, (2) tags/properties modified in MC_ node resource group, (3) node resource group was deleted

**Solution**:
(1) Reconcile node pool via 'az aks nodepool update'; (2) Fix tags via 'az group update' with correct AKS-Managed tags; (3) Run 'az aks update -g -n' to reconcile to goal state

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-scale-cluster-autoscaler-enabled-node-pool)]`

## Phase 9: Internal VMSS deployment size limit hit during sca

### aks-228: AKS cluster scale-up fails with error 'The deployment size has exceeded internal...

**Root Cause**: Internal VMSS deployment size limit hit during scale-up operation; large cluster or subscription-level resource constraints cause ARM deployment to exceed system limits

**Solution**:
Contact AKS PG oncall directly for workaround (PG may adjust internal limit or provide alternative scaling approach). ICM reference: 230124446

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 10: AKS uses dns-prefix to generate CCP namespace hash

### aks-270: Orphaned AKS control plane (CCP) unexpectedly scales up/down VMSS in production ...

**Root Cause**: AKS uses dns-prefix to generate CCP namespace hash. Reusing same dns-prefix causes orphaned CCP to find and manage new VMSS.

**Solution**:
1) Verify orphaned CCP: check user-agent, outbound IP, query autoscaler logs by resourceId. 2) Do not reuse dns-prefix. 3) Use randomized dns-prefix (AKS default). 4) Engage AKS PG to clean up orphaned CCP.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | New AKS node pool creation unexpectedly uses VirtualMachines type instead of VMS... | AKS release 2025-07-20 changed default node pool type from V... | Explicitly specify --node-pool-type VirtualMachineScaleSets ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | ClusterAutoscalerPodsStuckInPending: Cluster autoscaler fails to scale up, pods ... | Quota exceeded for VMs attached to the VMSS used by cluster ... | Check cluster autoscaler logs for "Failed to scale up" or "Q... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FCluster%20Autoscaler%20pods%20stuck%20in%20pending) |
| 3 | AKS cluster stays in Starting state, nodes not visible after start or scale-up d... | The vmssCSE (Custom Script Extension) was removed/deleted fr... | 1) Abort any ongoing AKS operation: az aks operation-abort -... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted) |
| 4 | AKS cluster autoscaler creates new VMSS instances but they get deleted within se... | VMSS autoscale is enabled alongside AKS cluster autoscaler. ... | Disable VMSS autoscale: use 'az monitor autoscale delete --n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FCluster%20Autoscaler%2FNew%20VMSS%20instances%20keep%20creating%20and%20deleting) |
| 5 | VMSS scale down blocked by 'VM NIC not found' (NotFound) error when using Node P... | Known NRP (Network Resource Provider) issue where VM NIC can... | Retry the operation. This is a known intermittent NRP issue ... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Public%20IPTags) |
| 6 | AKS autoscaler triggers false Service Health/Resource Health alerts showing unex... | Autoscaler uses ForceDelete for scaled-down VMSS instances. ... | Verify via VMApiQosEvent (operationName=VirtualMachineScaleS... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | AKS cluster-autoscaler scaled down a Not-Ready node; need to identify which VMSS... | Cluster-autoscaler deletes Not-Ready nodes; VMSS instance na... | 1) Kusto: union AKSccplogs.ControlPlaneEvents+NonShoebox fil... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.5[AKS] H] |
| 8 | Cluster autoscaler fails with 'cannot scale cluster autoscaler enabled node pool... | (1) VMSS attached to cluster was deleted, (2) tags/propertie... | (1) Reconcile node pool via 'az aks nodepool update'; (2) Fi... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-scale-cluster-autoscaler-enabled-node-pool) |
| 9 | AKS cluster scale-up fails with error 'The deployment size has exceeded internal... | Internal VMSS deployment size limit hit during scale-up oper... | Contact AKS PG oncall directly for workaround (PG may adjust... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | Orphaned AKS control plane (CCP) unexpectedly scales up/down VMSS in production ... | AKS uses dns-prefix to generate CCP namespace hash. Reusing ... | 1) Verify orphaned CCP: check user-agent, outbound IP, query... | [Y] 4.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
