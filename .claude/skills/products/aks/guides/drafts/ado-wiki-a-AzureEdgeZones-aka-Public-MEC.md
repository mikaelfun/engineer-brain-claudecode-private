---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/AzureEdgeZones aka Public MEC"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/AzureEdgeZones%20aka%20Public%20MEC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Edge Zones (aka Public MEC)

## Summary

Azure Edge Zones is the next generation platform in Microsoft's global network to bring cloud networking services at the edges for enabling scenarios and applications that needs high performance with low latency. There are two product types: Azure Edge Zones by Microsoft and Azure Edge Zones by MNOs.

Think mini datacenter that customers can pin their resources directly to. Except for AKS, the masters are going to be in their regular regional locations NOT in the pinned location the customer chooses.

## Support Boundary

Standard troubleshooting practices for an AKS cluster.

## Detectors

`Edge Zones` is the name of the AppLens detector that will tell you if the cluster is deployed using edge zones as well as the location and type.

### Basic Flow

- Edge Zone Being used?
  - Yes -> Escalation Needed?
    - Yes -> Escalate as normal, add info from Edge Zones detector in AppLens

## Escalation Paths

There is no special escalation path, simply escalate via EEE/CRI as you normally would. Just be sure to identify the Edge Zone information that can be easily found in the `Edge Zones` detector in AppLens.
