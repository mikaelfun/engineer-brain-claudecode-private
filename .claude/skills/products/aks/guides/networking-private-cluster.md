# AKS 私有集群网络 -- Quick Reference

**Sources**: 4 | **21V**: Partial | **Entries**: 9
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot view resources in Kubernetes resource viewer in Azure portal: Unable to r... | (1) Authorized IP ranges enabled but client IP not included;... | (1) Add portal client IP to --api-server-authorized-ip-range... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-view-resources-kubernetes-resource-viewer-portal) |
| 2 | AKS cluster Failed with CannotSwitchBetweenAutoAndManualApproval; CreateOrUpdate... | Customer manually deleted auto-created kube-apiserver PE and... | Delete the pending-state PE, then reconcile cluster (az aks ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/CannotSwitchBetweenAutoAndManualApproval) |
| 3 | Microsoft Defender publisher pods crash with 403. Log Analytics workspace has ne... | LA workspace network isolation blocks data ingestion from pu... | Enable data ingestion through public networks in the Log Ana... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors) |
| 4 | az aks command invoke fails with error: Unschedulable - 0/1 nodes are available:... | az aks command invoke creates a run-command pod in the aks-c... | Scale out the node pool or temporarily scale down less impor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2Faz%20aks%20command%20invoke%20fail%20with%20insufficient%20resource) |
| 5 | az aks command invoke fails on private cluster with error: admission webhook val... | Azure Policy with privilege escalation constraint is enabled... | Update Azure Policy to exclude aks-command namespace from th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2Frun%20command%20fails%20on%20private%20clusters) |
| 6 | AKS private cluster start/stop (preview) leaves private endpoint in disconnected... | Known issue with start/stop preview feature on private clust... | Workaround: Delete the private endpoint then reconcile the c... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | API Server VNet Integration (subnet delegation for private API server) is not av... | API Server VNet Integration was pending on a networking feat... | Use private cluster (V1) as an alternative for private API s... | [B] 5.5 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | Private Link Service (PLS) provision fails with PrivateIPAddressInUse error when... | Customer is trying to set a PLS static IP that is the same a... | Select a different static IP address, or first release the c... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Private%20Link%20Service%20for%20AKS%20Load%20Balancers) |
| 9 | AKS extension creation (e.g., backup) fails with RequestDisallowedByPolicy targe... | Customer Azure Policy denies creation of privateLinkScopes r... | Two options: 1) Add policy exception/exclusion for AKS MC_ r... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FRequestDisallowedByPolicy_extension%20pls) |

## Quick Troubleshooting Path

1. Check: (1) Add portal client IP to --api-server-authorized-ip-ranges; (2) Access Azure portal from network  `[source: mslearn]`
2. Check: Delete the pending-state PE, then reconcile cluster (az aks update) `[source: ado-wiki]`
3. Check: Enable data ingestion through public networks in the Log Analytics workspace Networking settings `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-private-cluster.md)
