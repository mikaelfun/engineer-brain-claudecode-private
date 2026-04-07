# AKS 私有集群网络 -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 8 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-AzureML-AKS-Extension.md, ado-wiki-a-Dapr-AKS-Extension.md, ado-wiki-a-aks-private-cluster.md, ado-wiki-aks-private-cluster-jumpbox-managed-identity.md, ado-wiki-c-Check-cluster-diagnostic-settings.md, ado-wiki-c-VM-Guest-Agent-and-Extension-Troubleshooting-guideline.md, ado-wiki-multiple-apps-multiple-appgws-1-cluster.md, onenote-aks-workload-protection-defender.md
**Kusto references**: cluster-snapshot.md
**Generated**: 2026-04-07

---

## Phase 1: (1) Authorized IP ranges enabled but client IP not

### aks-1116: Cannot view resources in Kubernetes resource viewer in Azure portal: Unable to r...

**Root Cause**: (1) Authorized IP ranges enabled but client IP not included; (2) AKS is private cluster and portal accessed from non-connected network

**Solution**:
(1) Add portal client IP to --api-server-authorized-ip-ranges; (2) Access Azure portal from network with connectivity to AKS subnet

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-view-resources-kubernetes-resource-viewer-portal)]`

## Phase 2: Customer manually deleted auto-created kube-apiser

### aks-834: AKS cluster Failed with CannotSwitchBetweenAutoAndManualApproval; CreateOrUpdate...

**Root Cause**: Customer manually deleted auto-created kube-apiserver PE and recreated it manually, causing auto/manual approval mode conflict. Manual PE stays pending and blocks reconciliation.

**Solution**:
Delete the pending-state PE, then reconcile cluster (az aks update). kube-apiserver PE will be auto-recreated. Never manually modify/delete kube-apiserver PE.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/CannotSwitchBetweenAutoAndManualApproval)]`

## Phase 3: LA workspace network isolation blocks data ingesti

### aks-873: Microsoft Defender publisher pods crash with 403. Log Analytics workspace has ne...

**Root Cause**: LA workspace network isolation blocks data ingestion from public networks. Defender pods cannot reach the LA endpoint.

**Solution**:
Enable data ingestion through public networks in the Log Analytics workspace Networking settings.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors)]`

## Phase 4: az aks command invoke creates a run-command pod in

### aks-877: az aks command invoke fails with error: Unschedulable - 0/1 nodes are available:...

**Root Cause**: az aks command invoke creates a run-command pod in the aks-command namespace with resource requests of 200m CPU and 500Mi memory. When no node has enough allocatable resources, the pod cannot be scheduled.

**Solution**:
Scale out the node pool or temporarily scale down less important workloads to free up at least 200m CPU and 500Mi memory. Use: az aks nodepool scale --cluster-name <name> --name <pool> --resource-group <rg> --node-count <count>

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2Faz%20aks%20command%20invoke%20fail%20with%20insufficient%20resource)]`

## Phase 5: Azure Policy with privilege escalation constraint 

### aks-881: az aks command invoke fails on private cluster with error: admission webhook val...

**Root Cause**: Azure Policy with privilege escalation constraint is enabled but does NOT exclude the aks-command namespace used by command invoke, causing the run-command pod to be denied by gatekeeper.

**Solution**:
Update Azure Policy to exclude aks-command namespace from the privilege escalation constraint. Portal > Cluster > Policies > Edit definition > add aks-command to namespace exclusions. Or create a policy exemption. Changes take effect within 30 minutes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2Frun%20command%20fails%20on%20private%20clusters)]`

## Phase 6: Known issue with start/stop preview feature on pri

### aks-240: AKS private cluster start/stop (preview) leaves private endpoint in disconnected...

**Root Cause**: Known issue with start/stop preview feature on private clusters. The private endpoint status is not properly updated when the cluster is stopped and restarted.

**Solution**:
Workaround: Delete the private endpoint then reconcile the cluster to recreate it in the correct state.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: API Server VNet Integration was pending on a netwo

### aks-005: API Server VNet Integration (subnet delegation for private API server) is not av...

**Root Cause**: API Server VNet Integration was pending on a networking feature in Mooncake as of mid-2023. Feature landing in Azure China is not confirmed.

**Solution**:
Use private cluster (V1) as an alternative for private API server access. TSG is available. Check latest docs.azure.cn for current support status.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: Customer is trying to set a PLS static IP that is 

### aks-1037: Private Link Service (PLS) provision fails with PrivateIPAddressInUse error when...

**Root Cause**: Customer is trying to set a PLS static IP that is the same as an existing dynamically allocated IP on the PLS NIC.

**Solution**:
Select a different static IP address, or first release the conflicting dynamic IP (if there are multiple) and then re-specify the desired static IP.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Private%20Link%20Service%20for%20AKS%20Load%20Balancers)]`

## Phase 9: Customer Azure Policy denies creation of privateLi

### aks-998: AKS extension creation (e.g., backup) fails with RequestDisallowedByPolicy targe...

**Root Cause**: Customer Azure Policy denies creation of privateLinkScopes resource in MC_ resource group. When enabling AKS extensions, an extension-pls privateLinkScopes object is automatically created and gets blocked by deny policy.

**Solution**:
Two options: 1) Add policy exception/exclusion for AKS MC_ resource group to allow Microsoft.KubernetesConfiguration/privateLinkScopes. 2) Disable/modify the deny policy. Verify with ARM Kusto query filtering EventServiceEntries by subscriptionId and RequestDisallowedByPolicy.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FRequestDisallowedByPolicy_extension%20pls)]`

---

## Known Issues Quick Reference

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
