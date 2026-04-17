---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Identifying AP5GC Cases and Customers for Rerouting and Collaboration"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FIdentifying%20AP5GC%20Cases%20and%20Customers%20for%20Rerouting%20and%20Collaboration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# What is AP5GC

Azure Private 5G Core is an Azure cloud service for deploying and managing 5G core network functions on an Azure Stack Edge device, as part of an on-premises private mobile network for enterprises.

The 5G core network functions connect with standard 4G and 5G standalone radio access networks (RANs) to provide high performance, low latency, and secure connectivity for 5G Internet of Things (IoT) devices. Azure Private 5G Core gives enterprises full control and visibility of their private mobile networks.

For more information: [What is Azure Private 5G Core? | Microsoft Learn](https://learn.microsoft.com/en-us/azure/private-5g-core/private-5g-core-overview)

---

## How it Works with Azure Stack Edge

Packet core instances run on a Kubernetes cluster, **which is connected to Azure Arc and deployed on an Azure Stack Edge Pro with GPU device**.

These platforms provide security and manageability for the entire core network stack from Azure. Additionally, Azure Arc allows Microsoft to provide support at the edge.

---

## How to tell if the customer is running AP5GC on Azure Stack Edge?

The easiest way to clarify this is by asking the customer directly if they are running 5G workloads on the Azure Stack Edge.

_If yes, any AP5GC or AKS related issues are handled by the Azure For Operators (A4O) Support Team, and not the Azure Storage Devices (ASD) Support Team._

---

## What are the differences in compute between normal-use ASE and ASE running AP5GC?

By default, the Azure Stack Edge device uses its own version of Kubernetes which is native to the device and is Microsoft-managed. This is known as _**Kubernetes on Azure Stack Edge**_. **This service is supported by the Azure Storage Devices team.**

Reference: [Deploy Compute on Azure Stack Edge Pro GPU | Microsoft Learn](https://learn.microsoft.com/en-us/azure/databox-online/azure-stack-edge-gpu-deploy-configure-compute)

For customers running AP5GC, more administrative control is required over compute and the Kubernetes cluster, and so for customers running AP5GC workloads, a custom AKS deployment is required. This is known as AKS on Azure Stack Edge. **_This service is Supported by the Azure For Operators Support Team._**

Reference: [Commission an AKS cluster - Azure Private 5G Core | Microsoft Learn](https://learn.microsoft.com/en-us/azure/private-5g-core/commission-cluster?pivots=ase-pro-2)

## Support Area Paths for Rerouting

1. **Azure Private 5G Core (AP5GC)** - `Azure -> Azure Private 5G Core`
2. **AKS on Azure Stack Edge** - `Azure -> Azure Private 5G Core`
