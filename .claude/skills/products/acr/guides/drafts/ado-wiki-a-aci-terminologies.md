---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/ACI Terminologies for Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Terminologies%20for%20Troubleshooting"
importDate: "2026-04-21"
type: guide-draft
---

# ACI Terminologies for Troubleshooting

## Container Group (CG)
A collection of containers scheduled on the same host machine, sharing lifecycle, resources, network, and storage volumes. Similar to a Kubernetes pod. Get CG name from the full resource URI in the Azure portal.

## Cluster Deployment Name (caas name)
The active instance of a Container Group. Only one active instance exists at a time. Required for obtaining execution cluster logs from the backend. Find via Kusto Helper or Kusto query against SubscriptionDeployments table.

## How to Find caas Name
1. Use Kusto Helper (Geneva dashboard) with SubscriptionId, resourceGroup, containerGroup values
2. Or use Kusto query against accprod cluster: query SubscriptionDeployments with resource URI and time range

## Key Points
- Execution cluster log does not store correlation IDs
- Always match cluster deployment to customer problem description and timestamp
- Use ASI (Azure Service Insights) for streamlined troubleshooting
