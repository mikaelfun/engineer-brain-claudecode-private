# AKS 节点池扩缩容 — scale -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS RP checks ALL pods in kube-system namespace du

### aks-747: AKS CRUD/Start operations fail with ControlPlaneAddOnsNotReady, error references...

**Root Cause**: AKS RP checks ALL pods in kube-system namespace during operations. User workloads in Completed/Failed/Pending state cause AKS RP to misinterpret them as control plane addon failures.

**Solution**:
Advise customer to move all user workloads out of kube-system namespace per AKS FAQ. Verify failing pods are customer pods by checking CCP logs and pod labels.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending)]`

## Phase 2: Requested VM SKU restricted in subscription, not o

### aks-757: AKS cluster/nodepool creation or scaling fails with SkuNotAvailable or VM size n...

**Root Cause**: Requested VM SKU restricted in subscription, not offered in target region/zone, or has zonal capacity limitations.

**Solution**:
1) az vm list-skus to check availability. 2) ASC Resource Explorer > SKU Restrictions. 3) Request quota increase or select alternative VM. 4) Transfer to SAP Compute-VM subscription limit increases if needed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues)]`

## Phase 3: Subscription vCPU quota exhausted. Azure two-tier 

### aks-759: AKS node scaling fails with QuotaExceeded. Exceeds vCPU quota for VM size family...

**Root Cause**: Subscription vCPU quota exhausted. Azure two-tier quota: VM-family-specific + total regional vCPU limit.

**Solution**:
1) Submit quota increase via Portal (auto-approved for standard families). 2) Transfer to SAP Compute-VM subscription limit increases. Include: Sub ID, Region, SKU, Restriction Type, cores. Do NOT transfer to VM/VMSS team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues)]`

## Phase 4: AKS cluster count quota limit reached. AKS enforce

### aks-764: AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim...

**Root Cause**: AKS cluster count quota limit reached. AKS enforces maximum cluster count per subscription per region. Ineligible subscription types (Free Trial, Students, DreamSpark) cannot request increases.

**Solution**:
Customer must file NEW support ticket via correct path: Azure/Subscription limits and quota/Azure Kubernetes Service. Do NOT accept via AKS support path. ICM auto-created to AzureKubernetesService/ClusterQuotaRequests (Sev 3). Decline ineligible sub types, route internal to AZURECONTAINERSERVICE/Platform.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster)]`

## Phase 5: Simultaneous agentpool scale and OSSKU migration o

### aks-932: OSSKU Migration fails when attempting to change node count simultaneously with O...

**Root Cause**: Simultaneous agentpool scale and OSSKU migration operations are not allowed. The agentpool count field must stay the same during the migration.

**Solution**:
Perform OSSKU migration and scale operations separately - first migrate OSSKU, then scale (or vice versa).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration)]`

## Phase 6: The vmssCSE (CustomScript) extension was removed/d

### aks-965: AKS cluster stuck in Starting state or autoscaler nodes not visible despite VMSS...

**Root Cause**: The vmssCSE (CustomScript) extension was removed/deleted from the VMSS backing the AKS node pool. Without this extension, nodes cannot complete provisioning and join the cluster

**Solution**:
1) Abort ongoing operation: az aks operation-abort -n <cluster> -g <rg> 2) Confirm abort successful (Status=Canceled) 3) Upgrade nodepool image: az aks nodepool upgrade --node-image-only --cluster-name <cluster> -g <rg> --name <pool> to reinstall vmssCSE

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS CRUD/Start operations fail with ControlPlaneAddOnsNotReady, error references... | AKS RP checks ALL pods in kube-system namespace during opera... | Advise customer to move all user workloads out of kube-syste... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 2 | AKS cluster/nodepool creation or scaling fails with SkuNotAvailable or VM size n... | Requested VM SKU restricted in subscription, not offered in ... | 1) az vm list-skus to check availability. 2) ASC Resource Ex... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 3 | AKS node scaling fails with QuotaExceeded. Exceeds vCPU quota for VM size family... | Subscription vCPU quota exhausted. Azure two-tier quota: VM-... | 1) Submit quota increase via Portal (auto-approved for stand... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 4 | AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim... | AKS cluster count quota limit reached. AKS enforces maximum ... | Customer must file NEW support ticket via correct path: Azur... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster) |
| 5 | OSSKU Migration fails when attempting to change node count simultaneously with O... | Simultaneous agentpool scale and OSSKU migration operations ... | Perform OSSKU migration and scale operations separately - fi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
| 6 | AKS cluster stuck in Starting state or autoscaler nodes not visible despite VMSS... | The vmssCSE (CustomScript) extension was removed/deleted fro... | 1) Abort ongoing operation: az aks operation-abort -n <clust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted) |
