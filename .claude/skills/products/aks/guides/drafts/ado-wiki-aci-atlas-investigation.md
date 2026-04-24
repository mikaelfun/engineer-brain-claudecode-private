---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] ACI ATLAS Investigation Flow Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/%5BTSG%5D%20ACI%20ATLAS%20Investigation%20Flow%20Kusto"
importDate: "2026-04-21"
type: guide-draft
---

# ACI ATLAS Deep Investigation Flow (Kusto)

## Investigation Sequence

Follow steps 10-100 through ACI infrastructure layers:

1. **Get cluster deployment name**: Query accprod.SubscriptionDeployments by subscriptionId + containerGroup
2. **Get SF SingleInstance**: Query SbzExecSFEvent across regional clusters (americas/europe/asiapacific) by clusterDeploymentName
3. **Check Containerd Events**: Query ContainerdEvent for container lifecycle (create/start/stop/kill)
4. **Review SF Execution Events**: Check SbzExecEvent for deployment/provisioning status
5. **Network Investigation**: Query network-level events if connectivity issues suspected

## Key Kusto Clusters

- accprod.kusto.windows.net (ACI RP layer)
- atlaslogsamericas.eastus / atlaslogseurope.northeurope / atlaslogsasiapacific.southeastasia (SF Execution layer)

## Complementary Tool

Azure Service Insights (ASI) - add ACI option to profile for quick overview.
