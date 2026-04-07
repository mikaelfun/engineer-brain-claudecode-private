---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/FAQ Frequenly asked questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FFAQ%20Frequenly%20asked%20questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Storage Enabled by Azure Arc — FAQ

## Q: Was Azure Container Storage previously part of AIO? Is it now a standalone product?

In the beginning, it was called ESA (Edge Storage Accelerator) and was offered as a first-party storage system designed for Arc-connected Kubernetes clusters. Now it can be used as an optional component to provide local storage endpoints and synchronize data to Azure cloud storage in AIO.

Within IoT Operations, you can configure local storage data flow endpoints. These endpoints can use Azure Container Storage enabled by Azure Arc (ACSA).

## Q: Are there functionalities offered by ACSA that are not used in the AIO context?

As of right now, the data flow endpoints in AIO can use Local shared and cloud ingest volumes. ACSA offers the Cloud Mirror subvolumes. This functionality mirrors data from a cloud destination to the edge as a read-only copy.

## Q: What are the Preview components of Azure Container Storage?

- [Local Shared volumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-local-shared-edge-volumes)
- [Cloud Ingest subvolumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-cloud-ingest-subvolumes)
- [Cloud Mirror subvolumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-cloud-mirror-subvolumes)

## Q: Are Local shared and Cloud Ingest GA if used by AIO?

Correct. If used with AIO in the local storage data flow endpoint context, they are considered GA. If used outside AIO, they are in Public Preview. GA planned for early next year.

## Q: Can you configure multiple Cloud Ingest subvolumes to different containers in the same storage account?

Yes. You can configure multiple Cloud Ingest subvolumes and point each one to a different destination container within the same Storage account. Each subvolume is an independent target attached under a Cloud Ingest Edge Volume/PVC.

## Q: What are the supported authentication methods for subvolumes?

Only three authentication methods are supported for ACSA Cloud Ingest / Cloud Mirror / OneLake subvolumes:
1. OneLake identity
2. Workload identity (requires User-Assigned Managed Identity / UAMI)
3. System-assigned extension identity

## Q: What is OneLake identity?

OneLake subvolumes are a type of cloud-connected subvolume where the cloud destination is Microsoft Fabric. OneLake requires special identity handling because it is not an Azure Storage Account. The ACSA extension (`microsoft.arc.containerstorage`) is granted Contributor on the Fabric workspace and becomes a service principal-type identity for OneLake access.

## Q: For workload identity, does the UAMI need to be the same one configured on the Arc cluster?

No. The UAMI used for subvolume authentication does not need to be the same identity assigned to the Arc-enabled Kubernetes cluster. You can keep the cluster using SAMI and still use any UAMI for workload identity:
- **SAMI** → used by the Arc agent and control-plane operations
- **UAMI** → used only by specific ACSA workloads through OIDC federation

## Q: Does Cloud Ingest traffic use public internet? Can private networking be configured?

**Private networking is NOT supported.** Cloud Ingest currently relies on **public endpoints of Azure Storage**. Private endpoints are not supported.

## Q: How does networking work for local shared volumes?

Local shared volumes are fully local, cluster-internal storage. They do not communicate with Azure or any external endpoint. There is no outbound or cloud traffic at all.
