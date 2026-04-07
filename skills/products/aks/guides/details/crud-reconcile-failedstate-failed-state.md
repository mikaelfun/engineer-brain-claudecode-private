# AKS CRUD 操作与 Failed State 恢复 — failed-state -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-reconcile-managed-cluster-failed-state.md, ado-wiki-a-serial-access-console-when-jarvis-failing.md, ado-wiki-a-test-traffic-jarvis-vfp.md, ado-wiki-acr-jarvis-actions.md
**Generated**: 2026-04-07

---

## Phase 1: Customer deleted the cluster before support could 

### aks-619: Customer reports AKS cluster in failed state; ASC shows (deleted) next to cluste...

**Root Cause**: Customer deleted the cluster before support could investigate the reported issue

**Solution**:
Check AppLens for pre-deletion logs. Inform customer cluster was deleted and cannot be recovered. If issue recurs with new cluster, request: cluster name, resource group, subscription ID, reproduction steps (Portal/CLI/PowerShell/CloudShell), error details, screenshots, and business impact.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FCustomer%20Deletes%20Cluster)]`

## Phase 2: Log Analytics workspace or its resource group was 

### aks-776: AKS cluster enters Failed state with errors referencing Log Analytics workspace:...

**Root Cause**: Log Analytics workspace or its resource group was deleted, or workspace key is invalid. The monitoring addon cannot reconcile, causing cluster provisioning failure

**Solution**:
Disable monitoring addon via CLI: az aks disable-addons -a monitoring. Then re-enable through Azure Portal with a valid LA workspace

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 3: ARM deployment history limit (800 per resource gro

### aks-779: AKS operations fail with DeploymentQuotaExceeded - creating deployment would exc...

**Root Cause**: ARM deployment history limit (800 per resource group) reached in the MC_ resource group

**Solution**:
Delete old ARM deployments from the MC_ resource group to free quota. Can self-service via Azure Portal Quota blade or delete deployments via CLI

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 4: The Log Analytics workspace referenced by the AKS 

### aks-791: AKS cluster enters Failed state due to Log Analytics workspace errors: Unable to...

**Root Cause**: The Log Analytics workspace referenced by the AKS monitoring addon was deleted, moved, or has incorrect workspace key/configuration

**Solution**:
Disable the monitoring addon via Azure CLI (az aks disable-addons --addons monitoring), then re-enable it through Azure Portal with a valid workspace

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 5: The Log Analytics workspace or its resource group 

### aks-967: AKS cluster enters Failed state with errors referencing Log Analytics workspace:...

**Root Cause**: The Log Analytics workspace or its resource group referenced by the monitoring addon was deleted, moved, or misconfigured.

**Solution**:
Disable the monitoring addon via Azure CLI (az aks disable-addons -a monitoring), then re-enable it through Azure Portal pointing to a valid workspace.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 6: Resource locks (CanNotDelete or ReadOnly) applied 

### aks-969: AKS cluster operations fail with ScopeLocked error: cannot perform delete/write ...

**Root Cause**: Resource locks (CanNotDelete or ReadOnly) applied to the AKS managed resource group (MC_*) or associated resources prevent AKS from modifying underlying IaaS resources.

**Solution**:
Remove the corresponding resource locks from the MC_ resource group and associated resources, then retry the AKS operation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 7: The monitoring add-on failed to add the ContainerI

### aks-012: AKS cluster enters 'Failed' state after enabling Azure Monitor for containers (m...

**Root Cause**: The monitoring add-on failed to add the ContainerInsights solution to the Log Analytics workspace ('unable to add ContainerInsights solution to the workspace'). This often occurs when the required resource provider (Microsoft.OperationsManagement or Microsoft.OperationalInsights) is not registered in the subscription.

**Solution**:
1) Use Kusto query on AsyncContextActivity to identify the exact failure reason. 2) Disable monitoring add-on: az aks disable-addons --addons monitoring --name <cluster> --resource-group <rg>. 3) Register the required resource provider: az provider register --namespace Microsoft.OperationsManagement. 4) Re-enable monitoring after provider is registered.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 8: The AksLinuxBilling VM extension on one of the age

### aks-174: AKS cluster stuck in Failed state due to failed VM Extension AksLinuxBilling; pr...

**Root Cause**: The AksLinuxBilling VM extension on one of the agent nodes failed or timed out during deployment, causing the entire cluster to enter a Failed provisioning state.

**Solution**:
After the extension recovers to healthy state, reset the cluster: 1) Go to resources.azure.com 2) Navigate to the AKS cluster resource 3) Perform GET then PUT to reconcile the cluster state.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 9: A transient platform issue (e.g., CRP timeout, API

### aks-279: AKS cluster is stuck in Failed or Updating provisioning state after a transient ...

**Root Cause**: A transient platform issue (e.g., CRP timeout, API intermittent failure, networking blip) caused the cluster operation to fail, leaving the cluster current state inconsistent with the desired goal state.

**Solution**:
Reconcile the cluster to realign current state with goal state. Customer self-service methods: 1) az aks upgrade --kubernetes-version <SAME-current-version> (most reliable), 2) az resource update --ids <AKS-resource-id>. If customer cannot self-serve, support engineer can use Jarvis escort + reconcile action. Note: reconcile will not recreate resources already in goal state; no side effects on healthy workloads.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer reports AKS cluster in failed state; ASC shows (deleted) next to cluste... | Customer deleted the cluster before support could investigat... | Check AppLens for pre-deletion logs. Inform customer cluster... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FOn%20Going%20Cases%2FExample%20Scenario%20Based%20Responses%2FCustomer%20Deletes%20Cluster) |
| 2 | AKS cluster enters Failed state with errors referencing Log Analytics workspace:... | Log Analytics workspace or its resource group was deleted, o... | Disable monitoring addon via CLI: az aks disable-addons -a m... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 3 | AKS operations fail with DeploymentQuotaExceeded - creating deployment would exc... | ARM deployment history limit (800 per resource group) reache... | Delete old ARM deployments from the MC_ resource group to fr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 4 | AKS cluster enters Failed state due to Log Analytics workspace errors: Unable to... | The Log Analytics workspace referenced by the AKS monitoring... | Disable the monitoring addon via Azure CLI (az aks disable-a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 5 | AKS cluster enters Failed state with errors referencing Log Analytics workspace:... | The Log Analytics workspace or its resource group referenced... | Disable the monitoring addon via Azure CLI (az aks disable-a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State) |
| 6 | AKS cluster operations fail with ScopeLocked error: cannot perform delete/write ... | Resource locks (CanNotDelete or ReadOnly) applied to the AKS... | Remove the corresponding resource locks from the MC_ resourc... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State) |
| 7 | AKS cluster enters 'Failed' state after enabling Azure Monitor for containers (m... | The monitoring add-on failed to add the ContainerInsights so... | 1) Use Kusto query on AsyncContextActivity to identify the e... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 8 | AKS cluster stuck in Failed state due to failed VM Extension AksLinuxBilling; pr... | The AksLinuxBilling VM extension on one of the agent nodes f... | After the extension recovers to healthy state, reset the clu... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 9 | AKS cluster is stuck in Failed or Updating provisioning state after a transient ... | A transient platform issue (e.g., CRP timeout, API intermitt... | Reconcile the cluster to realign current state with goal sta... | [B] 6.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
