---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Pre Provisioning Service_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FPre%20Provisioning%20Service_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - cw.How-It-Works
  - cw.Reviewed-02-2026
---

[[_TOC_]]

# Introduction

Azure Virtual Machines use an internal platform capability called **PreProvisioning Service (PPS)** to reduce VM and VM Scale Set (VMSS) deployment time.
With PPS, Azure may create and partially provision virtual machines in advance, before a customer explicitly requests a VM. 
When the customer issues a VM create or VMSS scaleout request, Azure assigns a matching preprovisioned VM, applies customerspecific configuration, and completes provisioning. 

**Please note that this feature doesn't cause any failures at all on provisioning.**
In case there is no preprovisioned VM waiting in escrow to use for the deployment, so instead of using a preprepared VM in escrow, it creates a new deployment based on the configuration the customer chose. Hence, the deployment will continue working just fine. 
This happens very frequently and by itself should not be cause for concern.
 
Also, customers cannot enable, disable, or configure PPS.

## Tenant Deployment Performance & Reliability (TDPR)

VM creation latency is a critical challenge faced in virtual environments. Understanding the issues surrounding latency is essential for improving user satisfaction and operational efficiency.

1. Tenant Deployment Performance & Reliability (TDPR)
TDPR applies to umbrella of operations the customer can do: 

- VM Create/Delete 
- Attach a disk to a VM 
- Repave a VMs OS disk 
- Add and initialize an extension 
- Pre-Provisioning (PPS) improves VM Create experience for customers.

### Why is VM Create latency and reliability important? 

- Cloud-native customers create hundreds or thousands of VMs at scale and dispose them fast (e.g., Databricks, AKS etc) 
- So they need the VMs to be ready to use within a few seconds of requesting. 
- Customers using fewer and long-running VMs may not care as much about VM create latency 
- Customers prefer clouds where they can create their VMs faster and reliably


# Why Pre-Provisioning?

## Breaking down the VM Creation Flow

VM Creation involves operations happening in three main stages:

- Control Path — allocation of compute, storage and network resources (CRP, NRP, DiskRP, AzSM etc)
- Data Path — VM boot + OS provisioning (Guest, Xstore Disk IOs etc)
- Notification Path — notify customer about success, back through control plane (HostAgent, AzSM, CRP etc)

Control path and Notification path are being continuously improved by initiatives like Peregrine, Merlin, AzCim, Firebolt etc.  
Data path improvement is dependent on image publishers.

# Pre-Provisioning Overview

Solution to the data path problem: 

- Eliminate VM boot by pre-provisioning VMs that we anticipate the customers will need 
- Assign a pre-provisioned VM to customer when their request matches that of a PPS VM 
- Perform fast OS provisioning (username, password etc) without a reboot

## Pre-Provisioning - Running VMs

### 1. Predict customer VMs from past deployments

- Look at the past VM deployments from customers to create a forecast for future
- Forecasts are a list of \<VmConfiguration, Count\>
- VMConfiguration (explained in the next section) is a composite of properties of a VM: OS image, OS version, storage type, VMSize, OS Disk Size etc

### 2. Deploy pre-provisioned VMs

- Provisioned with default settings (machine name, user account etc.)
- VMs are running until assigned to a customer or deleted by PPS

### 3. Assign pre-provisioned VMs to customer (no reboot)

- Identify a PPS VM which matches the VMConfiguration that the customer requests.
- Update the networking artifacts with the actual ones.
- Move the MD disk under customer subscription
- Move the VM under customer tenant
- No reboot required

### 4. Apply customer-specified settings (no reboot)

- Apply customer-specified settings inside the VM like username, password etc
- No reboot required

**VMConfiguration:**

Anything that cannot be updated on the fly without a reboot or deallocate on the VM, when assigning a pre-provisioned VM to a customer VM request.

```
struct RunningVMConfig
{
    0: ImageReference ImageReference;
    1: string VMSize;
    2: string OSType;
    3: string OSDiskStorageAccountType;
    4: int32 OSDiskSizeInGB;
    5: int32 NumberOfNics = 1;
    6: bool AcceleratedNetworkingEnabled;
    7: bool NetworkingFastPathEnabled;
    8: nullable<SecurityProfile> SecurityProfile;
    9: nullable<string> PhysicalAvailabilityZone;
    10: nullable<string> DiffOSDiskPlacement;
    11: bool HibernationEnabled;
    12: bool IsMultiFD;
    13: nullable<string> TipNodeSessionId;
    14: nullable<string> DiskControllerType;
    15: optional nullable<string> OSDiskCaching;
}
```

# E2E Sequence Diagram

## Pre-provisioned VM Deployment

See attachment: `/.attachments/How-It-Works/initialpreprovisionedvmdeployment.png`

## Pre-provisioned VM Deployment (Inside Guest OS - Linux)

See attachment: `/.attachments/How-It-Works/initialvmdeployment-linux.png`

## Pre-provisioned VM Deployment (Inside Guest OS - Windows)

See attachment: `/.attachments/How-It-Works/initialvmdeployment-windows.png`

# Identifying PPS VMs

While investigating the logs, if you see multiple VMs with the same container ID and roleInstanceName similar to `_pps-vm*`, you've encountered a PPS vm. PPS vms are 'cached VMs' that are provisioned by Microsoft and sit dormant until a user requests to deploy a VM with the same SKU / OS image as the PPS vm. 
The PPS service then 'specializes' this VM to become apart of the customer's subscription/perform customer configuration ontop of the SKU/OS to reduce provisioning times.

## NetVMA

In NetVMA for NodeID, we can observe multiple VMs running with roleInstanceName `_pps-vm*`.

See attachment: `/.attachments/How-It-Works/pps_netvma.png`

# Reference

For more information on PPS, please refer to https://eng.ms/docs/cloud-ai-platform/azure-core/azure-compute/compute-platform-arunki/pre-provisioning-service-pps/pre-provisioning-service-pps/introduction/pre-provisioningservice
