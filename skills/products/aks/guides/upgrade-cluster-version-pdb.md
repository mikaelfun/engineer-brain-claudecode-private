# AKS 集群版本升级 — pdb -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 10
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS version upgrade blocked by PodDisruptionBudget (PDB) settings; hangs during ... | PDB with minAvailable too high or maxUnavailable=0 prevents ... | Adjust PDB: set maxUnavailable >= 1 or lower minAvailable. O... | [G] 10.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 2 | AKS cluster upgrade or nodepool operations fail with PodDrainFailure error: 'Sca... | Pod Disruption Budgets (PDBs) with AllowedDisruptions=0 prev... | Option 1: Back up (kubectl get pdb -o yaml) and delete the b... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail) |
| 3 | AKS upgrade operation taking unusually long time, nodes are being drained very s... | The nodepool's node drain timeout is set to a high custom va... | 1) Check ASC Agent Pools tab for custom drain timeout value;... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Drain%20Timeout) |
| 4 | OSSKU Migration fails due to Pod Disruption Budget blocking node drain during up... | Customer's PDB is too restrictive for the upgrade surge capa... | Refine PDBs following Azure best practices to allow AKS upgr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
| 5 | AKS node upgrade fails or hangs due to nodes that cannot be drained (e.g., PDB p... | Default AKS upgrade drain failure behavior is Schedule mode:... | Use the new Cordon behavior (preview): configure upgrade to ... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS cluster upgrade is very slow, taking hours for large clusters | Default max-surge value is 1 (one new node at a time), causi... | Increase max-surge per node pool: az aks nodepool update --m... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide) |
| 7 | AKS cluster upgrade fails with UpgradeFailed/PodDrainFailure: Drain node failed ... | PDB policy too restrictive - minAvailable equals current rep... | Three options: (1) Adjust PDB so ALLOWED DISRUPTIONS >= 1. (... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-poddrainfailure) |
| 8 | AKS upgrade fails: UpgradeFailed - Evict blocked by conflicting disruption budge... | Pod covered by multiple PDBs; Kubernetes eviction API does n... | Identify conflicting PDBs via kubectl get pdb -n <ns> -o wid... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-eviction-autoscaler) |
| 9 | AKS cluster upgrade fails with PodDisruptionBudget (PDB) blocking the upgrade pr... | Since AKS release 2020-11-30 upgrades are blocked if PDB pre... | 1) Review and temporarily relax PDB settings before upgrade.... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | AKS cluster upgrade fails with UnsatisfiablePDB error — PDB has maxUnavailable =... | Pod Disruption Budget (PDB) with maxUnavailable=0 blocks nod... | Set PDB maxUnavailable to 1 or greater, or backup/delete the... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/unsatisfiablepdb-error) |

## Quick Troubleshooting Path

1. Check: Adjust PDB: set maxUnavailable >= 1 or lower minAvailable `[source: onenote]`
2. Check: Option 1: Back up (kubectl get pdb -o yaml) and delete the blocking PDB, re-run upgrade, restore PDB `[source: ado-wiki]`
3. Check: 1) Check ASC Agent Pools tab for custom drain timeout value; 2) Use Kusto query joining AsyncContext `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-pdb.md)
