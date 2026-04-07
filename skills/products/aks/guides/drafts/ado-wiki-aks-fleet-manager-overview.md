---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Fleet Manager

_Note: Fleet Manager is considered a separate Azure service from AKS. It has its own support topics, case routing, docs library, CLI commands (az fleet), etc._

## Overview

Azure Kubernetes Fleet Manager (Fleet) enables multi-cluster and at-scale scenarios for Azure Kubernetes Service (AKS) clusters. A Fleet resource creates a cluster that can be used to manage other member clusters.

Fleet supports the following scenarios:

* Create a Fleet resource and group AKS clusters as member clusters.
* Create Kubernetes resource objects on the Fleet resource's cluster and control their propagation to all or a subset of all member clusters.
* Export a service from one member cluster to the Fleet resource. Once successfully exported, the service and its endpoints are synced to the hub, which other member clusters (or any Fleet resource-scoped load balancer) can consume.

## Architecture

Fleet consists of a "Hub" cluster that is managed by AKS, and not directly accessible as an AKS cluster. The customer will not be able to manage the resources of the hub cluster.

Once a fleet is created, you can then join up to 20 AKS clusters to the fleet. Clusters from different subscriptions and regions can be joined to a fleet, but must be part of the same tenant. This can enable easier multi-region services.

## Support Scope

Reference: [Which operations or critical user experiences do you support?](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/447003/Overview-Fleet-RP?anchor=operations%3A-which-operations-or-critical-user-experiences-do-you-support%3F)

## Training Content

- [Fleet Manager GA - Walkthrough.mp4](https://microsoft.sharepoint.com/teams/AzureCSSContainerServicesTeam/_layouts/15/stream.aspx?id=%2fteams%2fAzureCSSContainerServicesTeam%2fShared%20Documents%2fSupport%20Onboarding%2fFleet%20Manager%20GA%20-%20Walkthrough.mp4)
- [Fleet Manager GA - Walkthrough.pptx](https://microsoft.sharepoint.com/:p:/t/AzureCSSContainerServicesTeam/ESvjjqSPyT9Mn1M7IRUpURoBicr7TvYmeMZxTIUVHWtxJw?e=fNscSf)

## References

### Public

- [Azure Kubernetes Fleet Manager](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/)
- [Overview](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview)
- [Architectural Overview](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/architectural-overview)
- [FAQ](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/faq)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/fleet?view=azure-cli-latest)

### Internal

- [Caravel](http://aka.ms/aks-caravel)
- [Overview: Fleet RP](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/447003/Overview-Fleet-RP)
- [TSGs #1](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg_toc/tsg-by-sig#sig-multi-cluster)
- [TSGs #2](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide?pagePath=/fleet)
