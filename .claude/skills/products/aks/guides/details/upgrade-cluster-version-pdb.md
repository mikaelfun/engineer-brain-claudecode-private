# AKS 集群版本升级 — pdb -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 1 | **Kusto queries**: 3
**Source drafts**: ado-wiki-b-maxUnavailable-Setting.md
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: PDB with minAvailable too high or maxUnavailable=0

### aks-221: AKS version upgrade blocked by PodDisruptionBudget (PDB) settings; hangs during ...

**Root Cause**: PDB with minAvailable too high or maxUnavailable=0 prevents node drain during upgrade

**Solution**:
Adjust PDB: set maxUnavailable >= 1 or lower minAvailable. Or temporarily delete PDB during upgrade

`[Score: [G] 10.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 2: Pod Disruption Budgets (PDBs) with AllowedDisrupti

### aks-825: AKS cluster upgrade or nodepool operations fail with PodDrainFailure error: 'Sca...

**Root Cause**: Pod Disruption Budgets (PDBs) with AllowedDisruptions=0 prevent pods from draining off nodes pending upgrade. When replica count <= PDB minAvailable, draining a node would violate the PDB constraint.

**Solution**:
Option 1: Back up (kubectl get pdb -o yaml) and delete the blocking PDB, re-run upgrade, restore PDB after. Option 2 (production): Scale up deployment/statefulset replica count (kubectl scale deploy --replicas N) to allow disruptions, re-run upgrade, scale back.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail)]`

## Phase 3: The nodepool's node drain timeout is set to a high

### aks-916: AKS upgrade operation taking unusually long time, nodes are being drained very s...

**Root Cause**: The nodepool's node drain timeout is set to a high custom value. When specified, AKS respects waiting on pod disruption budgets for the configured duration (in minutes). Default is 30 minutes if not set.

**Solution**:
1) Check ASC Agent Pools tab for custom drain timeout value; 2) Use Kusto query joining AsyncContextActivity with LatencyTraceEvent on spanID to check exact drain start/end times per node; 3) If timeout is too high, customer can lower it via CLI/API.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Drain%20Timeout)]`

## Phase 4: Customer's PDB is too restrictive for the upgrade 

### aks-934: OSSKU Migration fails due to Pod Disruption Budget blocking node drain during up...

**Root Cause**: Customer's PDB is too restrictive for the upgrade surge capacity, preventing AKS from draining nodes to update them during the OSSKU migration (which follows node image upgrade flow).

**Solution**:
Refine PDBs following Azure best practices to allow AKS upgrade operations. Ensure PDB minAvailable/maxUnavailable allows at least one node to be drained with the configured surge capacity.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration)]`

## Phase 5: Default AKS upgrade drain failure behavior is Sche

### aks-184: AKS node upgrade fails or hangs due to nodes that cannot be drained (e.g., PDB p...

**Root Cause**: Default AKS upgrade drain failure behavior is Schedule mode: if a node cannot be drained, the upgrade operation fails and undrained nodes remain schedulable. This can block upgrades when PodDisruptionBudgets or other constraints prevent pod eviction.

**Solution**:
Use the new Cordon behavior (preview): configure upgrade to skip undrained nodes by quarantining them with label kubernetes.azure.com/upgrade-status:Quarantined and proceed with upgrading remaining nodes. See https://learn.microsoft.com/en-us/azure/aks/upgrade-cluster. After upgrade, troubleshoot quarantined nodes separately.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Default max-surge value is 1 (one new node at a ti

### aks-1143: AKS cluster upgrade is very slow, taking hours for large clusters

**Root Cause**: Default max-surge value is 1 (one new node at a time), causing sequential node replacement across the entire cluster.

**Solution**:
Increase max-surge per node pool: az aks nodepool update --max-surge 5. Check PDB settings. Avoid B-series VMs in system nodepool.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide)]`

## Phase 7: PDB policy too restrictive - minAvailable equals c

### aks-1162: AKS cluster upgrade fails with UpgradeFailed/PodDrainFailure: Drain node failed ...

**Root Cause**: PDB policy too restrictive - minAvailable equals current replica count, ALLOWED DISRUPTIONS=0. Pods resist eviction during node drain, upgrade fails, cluster enters Failed state.

**Solution**:
Three options: (1) Adjust PDB so ALLOWED DISRUPTIONS >= 1. (2) Backup and delete PDB, upgrade, reapply. (3) Scale workload to 0, upgrade, scale back. Reconcile with az aks upgrade to same version.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-poddrainfailure)]`

## Phase 8: Pod covered by multiple PDBs; Kubernetes eviction 

### aks-1259: AKS upgrade fails: UpgradeFailed - Evict blocked by conflicting disruption budge...

**Root Cause**: Pod covered by multiple PDBs; Kubernetes eviction API does not support evicting pods matched by more than one PDB, blocking node drain

**Solution**:
Identify conflicting PDBs via kubectl get pdb -n <ns> -o wide; delete one conflicting PDB so each pod is covered by at most one; reconcile and retry upgrade. Consider using Eviction Autoscaler extension for automatic PDB management

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-eviction-autoscaler)]`

## Phase 9: Since AKS release 2020-11-30 upgrades are blocked 

### aks-241: AKS cluster upgrade fails with PodDisruptionBudget (PDB) blocking the upgrade pr...

**Root Cause**: Since AKS release 2020-11-30 upgrades are blocked if PDB prevents pod eviction. Previously upgrades would proceed regardless of PDB.

**Solution**:
1) Review and temporarily relax PDB settings before upgrade. 2) Ensure PDB allows at least one pod to be evicted. 3) Check AKS release notes for PDB-related changes.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 10: Pod Disruption Budget (PDB) with maxUnavailable=0 

### aks-1203: AKS cluster upgrade fails with UnsatisfiablePDB error — PDB has maxUnavailable =...

**Root Cause**: Pod Disruption Budget (PDB) with maxUnavailable=0 blocks node drain operations required for cluster upgrade

**Solution**:
Set PDB maxUnavailable to 1 or greater, or backup/delete the PDB before upgrade and redeploy it after upgrade succeeds

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/unsatisfiablepdb-error)]`

---

## Known Issues Quick Reference

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
