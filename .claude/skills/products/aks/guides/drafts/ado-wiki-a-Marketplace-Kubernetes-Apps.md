---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Marketplace Kubernetes Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMarketplace%20Kubernetes%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Marketplace Kubernetes Applications on AKS

[[_TOC_]]

## Summary

K8s Applications are currently published by ISVs under Azure Container product category. Each k8s application can be identified by a Publisher, Product and Plan.
This guide is to help identify issues with purchase of K8s Applications from Azure Marketplace by the Customers.

## Scenario

1. User selects a Product\offer\Plan from Azure Marketplace.
2. User provides inputs in the UX presented once offer purchase is initiated.
3. User  accepts EULA and creates.
4. The create initiates an ARM deployment.

## Components and Ownership

| Component |Description  | Owner |
|--|--|--|
|  Microsoft.KubernetesConfiguration/extensions| The resources which represents the offer  | Arc Extensions Platform team |
|  Microsoft.ContainerService/managedClusters|  the offer may need a new cluster to be created| AKS team  |
|  Helm Chart| ISV provides helm chart and Microsoft distributes it from Microsoft's owned ACR | ISV  |
| ARM template | ISV authors it with Microsoft(Arc team) Provided guidance |  ISV|
|  CreateUIDef | ISV authors it with Microsoft(Arc team) Provided guidance  | ISV |
|  Usage Extension | Microsoft's own extension to collect usage data and is installed before the application is installed | Arc Extensions Platform team  |

ARM template will contain two resources:

- Microsoft.ContainerService/managedClusters
- Microsoft.KubernetesConfiguration/extensions

### Component and Owner Identification flow

- End user reported a Container offer issue
  - Is it transactable Container offer-k8s?
    - End user reported a Portal navigation issue → Portal team
    - End user reported an ARM deployment error → Identify failed resource:
      - Microsoft.ContainerService/managedClusters → AKS team
      - Microsoft.KubernetesConfiguration/extensions → Arc Extensions Platform team
      - Microsoft.KubernetesConfiguration/extensions/UsageExtension → Arc Extensions Platform team

### Extension Deployment Failure

#### Information to gather from the Customer

- Subscription\ResourceGroup
- Cluster Arm Resource url
- Correlatition Id displayed in the operation details
- Publisher\offer\plan information
- Region customer is trying to deploy the resource in

#### Initial Analysis

1. Rule out any issues with the cluster health at the time of deployment.
   1. Customer may check the Activity log on the cluster.
2. Confirm on the customers ability to purchase.
   1. the Error on the reource indicates a Store API error.
3. Rule out if the customer has registered the required RPs

### Prerequisites

1. Get ReadOnly access to **PTN-ClusterConfig** from myaccess/
1. Download Kusto.Explorer from <https://aka.ms/ke>, or use web version from <https://dataexplorer.azure.com>

### Kusto tables

|Name|Description|
| ---|-----------|
| ConfigAgentTraces  | This table has Arc extension operator and Arc agent log  from  user k8s cluster.|
| ClusterConfigTraces | This table has Arc Azure Service (Resource provider and Data plane) logs.  |

### Queries

```txt
//Logs by extension instance name or ARM ID
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Tenant == "{tenant-Region}"
| where RequestPath contains "extensions/{replaceyourinstancename}" or ArmId contains "{clusterName}"

// Logs by ARM correlation ID or client request ID
cluster("clusterconfigprod").database("clusterconfig").ClusterConfigTraces
| where ['time'] >= ago(1h)
| where Tenant == "{tenant-Region}"
| where CorrelationId == "{CorrelationId}"

// Extension operator logs by extension type
cluster("clusterconfigprod").database("clusterconfig").ConfigAgentTraces
| where ['time'] >= ago(1d)
| where CorrelationId == "{CorrelationId}"

// Extension operator logs by ARM ID
cluster("clusterconfigprod").database("clusterconfig").ConfigAgentTraces
| where ['time'] >= ago(1d)
| where ArmId contains "{ExtensionName}"
```

### Usage Extension deployment Failure

Usage extension failures can be seen from the CLI. it is installed only for extensions which are not BYOL.

CLI: `az k8s-extension list -g newstablevote -c newstablevote -t managedclusters -o table`

## Escalation Path

- ICM Team: Cluster Configuration/Cluster Configuration Triage
- Feature Team: <ramyateam@microsoft.com>

## References

- Public Docs Troubleshooting: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-failed-kubernetes-deployment-offer>
- Extension Types CLI: <https://learn.microsoft.com/en-us/cli/azure/k8s-extension/extension-types?view=azure-cli-latest>
- Offer Samples: <https://github.com/Azure-Samples/kubernetes-offer-samples>
