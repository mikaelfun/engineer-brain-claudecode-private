---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Enable and create GPU in FDPO subscription"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Enable%20and%20create%20GPU%20in%20FDPO%20subscription"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# GPUs on AKS Nodes

## Overview

With the continuous updates brought to AKS & NVidia, as well as the mandatory usage of the new FDPO Internal Azure Subscriptions, it became unclear how we could reproduce an "AKS / GPU" issue internally.

Goal of this page is to try to go straight to the point and list the necessary steps.

## FDPO Subscriptions - how to get access to GPU sizes?

GPU sizes are potentially extremely expensive + low on capacity. So our internal FDPO subscriptions are blocked from using them.

First step is to require a quota increase. This can be done from the Azure portal - from the Subscription blade - Support & Troubleshooting - and type "quota increase" in the Issue Description - then ask for 2 or 3 instances of the VM SKU you want, and the region you want.

Note: you'll be contacted by Support folks from the Azure Subscription team, and it might take few days to get the quota approved...

eg. with that, I was approved for 3 instances of size NC6s_v3 in EastUS region.

---

Then you'll be blocked by an internal policy which prevents us from deploying such sizes:

```sh
az aks nodepool add --resource-group rg514914749france --cluster-name aks514914749france --name livegpuproc4 --node-count 1 --node-vm-size Standard_NC8as_T4_v3 --enable-cluster-autoscaler --skip-gpu-driver-install --tags Environment=Dev Provider=Terraform Team=Tracker --labels appdestination=livegpuprocessing gpu=T4 task=trackerlight --min-count 1 --max-count 2
```

Error: `RequestDisallowedByPolicy` - Resource was disallowed by policy `MCAPSGov Deny Policies` / `Block VM SKU Sizes`.

Procedure to follow is on the NoCode wiki: request exception with business justification, approval from SCMTeam, then submit ticket via MCAPS portal.

## Use GPU in AKS

Public documentation: https://learn.microsoft.com/en-us/azure/aks/gpu-cluster

Three options:
1. **Manually install NVIDIA device plugin** (recommended)
2. **AKS GPU image** (Preview, based on Ubuntu 18.04, not recommended)
3. **NVIDIA GPU Operator** (requires NVidia steps)

### Install the NVIDIA GPU Operator

Pre-requisites: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#prerequisites

```sh
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia \
    && helm repo update
helm install --wait --generate-name \
    -n gpu-operator --create-namespace \
    nvidia/gpu-operator
```

Test GPU workload: https://learn.microsoft.com/en-us/azure/aks/gpu-cluster?tabs=add-ubuntu-gpu-node-pool#confirm-that-gpus-are-schedulable

Customization options: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#common-chart-customization-options
