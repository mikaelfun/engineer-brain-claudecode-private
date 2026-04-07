---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/ACI Spot Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Spot%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Instances Spot Containers

## Summary

ACI is a popular choice for customers wanting to run containers quickly and simply on Azure without deploying and managing Virtual Machines (VMs). ACI Spot containers run on Spot clusters in Atlas in a separate ACISpot pool where the underlying worker VMs are Spot VMs while leveraging the benefits of a fully managed serverless containers platform.
Spot pool has System nodes and Spot Worker nodes and no gateway nodes since there's no inbound connectivity.

Spot Containers run interruptible, containerized workloads on unused Azure capacity at up-to 70% discounted prices vs regular-priority containers on ACI.

## Availability

| Phase             | API Version           | Available Regions                |
| ----------------- | --------------------- | -------------------------------- |
| Private Preview   | 2022-04-01-preview    | East US2                         |
| Public Preview    | 2022-10-01-preview    | West Europe, East US2, West US   |

## Benefits

* Spot Containers make it easy and affordable to run workloads at scale that have a short execution time, do not require uptime SLAs, and often already have logic baked-in to checkpoint state so that process can easily be picked-up in the event the container group is interrupted.

## Supported Features

* Creation via Portal or AZ CLI without VNET or public IP
* All Restart policies [Never, OnFailure, Always]
* Eviction policy based on available capacity
* Dedicated StandardSpotCores quota category
* Linux/Windows OS Container images
* Logging new events for eviction scenarios

## Recommended workloads

Parallelizable offline workloads. Examples include:

* Image rendering
* Genomic processing
* Monte Carlo simulations
* Dev/test workloads

## Priority Property

Spot Container Groups will be exposed to ACI customers as the existing Container Group resource with an additional property - 'priority' which could be 'Regular' or 'Spot'.

## Deployment Experience

* Priority Property - Should be set to 'Spot'. Defaults to 'Regular'.
* Only Standard SKU is supported for Spot Container deployments.
* GPU is not supported for Spot Container deployments.
* VNET and PublicIP are not supported for Spot Container deployments.

## Team Info

| Team             | Team Name                         | Components Owned                                          | IcM Path                                              |
| ---------------- | --------------------------------- |---------------------------------------------------------- | ----------------------------------------------------- |
| SpotComputeDev   | Spot Compute Dev Team             | ACISpot Container Data Plane and ACISpot Control Plane    | AzureRT/SpotComputeDev                                |

## Details needed for IcM

* ResourceURI : /subscriptions/<sub_id>/resourceGroups/<rg_name>/providers/Microsoft.ContainerInstance/containerGroups/<cg_name>
* Priority : Priority of the Container Group.
* Description : Details on the issue.
* PreciseTimeStamp(UTC) : Time at which the issue occured.
* API Version : API Version used in the ARM Template.
