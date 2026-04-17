# AKS Cluster Autoscaler — general -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 2 | **Kusto queries**: 3
**Source drafts**: ado-wiki-a-CAS-Scaling-Conditions.md, ado-wiki-b-HPA-not-scaling-pods.md
**Kusto references**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS Free Tier does not guarantee high availability

### aks-505: AKS Free Tier cluster control plane pod replicas drop to 0; controllers take lon...

**Root Cause**: AKS Free Tier does not guarantee high availability for control plane. With only 1 replica, AZ-down events, resource constraints, control plane upgrades (rolling restarts), or CCP component crashes can cause all replicas to go to 0 with slow recovery.

**Solution**:
1) Upgrade to Standard or Premium tier for HA guarantee; 2) If upgrade not feasible: check resource usage in cluster, verify control plane upgrade status via ASI query, check KubeDeploymentStatusReplicasAvailable metrics; 3) Monitor via CCP Global Health Jarvis dashboard and ASI AKS Alert Instance for KubeControllerManagerDown/KubeSchedulerDown alerts.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FFree%20Tier%20Replica%20Reduction)]`

## Phase 2: Confirmed bug in azureml-fe V1 extension. The ML V

### aks-534: AKS ML application pods scale uncontrollably (e.g. from max to 96 replicas in sh...

**Root Cause**: Confirmed bug in azureml-fe V1 extension. The ML V1 frontend (azureml-fe) scales application deployments too aggressively due to a defect in the scaling logic. V1 is deprecated and no fix will be provided.

**Solution**:
1) Short-term: Restart all azureml-fe pods to restore normal scaling behavior. 2) Long-term: Upgrade to V2 extension (azureml-fe-v2). Engage ML team for architecture migration support. To identify V1 vs V2: check if pod name prefix is azureml-fe (V1) or azureml-fe-v2 (V2) via kube-audit logs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG)]`

## Phase 3: Pod Disruption Budget (PDB) is configured so that 

### aks-593: AKS node pool deletion fails with 'Cannot evict pod as it would violate the pod'...

**Root Cause**: Pod Disruption Budget (PDB) is configured so that minAvailable equals total healthy pod count (or only one replica exists). During node pool delete, AKS must cordon+drain each node; if any pod cannot be evicted due to PDB violation (disruptionsAllowed=0), the drain fails and the entire nodepool deletion is blocked.

**Solution**:
1) Identify blocking PDB: kubectl get pdb -n <namespace>, check DisruptionsAllowed=0. 2) Options: a) Scale up the workload so disruptions are allowed, b) Relax the PDB (lower minAvailable or increase maxUnavailable), c) Use --ignore-pdb flag: az aks nodepool delete --resource-group <rg> --cluster-name <cluster> --name <nodepool> --ignore-pdb (accepts risk of temporary workload disruption). Doc: https://learn.microsoft.com/en-us/cli/azure/aks/nodepool#az-aks-nodepool-delete

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAgentPool%20delete%20with%20ignore%20PDB)]`

## Phase 4: vmssCSE (Custom Script Extension) was removed from

### aks-767: AKS cluster stuck in Starting state or autoscaler scale-up creates VMSS instance...

**Root Cause**: vmssCSE (Custom Script Extension) was removed from VMSS of the affected nodepool(s). Without vmssCSE, nodes cannot bootstrap and register with API server.

**Solution**:
1) Abort ongoing operation: az aks operation-abort. 2) Confirm abort (Status=Canceled). 3) Upgrade nodepool image: az aks nodepool upgrade --node-image-only. This restores vmssCSE.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted)]`

## Phase 5: Rapidly deleting and creating an AKS cluster with 

### aks-838: AKS cluster has duplicate control planes (multiple CCPs). Symptoms include: dupl...

**Root Cause**: Rapidly deleting and creating an AKS cluster with the same name in the same resource group and subscription causes race condition. Backend resources (CCP, Network) are not fully cleaned up before the new cluster is created, resulting in two control plane instances.

**Solution**:
Escalate to AKS PG via IcM mentioning duplicate control planes for the cluster. No customer or CSS action can resolve this. PG will delete the duplicate CCP. Advise customer to add delay between DELETE and CREATE operations. Verify via AppLens detector or ASI.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FDuplicate%20cluster%20control%20planes)]`

## Phase 6: Deadlock: API server needs KMS keys from private K

### aks-869: AKS cluster with KMS etcd encryption and private Key Vault enters deadlock after...

**Root Cause**: Deadlock: API server needs KMS keys from private Key Vault (accessible only via konnectivity), but konnectivity needs API server online for node registration. When both are down, neither can start.

**Solution**:
Upgrade to API Server VNet Integration (eliminates konnectivity dependency). Do not use cluster start/stop on KMS clusters with private keyvaults. Do not manually scale VMSS to 0.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/KMS%20konnectivity)]`

## Phase 7: AKS backend service bug: a service restart occurre

### aks-109: AKS scale-up creates nodes but nodes are not properly bootstrapped; scale operat...

**Root Cause**: AKS backend service bug: a service restart occurred while processing the scale-up request, causing the same request to be processed twice. During 2nd processing, the service did not properly handle nodes already created in the 1st processing pass, leaving those nodes un-bootstrapped.

**Solution**:
Service bug confirmed and fixed by PG in subsequent release. If customer hits similar symptoms (partial scale-up with unbootstrapped nodes): 1) Check ICM/GetHelp for known service incidents. 2) Retry the scale operation after confirming no backend incidents. 3) Escalate to PG if retry fails.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Free Tier cluster control plane pod replicas drop to 0; controllers take lon... | AKS Free Tier does not guarantee high availability for contr... | 1) Upgrade to Standard or Premium tier for HA guarantee; 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FFree%20Tier%20Replica%20Reduction) |
| 2 | AKS ML application pods scale uncontrollably (e.g. from max to 96 replicas in sh... | Confirmed bug in azureml-fe V1 extension. The ML V1 frontend... | 1) Short-term: Restart all azureml-fe pods to restore normal... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG) |
| 3 | AKS node pool deletion fails with 'Cannot evict pod as it would violate the pod'... | Pod Disruption Budget (PDB) is configured so that minAvailab... | 1) Identify blocking PDB: kubectl get pdb -n <namespace>, ch... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAgentPool%20delete%20with%20ignore%20PDB) |
| 4 | AKS cluster stuck in Starting state or autoscaler scale-up creates VMSS instance... | vmssCSE (Custom Script Extension) was removed from VMSS of t... | 1) Abort ongoing operation: az aks operation-abort. 2) Confi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted) |
| 5 | AKS cluster has duplicate control planes (multiple CCPs). Symptoms include: dupl... | Rapidly deleting and creating an AKS cluster with the same n... | Escalate to AKS PG via IcM mentioning duplicate control plan... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FDuplicate%20cluster%20control%20planes) |
| 6 | AKS cluster with KMS etcd encryption and private Key Vault enters deadlock after... | Deadlock: API server needs KMS keys from private Key Vault (... | Upgrade to API Server VNet Integration (eliminates konnectiv... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/KMS%20konnectivity) |
| 7 | AKS scale-up creates nodes but nodes are not properly bootstrapped; scale operat... | AKS backend service bug: a service restart occurred while pr... | Service bug confirmed and fixed by PG in subsequent release.... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
