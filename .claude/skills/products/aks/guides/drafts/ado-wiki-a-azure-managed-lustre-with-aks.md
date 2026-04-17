---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Azure Managed Lustre with AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAzure%20Managed%20Lustre%20with%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Managed Lustre and AKS

## Azure Lustre CSI Driver

| CSI driver version | Container image | Supported K8s | Lustre client |
|--|--|--|--|
| main branch | mcr.microsoft.com/oss/kubernetes-csi/azurelustre-csi:latest | 1.21+ | 2.15.1 |

## Setup Steps

1. Create Azure Managed Lustre File System
2. Peer AKS vnet with Lustre FS vnet
3. Create AKS Cluster with peered vnet
4. Install the CSI Driver
5. Configure Persistent Volume
6. Verify PVC: `kubectl get pvc`
7. Create test pod with PVC mount
8. Verify filesystem: `mount | grep lustre`

## Support Status

AMLFS is supported by the Azure High Complexity Low Volume (HCLV) team.

## Escalation

Create IcM assigned to "Avere Azure Storage Cache/AMLFS Triage" with:
* Customer name, description, error message, timestamp, subscription ID, resource group, AMLFS name
* Reference support request number in ICM title

## References

* Regional failover: https://learn.microsoft.com/en-us/azure/azure-managed-lustre/amlfs-region-recovery
* CSI driver: https://github.com/kubernetes-sigs/azurelustre-csi-driver

**Owner:** RAGHU NANDAN SHUKLA <rashukla@microsoft.com>
