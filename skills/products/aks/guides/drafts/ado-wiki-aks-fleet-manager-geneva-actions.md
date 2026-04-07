---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/Geneva Actions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FGeneva%20Actions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Fleet Manager and Geneva

[[_TOC_]]

This doc explains how to use Fleet geneva actions

## Fleet Geneva actions in Jarvis

Fleet geneva actions are found in Jarvis under AKS folder: <https://aka.ms/caravel/geneva>

We currently provide geneva actions to trigger a subset of our APIs operations:

- Fleets
  - Get, Update, Fail
- Fleet Credentials
  - List
- Members
  - Get, List, Update, Fail, Delete
- Membership
  - Get, Update, Fail, Delete
- UpdateRuns - (Update Orchestration)
  - Get, List, Update, Start, Stop, Delete

There are no meaningful fields that can be updated on Members or Fleets resources at this time, so very little can actually be done via these actions.

However, both Fleet and Members point at an AKS cluster.

- A Fleet is backed by an AKS cluster (the hub) and so all Geneva actions from AKS can apply to the hub cluster for troubleshooting.
The `HubProfile` is stored on the ManagedCluster internal datamodel, and can be modified and reconciled via AKS geneva actions.

- A Member of a fleet is an AKS cluster.
The `member agent` configuration is stored in the internal datamodel of the aks cluster. Therefore, AKS geneva actions can be used to
troubleshoot Member clusters as well.
For example, you can change a parameter on the MembershipProfile stored on the ManagedCluster and reconcile it.

## JIT required

The JIT required to run the Geneva actions is outlined by the geneva action itself. We will only have access to actions requiring PlatformServiceViewer.

- READ actions only require PlatformServiceViewer.
- Put Fleet requires AKSEngineer-PlatformServiceOperator
