# AKS Cluster Autoscaler — vmss -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 10
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Explicitly specify --node-pool-type VirtualMachineScaleSets when creating node pools `[source: onenote]`
2. Check: Check cluster autoscaler logs for "Failed to scale up" or "QuotaExceeded" using Kusto (ControlPlaneE `[source: ado-wiki]`
3. Check: 1) Abort any ongoing AKS operation: az aks operation-abort -n <name> -g <rg> `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-cluster-autoscaler-vmss.md)
