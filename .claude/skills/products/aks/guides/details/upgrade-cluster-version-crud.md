# AKS 集群版本升级 — crud -- Comprehensive Troubleshooting Guide

**Entries**: 14 | **Draft sources**: 1 | **Kusto queries**: 3
**Source drafts**: ado-wiki-a-ignore-pdb-on-delete.md
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Customer subscription has exceeded its CPU core qu

### aks-770: AKS cluster create/deploy/scale fails with QuotaExceeded - Operation results in ...

**Root Cause**: Customer subscription has exceeded its CPU core quota for the region. The required VMs for the operation exceed the allowed core count.

**Solution**:
Customer should request a CPU core quota increase via Azure Portal. After quota increase, retry the operation. For upgrades, if portal shows upgraded version but operation failed mid-way, re-run upgrade via CLI. Confirm via ASC subscription quotas view or AKSprod Kusto tables.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuota%20limits%20are%20exceeded)]`

## Phase 2: Custom VM extensions were manually installed on th

### aks-773: AKS node pool operations (scale, upgrade, reconcile) fail with VMExtensionHandle...

**Root Cause**: Custom VM extensions were manually installed on the AKS node pool VMSS outside of AKS control. AKS cannot validate or maintain these extensions, causing non-retriable reconcile failures that block all CRUD operations on the affected node pool.

**Solution**:
1) Identify unsupported VM extensions on the VMSS (check AppLens detector or Azure Portal VMSS Extensions). 2) Remove extensions directly from VMSS (Portal/CLI/ARM). 3) Perform node pool reconcile or retry failed operation. 4) If removal not possible, recreate node pool without the extension. Prevention: never manually install VM extensions on AKS VMSS.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions)]`

## Phase 3: Resource locks (CanNotDelete/ReadOnly) applied to 

### aks-781: AKS cluster enters Failed state with ScopeLocked during upgrade/scale - cannot p...

**Root Cause**: Resource locks (CanNotDelete/ReadOnly) applied to nodes, disks, or other resources in the MC_ managed resource group prevent AKS from managing its infrastructure

**Solution**:
Remove or temporarily disable resource locks on the MC_ resource group and its resources, then retry the AKS operation. Locks on MC_ group are not recommended

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State)]`

## Phase 4: Customer manually resized VMSS OS disks at the Iaa

### aks-783: AKS upgrade fails with CreateVMSSAgentPoolFailed - 'Cannot complete the operatio...

**Root Cause**: Customer manually resized VMSS OS disks at the IaaS/VMSS level, creating discrepancy between AKS control plane expected disk size and actual VMSS disk size. Manual VMSS changes are unsupported

**Solution**:
1) Identify affected node pools by running per-nodepool upgrade; 2) Compare AKS config vs CRP config via Jarvis/SAW; 3) Delete and recreate affected node pools with correct disk size via az CLI; 4) Re-run upgrade

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Disk%20size%20mismatch%20causes%20upgrade%20failures)]`

## Phase 5: Another operation is already in progress or the cl

### aks-784: AKS cluster update or delete fails with EtagMismatch - 'Operation is not allowed...

**Root Cause**: Another operation is already in progress or the cluster resource entered an inconsistent state due to previous failed operations, causing etag mismatch

**Solution**:
1) Reconcile the cluster: az resource update --ids <AKS cluster resource ID>; 2) If fails, attempt reconcile via Geneva action (SAW required); 3) If persists, file IcM to AKS PG

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/EtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster)]`

## Phase 6: AKS upgrades recreate nodes. Taints applied manual

### aks-785: After AKS upgrade, pods schedule on unintended node pools. Custom taints previou...

**Root Cause**: AKS upgrades recreate nodes. Taints applied manually at the node level (kubectl taint) are not persisted and are lost when nodes are replaced. Only nodepool-level taints survive upgrades

**Solution**:
1) Set taints at node pool level: az aks nodepool update --node-taints workload=restricted:NoSchedule; 2) Verify pod tolerations match; 3) Add nodeSelector/nodeAffinity for deterministic placement; 4) Always configure taints at nodepool level before future upgrades

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Lost%20Taint%20After%20Upgrade)]`

## Phase 7: Tolerations only ALLOW pods to schedule on tainted

### aks-786: After AKS upgrade, pods unexpectedly schedule onto system or untainted node pool...

**Root Cause**: Tolerations only ALLOW pods to schedule on tainted nodes but do NOT force or prefer placement. Without nodeSelector or nodeAffinity, the scheduler may place pods on any eligible untainted node

