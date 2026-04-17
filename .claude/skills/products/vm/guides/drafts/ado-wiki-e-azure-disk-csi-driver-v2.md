---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Disk CSI Driver v2_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Disk%20CSI%20Driver%20v2_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

 
[[_TOC_]]

# Summary
Azure disk CSI driver v2 (preview) improves scalability and reduces pod failover latency.

# Description
The Container Storage Interface (CSI) is a standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems (COs) like Kubernetes. Azure disk CSI driver v2 (preview) improves scalability and reduces pod failover latency. It uses shared disks to provision attachment replicas on multiple cluster nodes, and integrates with the pod scheduler to ensure a node with an attachment replica is chosen on pod failover. In additon, Azure disks CSI driver v2 (preview) also provides the ability to fine tune performance. 


## More Information
The Container Storage Interface (CSI) is a standard for exposing arbitrary block and file storage systems to containerized workloads on Kubernetes. By adopting and using CSI, Azure Kubernetes Service (AKS) can write, deploy, and iterate plug-ins to expose new or improve existing storage systems in Kubernetes without having to touch the core Kubernetes code and wait for its release cycles.

The CSI storage driver support on AKS allows you to natively use:

- [Azure disks](https://docs.microsoft.com/en-us/azure/aks/azure-disk-csi) can be used to create a Kubernetes DataDisk resource. Disks can use Azure Premium Storage, backed by high-performance SSDs, or Azure Standard Storage, backed by regular HDDs or Standard SSDs. For most production and development workloads, use Premium Storage. Azure disks are mounted as ReadWriteOnce, which makes it available to one node in AKS. For storage volumes that can be accessed by multiple pods simultaneously, use Azure Files.

- [Azure Files](https://docs.microsoft.com/en-us/azure/aks/azure-files-csi) can be used to mount an SMB 3.0/3.1 share backed by an Azure storage account to pods. With Azure Files, you can share data across multiple nodes and pods. Azure Files can use Azure Standard storage backed by regular HDDs or Azure Premium storage backed by high-performance SSDs.



## StorageClass
In addition to the [existing](https://github.com/MicrosoftDocs/azure-docs-pr/blob/56b00bf161153df76671f7d89482c1738a948cf8/articles/aks/azure-disk-csi.md#storage-class-driver-dynamic-disk-parameters) StorageClass dynamic disk parameters, the Azure disk CSI driver v2 (preview) supports the following:

| Name                 | Meaning                                                                                                                    | Available Value                                                                                 | Mandatory | Default value                                                                             |
|----------------------|----------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|-----------|-------------------------------------------------------------------------------------------|
| maxShares            | The total number of shared disk mounts allowed for the disk. Setting the value to 2 or higher enables attachment replicas. | Supported values depend on the disk size. See�[Share an Azure managed disk](https://github.com/MicrosoftDocs/azure-docs-pr/blob/56b00bf161153df76671f7d89482c1738a948cf8/articles/virtual-machines/disks-shared.md)�for supported values. | No        | 1                                                                                         |
| maxMountReplicaCount | The number of replicas attachments to maintain.                                                                            | This value must be in the range�[0..(maxShares - 1)]                                            | No        | If�accessMode�is�ReadWriteMany, the default is�0. Otherwise, the default is�maxShares - 1 |



# Troubleshooting

- [Azure-Disk-TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/azure-disk-tsg)

- [Azure Files TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/519401/TSGs)

## Escalation
ICM: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Yls1r3

## Collaboration with AKS team
Routing: SAP for collabs use _Azure\Kubernetes Service (AKS)\Storage\Sub Problem Type (L3) Below_

![supportrouting](/.attachments/SME-Topics/Azure-Files-All-Topics/DiskCSIDriver-SupportTopics-14388c1f-cbd8-432c-8f3c-3fef00009c9a.png)

# Documentation

- [Azure disk Container Storage Interface (CSI) driver v2 (preview)](https://aka.ms/AAhihg9)

- [Container Storage Interface (CSI) drivers on Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/csi-storage-drivers)

- [Container Storage Interface (CSI) Driver for AKS (TSG/wiki)](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/413796/Container-Storage-Interface-(CSI)-Driver-for-AKS)


- [Use the Azure disk Container Storage Interface (CSI) driver in Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/azure-disk-csi)





# Contacts
| **Name**                                           | **Position**                      |
|---------------------------------------------------|-------------------------------|
| Lorraine Bichara Assad <Lorraine.Bichara@microsoft.com>                    | Feature PM              |
| Drew Bailey <abail@microsoft.com>        | IaaS Storage TA               |
| Jordan Harder <Jordan.Harder@microsoft.com> | AKS TA |
| Johnny Coleman johnnyc@microsoft.com              | Beta                          |
