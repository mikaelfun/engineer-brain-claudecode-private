# AKS Cluster Autoscaler — general -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Free Tier cluster control plane pod replicas drop to 0; controllers take lon... | AKS Free Tier does not guarantee high availability for contr... | 1) Upgrade to Standard or Premium tier for HA guarantee; 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FFree%20Tier%20Replica%20Reduction) |
| 2 | AKS ML application pods scale uncontrollably (e.g. from max to 96 replicas in sh... | Confirmed bug in azureml-fe V1 extension. The ML V1 frontend... | 1) Short-term: Restart all azureml-fe pods to restore normal... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG) |
| 3 | AKS node pool deletion fails with 'Cannot evict pod as it would violate the pod'... | Pod Disruption Budget (PDB) is configured so that minAvailab... | 1) Identify blocking PDB: kubectl get pdb -n <namespace>, ch... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAgentPool%20delete%20with%20ignore%20PDB) |
| 4 | AKS cluster stuck in Starting state or autoscaler scale-up creates VMSS instance... | vmssCSE (Custom Script Extension) was removed from VMSS of t... | 1) Abort ongoing operation: az aks operation-abort. 2) Confi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted) |
| 5 | AKS cluster has duplicate control planes (multiple CCPs). Symptoms include: dupl... | Rapidly deleting and creating an AKS cluster with the same n... | Escalate to AKS PG via IcM mentioning duplicate control plan... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FDuplicate%20cluster%20control%20planes) |
| 6 | AKS cluster with KMS etcd encryption and private Key Vault enters deadlock after... | Deadlock: API server needs KMS keys from private Key Vault (... | Upgrade to API Server VNet Integration (eliminates konnectiv... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/KMS%20konnectivity) |
| 7 | AKS scale-up creates nodes but nodes are not properly bootstrapped; scale operat... | AKS backend service bug: a service restart occurred while pr... | Service bug confirmed and fixed by PG in subsequent release.... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Upgrade to Standard or Premium tier for HA guarantee; 2) If upgrade not feasible: check resource  `[source: ado-wiki]`
2. Check: 1) Short-term: Restart all azureml-fe pods to restore normal scaling behavior `[source: ado-wiki]`
3. Check: 1) Identify blocking PDB: kubectl get pdb -n <namespace>, check DisruptionsAllowed=0 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-cluster-autoscaler-general.md)