**Solution**:
Use BOTH tolerations AND nodeSelector/nodeAffinity: 1) Define matching toleration for target nodepool taint; 2) Add nodeSelector (agentpool: workloadpool) or nodeAffinity to enforce placement

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Misunderstanding%20tolerations%20behavior)]`

## Phase 8: Pod Disruption Budgets (PDBs) with AllowedDisrupti

### aks-812: AKS cluster upgrade or nodepool scaling fails with PodDrainFailure: Drain did no...

**Root Cause**: Pod Disruption Budgets (PDBs) with AllowedDisruptions=0 prevent pods from being evicted during node drain. Occurs when PDB minAvailable threshold cannot be satisfied given current replica count and cluster topology.

**Solution**:
Option 1: Delete blocking PDB temporarily (backup with kubectl get pdb -o yaml, delete, upgrade, restore). Option 2: Scale up deployment/statefulset replicas so PDB allows disruptions, upgrade, then scale back. After mitigation, restart upgrade if not in-progress.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail)]`

## Phase 9: A resource lock (CanNotDelete or ReadOnly) is pres

### aks-813: AKS cluster upgrade, scaling, nodepool create/delete fails with ScopeLocked erro...

**Root Cause**: A resource lock (CanNotDelete or ReadOnly) is present on the MC_ managed resource group or individual resources within it. AKS lifecycle operations require modifying resources in MC_ RG, and the lock blocks these operations.

**Solution**:
Remove the resource lock from MC_ resource group or the specific locked resource via Azure Portal, CLI (az lock delete), or PowerShell. After removing the lock, re-run the failed operation. Advise customer not to place locks on MC_ managed resource group.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations)]`

## Phase 10: Customer deleted the Log Analytics Workspace or it

### aks-814: AKS upgrade or scale fails with Unable to get log analytics workspace info. Reso...

**Root Cause**: Customer deleted the Log Analytics Workspace or its containing Resource Group without first disabling the monitoring (omsagent) addon on the AKS cluster. The AKS control plane still references the workspace and fails when it cannot find it.

**Solution**:
Mitigation 1 (within 14 days): Recover soft-deleted workspace using PowerShell New-AzOperationalInsightsWorkspace with same name/RG/region. Mitigation 2 (after 14 days): Disable monitoring addon (az aks disable-addons -a monitoring). Mitigation 3: If disable-addons fails, recreate the missing workspace from Portal with same resource ID. Then retry the operation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found)]`

### aks-978: AKS update/upgrade operations fail with Unable to get log analytics workspace in...

**Root Cause**: Customer deleted the Log Analytics Workspace or its resource group without first disabling the AKS monitoring addon (omsagent). AKS control plane tries to access the workspace during operations and fails.

**Solution**:
Mitigation 1 (deleted <14 days): Recover workspace using New-AzOperationalInsightsWorkspace with same name/region/RG. Mitigation 2 (>14 days): Disable monitoring addon: az aks disable-addons -a monitoring. Mitigation 3: Recreate the missing LA workspace from Portal, then retry.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found)]`

## Phase 11: Unsupported VM extensions manually installed on AK

### aks-964: AKS node pool operations (scale/upgrade/reconcile) fail with VMExtensionHandlerN...

**Root Cause**: Unsupported VM extensions manually installed on AKS VMSS outside AKS control. AKS cannot validate/maintain extension state, causing non-retriable reconcile failures

**Solution**:
1) Identify unsupported extensions on VMSS (AppLens detector available) 2) Remove extensions from VMSS via Portal/CLI/ARM 3) Reconcile or retry failed operation 4) If removal impossible, recreate nodepool. Prevention: never manually install VM extensions on AKS VMSS

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions)]`

## Phase 12: Pod Disruption Budget (PDB) with AllowedDisruption

### aks-976: AKS cluster upgrade or nodepool scaling fails with PodDrainFailure error: Drain ...

**Root Cause**: Pod Disruption Budget (PDB) with AllowedDisruptions=0 prevents pods from draining off nodes during upgrade. If deployment replica count <= minAvailable in PDB, draining a single node violates the PDB constraint.

