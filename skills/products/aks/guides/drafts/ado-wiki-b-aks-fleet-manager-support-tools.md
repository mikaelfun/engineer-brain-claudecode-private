---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/Support Tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FSupport%20Tools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Fleet Manager Support Tools

## Azure Support Center (ASC)

<https://azuresupportcenter.msftcloudes.com/>

There is a resource type called "fleets" under `Microsoft.ContainerService`. Use the top tab **Members** to see what member clusters are connected.

## Azure Service Insights (ASI)

<https://azureserviceinsights.trafficmanager.net/>

ASI shows check marks in the **Features** area when viewing an AKS cluster, indicating if it is a Fleet Hub or Fleet Member Cluster.

Additionally, use the **Search** function in ASI to find Fleet Resources and Operation IDs.

## Jarvis / Geneva Actions

[Jarvis / Geneva Actions (SAW REQUIRED)](https://aka.ms/caravel/geneva)

See Geneva Actions wiki page for screenshots and explanation of actions. JIT required:
- READ actions: PlatformServiceViewer
- Put Fleet: AKSEngineer-PlatformServiceOperator

## Caravel Service Dashboard

[Caravel Service Dashboard](https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?p-_startTime=24hours&p-_endTime=now#ea664902-48a0-4ed5-8005-2340e4e97b0f)

See Kusto Tables wiki page for links to individual dashboards and Kusto table/cluster names.
