---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/How tomigrate from kubenet to AzurecniOverlay withCilium"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/How%20tomigrate%20from%20kubenet%20to%20AzurecniOverlay%20withCilium"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Migrate AKS Cluster from Kubenet with Calico to Azure CNI Overlay with Cilium

## Prerequisites

- Azure CLI installed
- Contributor or Owner role on the AKS cluster and resource group
- No active workloads that cannot tolerate node pool changes

## Migration Steps

### Step 1: Validate Current Configuration

```bash
az aks show --resource-group <RG> --name <CLUSTER> \
  --query "{networkPlugin:networkProfile.networkPlugin, networkPolicy:networkProfile.networkPolicy}"
```

### Step 2: Disable Calico (CRITICAL)

> **Important:** Migration WILL FAIL if Calico is not disabled first.

```bash
az aks update --resource-group <RG> --name <CLUSTER> --network-policy none
```

This removes Calico pods and DaemonSets but **does not remove CRDs**. If CRDs remain, delete them manually after confirming all Calico/tigera-operator pods are gone.

Reference: https://learn.microsoft.com/en-us/azure/aks/use-network-policies#uninstall-azure-network-policy-manager-or-calico

### Step 3: Migrate to Azure CNI Overlay

```bash
az aks update --resource-group <RG> --name <CLUSTER> \
  --network-plugin azure --network-plugin-mode overlay
```

### Step 4: Apply Cilium Network Policy (Optional)

```bash
az aks update --resource-group <RG> --name <CLUSTER> --network-policy cilium
```

## Verification

```bash
az aks show --resource-group <RG> --name <CLUSTER> \
  --query "{networkPlugin:networkProfile.networkPlugin, networkPolicy:networkProfile.networkPolicy}"
```

## Key Observations

- Migration fails if networkPolicy=calico is enabled during upgrade
- CRDs remain after uninstall; manual cleanup may be required
- Successful migration when: networkPolicy=None → networkPlugin=azure with overlay mode in one step
- Ensure workloads are running on new node pools before deleting old ones

## References

- https://learn.microsoft.com/en-us/azure/aks/upgrade-azure-cni#upgrade-to-azure-cni-overlay
- https://learn.microsoft.com/en-us/azure/aks/use-network-policies#uninstall-azure-network-policy-manager-or-calico
