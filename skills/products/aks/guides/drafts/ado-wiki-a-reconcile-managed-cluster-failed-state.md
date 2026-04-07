---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Jarvis/How to reconcile manage cluster in failed state"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FTools%2FJarvis%2FHow%20to%20reconcile%20manage%20cluster%20in%20failed%20state"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Reconcile Managed Cluster in Failed State

## Overview

This guide can be used to clear the state of a cluster. This avoids the need to send an "empty PUT" via <https://resources.azure.com>, which reduces the perceived effort during a support request. Before using this guide to clear the failed state of a cluster, you must first address why the cluster is in a failed state. Once the root cause of the failure has been fixed, the steps here can be used to clear the failed state.

## Usage

**Caution**: Do not use this on a cluster that is not in a failed state.

1. Go to <https://jarvis-west.dc.ad.msft.net/#/actions>, choose `Public` environment.
2. Choose `AzureContianerService AKS` blade, under `Resource Operations`, click `Get Managed Cluster`. Provide the required parameters and use `unVersioned` ApiVersion. Click `Run` to get the existing cluster info, scroll down to the bottom and note down the `createApiVersion`.
3. Under the same operation group, click `Reconcile Managed Cluster`, click `Get Access` to request JIT. Fill work item ID (or put 0 if you don't have one).
4. After getting JIT access, provide endpoint (region), Subscription, resource group name and resource name, and **choose the same ApiVersion as noted in step 2**.
5. Click `Run`.

## References

- [PG Documentation on process](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki?wikiVersion=GBwikiMaster&pagePath=%2FAKS%2FOverlay%2FRunbooks%2FOncall%2FGeneva%20Actions&pageId=9007&anchor=how-to-reconcile-a-managed-cluster)
