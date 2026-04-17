---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/AKS Private cluster (PG Brownbag)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Private%20cluster%20%28PG%20Brownbag%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Private Clusters

[[_TOC_]]

## Public Docs

<https://docs.microsoft.com/en-us/azure/aks/private-clusters>

## PG Brown Bag

Click [here](https://msit.microsoftstream.com/video/4bee433c-1211-454a-8d7e-fd5a8c411273) to access it.

## Deck Slides

Click [here](https://microsoftapc-my.sharepoint.com/:p:/r/personal/peni_microsoft_com/_layouts/15/guestaccess.aspx?e=tAmOqm&share=EdffwdwxAetEhFs9T5nR_AQBFmpY55VwkE3RUHV_yKEwhg) to access this resource.

## Private Cluster

Private Cluster is mainly designed only for simple goal that Kube-apiServer IP should be Private and Shouldn't be Public.

Please make sure that even Private Cluster is Enabled , AKS Cluster still need Standard Public IP as requirement and this will be eliminated by new Feature **[UserSet Outbound Type](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/34763/OutboundType-UDR-SLB-no-PIP-)**

Private Link is Implemented using Azure Networking feature called [Azure Private Link](https://docs.microsoft.com/en-us/azure/private-link/private-link-overview) which allows Service Provider to provide their service endpoint (as Private Endpoint) in a completely different VNET. Using this approach, One way connectivity can be initiated from the Private endpoint to the backing Private link Service . In case of AKS , Private Endpoint is created in Customer AKS VNET and Private Link Service is created at Control Plane. As communication is only allowed from Private Endpoint to Private Link Service only which is one way, API-Server will still require tunnel to talk to nodes, pools, and K8s services in overlay.

Diagram Representation from PG Brown Bag:

![image.png](/.attachments/image-4b871880-f147-4446-857d-47234a4e3ff9.png)

For PG Documentation Which is Only for Internal Use only, Please refer [Internal PG Private Link Doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/27060/Private-Cluster)

## Owner and Contributors

**Owner:** Enrique Lobo Breckenridge <enriquelo@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Walter Lopez <walter.lopez@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Sunil Immadi <suimma@microsoft.com>
