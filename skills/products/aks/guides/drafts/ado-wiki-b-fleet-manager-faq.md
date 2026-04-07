---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Fleet Manager FAQs

[[_TOC_]]

## What happens if the identity assigned to a Fleet Member changes?

The Hub will be unable to propagate objects to the Fleet Member until you re-add the cluster to the Fleet.

## What would the Resource Groups look like for a deployed Fleet Manager cluster?

Creating a Fleet resource creates a Kubernetes Fleet Manager in the Resource Group defined on creation as well as a "Hub" AKS cluster in a `FL_` prefix name Resource Group with an additional `MC_FL_` prefix name Resource Group for the Hub clusters resources.

## What happens when you remove a Fleet Member from a Fleet?

The member becomes a regular AKS cluster with deployed objects remaining in place.

## Do objects propagated to Fleet Members get deleted when you remove an AKS cluster from a Fleet?

No they remain in place.

## What happens when you delete a Fleet Member cluster without removing it from the Fleet first?

It is removed from the Fleet automatically.

## If I remove a member from the Fleet then delete the objects or namespace the Fleet Hub had pushed to the member cluster, then re-add the member cluster to the Fleet does the Fleet Hub push the same objects via the CRP definition to the re-added member cluster?

Yes it does, the objects are replicated upon cluster being added to Fleet if those objects are able to be placed on the added member by selectors defined in the ClusterResourcePlacement (CRP).

## Do objects deployed to the Fleet Members also deploy to the Hub cluster?

No, the Hub cluster sends replicated objects to the member clusters with the exception of a ServiceExport installed to a member cluster as that will link to a ServiceImport on the Hub cluster.

## Must a resource exist in the Hub cluster before it can be replicated to member clusters?

Yes, otherwise it will report:

    Message:               the placement didn't select any resource or cluster when describing the clusterresourceplacement object

## What cluster would the Ingress be deployed to for an application spread across multiple Fleet Member clusters?

This is dependant on where you deploy your MultiClusterService and which clusters are part of your ClusterResourcePlacement definitions.

Reference:
[How to set up multi-cluster Layer 4 load balancing across Azure Kubernetes Fleet Manager member clusters (preview) | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/l4-load-balancing) covers installing the MultiClusterService to member-1 via ServiceExport which creates a ServiceImport on the Hub cluster and is inclusive of member-2 cluster where traffic to member-1 LB routes to member-1 and member-2 pods.

From [Azure Kubernetes Fleet Manager architectural overview | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/architectural-overview) note the following:

    Member clusters MUST reside either in the same virtual network, or peered virtual networks such that pods from different clusters can communicate directly with each other using pod IPs.

## Do my AKS clusters have to be connected via VNET peering or other mechanisms to use Fleet Manager?

Not unless you intend on having one of the AKS clusters as the ingress for an application that would use multiple AKS clusters as a backend.

## How do we troubleshoot objects not propagating to Fleet Member clusters?

Describe the ClusterResourcePlacement on the Hub cluster and look at the FILL THIS OUT FOR KUSTO TABLE TO REVIEW

## How do I specify which clusters my CRP propagates objects to?

See the following articles which cover the workflow and labels applied to nodes for this feature to function as well as ability to use cluster names:

- [Azure Kubernetes Fleet Manager architectural overview | Microsoft Learn](https://learn.microsoft.com/en-us/azure/kubernetes-Fleet/architectural-overview#kubernetes-resource-propagation)
- [Cluster names example](https://gitHub.com/Azure/AKS/blob/master/examples/Fleet/helloworld/hello-world-crp-by-cluster-names.yaml)
- [Cluster location/resource group/subscription example](https://gitHub.com/Azure/AKS/blob/master/examples/Fleet/helloworld/hello-world-crp-by-cluster-labels.yaml)

The following labels are added automatically to all member clusters, which can then be used for target cluster selection in resource propagation:
- `Fleet.azure.com/location`
- `Fleet.azure.com/resource-group`
- `Fleet.azure.com/subscription-id`

## If I edit an object in a member cluster does the Hub overwrite/reconcile the changes I make?

No it does not.

## If I edit an object in a Hub cluster does the Hub send those changes to the member clusters automatically?

No it does not.

## If I delete objects deployed to a member cluster does the Hub re-push them to the member via reconciliation?

Yes it does.

## Can I troubleshoot member clusters the same as a regular AKS cluster?

Yes - same tooling available as regular AKS clusters (ASI/ASC/AppLens/Jarvis).

## If I delete a ClusterResourcePlacement in the Hub cluster does that also delete the resources propagated to the member clusters?

Yes. Objects deployed are deleted from the member clusters upon deleting a CRP from a Hub cluster. This is also applicable if you delete a resource object like a namespace on the Hub cluster.

## Can I propagate an entire namespace?

Yes. ClusterResourcePlacement can be used to select and propagate namespaces, which are cluster-scoped resources. When a namespace is selected, all the namespace-scoped objects under this namespace are propagated to the selected member clusters along with this namespace.

## Can I stop my Fleet Member and Hub clusters to save money?

You can stop the Fleet Member clusters however the Hub cluster has a policy applied to it to prevent it from being stopped. Attempting to stop the Hub cluster will result in an error stating your client ID does not have permission to perform the stop action on your cluster.

## Why can't I create Pods on the Hub cluster?

The Hub cluster that the Fleet Members attach to does not allow Pod creation but does allow any other resource creation including Deployments, Service Accounts, etc to be propagated to your Fleet Member clusters as defined in your ClusterResourcePlacement.

## Owner and Contributors

**Owner:** Eric Lucier <ericlucier@microsoft.com>
**Contributors:**

- Eric Lucier <ericlucier@microsoft.com>
