---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS Fleet Manager/Kusto Tables"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FKusto%20Tables"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Fleet Manager Kusto Tables

Below are the Kusto tables that would be used for troubleshooting AKS Fleet Manager operations.

| table | kusto cluster | component | description | sample queries |
|-|-|-|-|-|
| FleetAPIContextActivityEvents | <https://aks.kusto.windows.net/> | fleet-api | Detailed logs for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAPIContextlessActivityEvents | <https://aks.kusto.windows.net/> | fleet-api | Logs not associated with any operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#03aecb89-e0ae-453a-8785-f26736e166d8> |
| FleetAPIQoSEvents | <https://aks.kusto.windows.net/> | fleet-api | Result and latency for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAsyncContextActivityEvents | <https://aks.kusto.windows.net/> | fleet-async | Detailed logs for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAsyncContextlessActivityEvents | <https://aks.kusto.windows.net/> | fleet-async | Logs not associated with any operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#03aecb89-e0ae-453a-8785-f26736e166d8> |
| FleetAsyncQoSEvents | <https://aks.kusto.windows.net/> | fleet-async | Result and latency for each operation | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#eec4a052-4831-485e-b869-c376d1f4b699>|
| FleetAgentEvents | <https://aksccplogs.centralus.kusto.windows.net/> | fleet hub/member agents | Logs of fleet hub/member agents | <https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?#9d5fdaa3-0c26-45ce-9222-ca1fc5039c65>|

## Caravel Service Dashboard

[Caravel Fleet Dashboard](https://dataexplorer.azure.com/dashboards/6841e8dc-15a0-4abe-b5d2-37cdcfdde702?p-_startTime=24hours&p-_endTime=now#ea664902-48a0-4ed5-8005-2340e4e97b0f)

## Reference

[AKS Troubleshooting Guide - Fleet Kusto Tables](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/fleet/fleetfleet-kusto-tables)
