# AKS CRUD 操作与 Failed State 恢复 — failed-state -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Check AppLens for pre-deletion logs `[source: ado-wiki]`
2. Check: Disable monitoring addon via CLI: az aks disable-addons -a monitoring `[source: ado-wiki]`
3. Check: Delete old ARM deployments from the MC_ resource group to free quota `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/crud-reconcile-failedstate-failed-state.md)