**Solution**:
Option 1: Back up PDB (kubectl get pdb -n <ns> -o yaml > backup.yaml), delete PDB, complete upgrade, restore PDB. Option 2: Scale up deployment/statefulset replicas so PDB allows disruptions during drain. After upgrade, scale back. Restart upgrade via original workflow or Jarvis reconcile.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail)]`

## Phase 13: A resource lock (CanNotDelete or ReadOnly) exists 

### aks-977: AKS cluster upgrade/scale/nodepool operations fail with ScopeLocked error: The s...

**Root Cause**: A resource lock (CanNotDelete or ReadOnly) exists on the MC_ node resource group or individual infrastructure resources, preventing AKS RP from modifying resources during operations.

**Solution**:
Remove the resource lock from the MC_ resource group or individual locked resources via Azure Portal, CLI (az lock delete), or PowerShell. Then retry the failed operation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster create/deploy/scale fails with QuotaExceeded - Operation results in ... | Customer subscription has exceeded its CPU core quota for th... | Customer should request a CPU core quota increase via Azure ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuota%20limits%20are%20exceeded) |
| 2 | AKS node pool operations (scale, upgrade, reconcile) fail with VMExtensionHandle... | Custom VM extensions were manually installed on the AKS node... | 1) Identify unsupported VM extensions on the VMSS (check App... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions) |
| 3 | AKS cluster enters Failed state with ScopeLocked during upgrade/scale - cannot p... | Resource locks (CanNotDelete/ReadOnly) applied to nodes, dis... | Remove or temporarily disable resource locks on the MC_ reso... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 4 | AKS upgrade fails with CreateVMSSAgentPoolFailed - 'Cannot complete the operatio... | Customer manually resized VMSS OS disks at the IaaS/VMSS lev... | 1) Identify affected node pools by running per-nodepool upgr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Disk%20size%20mismatch%20causes%20upgrade%20failures) |
| 5 | AKS cluster update or delete fails with EtagMismatch - 'Operation is not allowed... | Another operation is already in progress or the cluster reso... | 1) Reconcile the cluster: az resource update --ids <AKS clus... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/EtagMismatch%20error%20when%20updating%20or%20deleting%20AKS%20cluster) |
| 6 | After AKS upgrade, pods schedule on unintended node pools. Custom taints previou... | AKS upgrades recreate nodes. Taints applied manually at the ... | 1) Set taints at node pool level: az aks nodepool update --n... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Lost%20Taint%20After%20Upgrade) |
| 7 | After AKS upgrade, pods unexpectedly schedule onto system or untainted node pool... | Tolerations only ALLOW pods to schedule on tainted nodes but... | Use BOTH tolerations AND nodeSelector/nodeAffinity: 1) Defin... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Misunderstanding%20tolerations%20behavior) |
| 8 | AKS cluster upgrade or nodepool scaling fails with PodDrainFailure: Drain did no... | Pod Disruption Budgets (PDBs) with AllowedDisruptions=0 prev... | Option 1: Delete blocking PDB temporarily (backup with kubec... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail) |
| 9 | AKS cluster upgrade, scaling, nodepool create/delete fails with ScopeLocked erro... | A resource lock (CanNotDelete or ReadOnly) is present on the... | Remove the resource lock from MC_ resource group or the spec... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations) |
| 10 | AKS upgrade or scale fails with Unable to get log analytics workspace info. Reso... | Customer deleted the Log Analytics Workspace or its containi... | Mitigation 1 (within 14 days): Recover soft-deleted workspac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found) |
| 11 | AKS node pool operations (scale/upgrade/reconcile) fail with VMExtensionHandlerN... | Unsupported VM extensions manually installed on AKS VMSS out... | 1) Identify unsupported extensions on VMSS (AppLens detector... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions) |
| 12 | AKS cluster upgrade or nodepool scaling fails with PodDrainFailure error: Drain ... | Pod Disruption Budget (PDB) with AllowedDisruptions=0 preven... | Option 1: Back up PDB (kubectl get pdb -n <ns> -o yaml > bac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FPod%20Disruption%20Budgets%20cause%20nodepool%20operations%20to%20fail) |
| 13 | AKS cluster upgrade/scale/nodepool operations fail with ScopeLocked error: The s... | A resource lock (CanNotDelete or ReadOnly) exists on the MC_... | Remove the resource lock from the MC_ resource group or indi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FResource%20locks%20block%20cluster%20operations) |
| 14 | AKS update/upgrade operations fail with Unable to get log analytics workspace in... | Customer deleted the Log Analytics Workspace or its resource... | Mitigation 1 (deleted <14 days): Recover workspace using New... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FUpgrade%20or%20Scale%20failed%20due%20to%20Log%20Analytics%20Workspace%20not%20found) |
