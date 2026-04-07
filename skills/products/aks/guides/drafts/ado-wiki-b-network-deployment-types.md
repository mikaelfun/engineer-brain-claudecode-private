---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/2 - What is the Network deployment type used in the AKS cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting/2%20-%20What%20is%20the%20Network%20deployment%20type%20used%20in%20the%20AKS%20cluster"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# What is the Network deployment type used in the AKS cluster?

AKS (Azure Kubernetes Service) provides two network deployment types - **Kubenet and Azure CNI**. Both Kubenet and Azure CNI provide network connectivity for your AKS clusters, however, there are advantages and disadvantages to each.
Kubenet `conserves IP` address space and uses Kubernetes internal or external load balancers to reach pods from outside of the cluster.

On the other hand, Azure CNI `offers full virtual network` connectivity for pods, and they can be directly reached via their private IP address from connected networks. However, this deployment type **requires more IP address space**.

In terms of **behavior differences** between Kubenet and Azure CNI, **both support** pod-to-pod connectivity, access to resources secured by service endpoints, and exposing Kubernetes services using a load balancer service, App Gateway, or ingress controller. However, there are some differences in their capabilities. For example, Azure CNI **supports** VMs in peered virtual networks and **Windows node pools**, whereas Kubenet **does not**.

DNS functionality for both Kubenet and Azure CNI is provided by CoreDNS, which is a deployment running in AKS with its own autoscaler.

By default, CoreDNS is configured to forward unknown domains to the DNS functionality of the Azure Virtual Network where the AKS cluster is deployed, making Azure DNS and Private Zones work for pods running in AKS.

The Direct method can be used to determine if AKS was deployed using the **CNI** or **Kubenet** via Azure Support Center (ASC), ASI, Jarvis Actions, Kusto queries based on your preferences.

## Important Note

> While the supported plugins meet most networking needs in Kubernetes, advanced users of AKS may desire to use the same CNI plugin that they use in on-premises Kubernetes environments or take advantage of specific advanced functionality available in other CNI plugins.
> For users who wish to deploy a **custom CNI plugin on their AKS cluster**, it is possible to create a cluster with no CNI plugin pre-installed. This allows for the installation of any third-party CNI plugin that works in Azure.

_**BYOCNI has support implications**_ - Microsoft support will not be able to assist with CNI-related issues in clusters deployed with BYOCNI.
