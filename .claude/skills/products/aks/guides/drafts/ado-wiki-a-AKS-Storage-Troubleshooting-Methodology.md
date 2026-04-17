---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Storage/AKS Storage Troubleshooting Methodology"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FAKS%20Storage%20Troubleshooting%20Methodology"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AKS Storage Troubleshooting Methodology

## Summary

Kubernetes provides an abstraction layer for storage, allowing developers to work with storage resources in a consistent way, regardless of the underlying infrastructure. It includes:

- Persistent Volumes (PVs) and Persistent Volume Claims (PVCs), which are used to define and request storage resources.
- Storage Classes, which allow administrators to define options for different types of storage resources.
- Volume Plugins like CSI (Container Storage Interface), which are responsible for implementing the different types of supported storage.

**The objective of this page is to isolate AKS storage related topics, including the usage of CSI and container storage drivers.**

## Storage drivers supported in AKS

Supported storage drivers (all other drivers are not supported by AKS/Azure Container Storage team):

- Azure Blob Storage CSI driver
- Azure Disk CSI driver
- Azure File CSI driver
- Azure Container Storage driver with Azure Disk
- Azure Container Storage driver with Elastic SAN
- Azure Container Storage driver with Ephemeral Disk NVMe
- Azure Container Storage driver with Ephemeral Disk temp SSD

## Methodology for troubleshooting AKS storage - Storage Boundaries v2

Scope limited to Azure storage drivers for blob, disk, file and san storage (does NOT encompass secret store or azurelustre CSI drivers).

### Responsibility Matrix

| # | Task | Responsible Team | Notes |
|---|------|-----------------|-------|
| 1 | Fully Understand the Issue | AKS POD | Customer Communication |
| 2a | CSI driver issues (install, mount, provision, performance, snapshots) + Azure Container Storage (diskpools, storagepools, OpenEBS) | AKS POD -> Xstore/Triage (Container Storage) | Can directly escalate via IcM: set "Transfer Team" to "Container Storage", provide cluster name + CCP namespace |
| 2b | Isolate CRP issue | AKS POD + Azure IaaS VM POD | Use ASI, ASC |
| 2c | Performance/IOPS throttling for cluster nodes (VMs) | AKS POD + Azure IaaS VM POD | May need Linux escalation team collaboration. If isolated to AgentBaker component, AKS POD owns it |
| 2d | Mount issues (NFSv4.1), performance/connectivity isolated to Azure blob/disk/file/SAN | AKS POD + Azure IaaS VM POD (storage team) | SAP: Routing Azure Storage |

### Key TSG Links by Driver

**Azure Disk CSI:**
- csi-debug: https://github.com/kubernetes-sigs/azuredisk-csi-driver/blob/master/docs/csi-debug.md
- Azure Disk Case Collection (eng.ms)
- Azure Disk CSI Driver TSG (eng.ms)
- Multi-Attach error guide

**Azure File CSI:**
- csi-debug: https://github.com/kubernetes-sigs/azurefile-csi-driver/blob/master/docs/csi-debug.md
- Azure File Case Collection (eng.ms)
- Azure File CSI Driver TSG (eng.ms)

**Azure Blob CSI:**
- csi-debug: https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/csi-debug.md
- Blob CSI Driver TSG (eng.ms)

### Escalation Path for Container Storage Issues

1. Set "The incident is related to" to "I know exactly which Xstore component team to transfer"
2. Set "Transfer Team" to "Container Storage"
3. Provide the AKS cluster name and CCP namespace
