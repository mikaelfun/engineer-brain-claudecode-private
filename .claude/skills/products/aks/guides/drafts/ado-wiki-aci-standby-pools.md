---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/Standby Pools"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Standby%20Pools"
importDate: "2026-04-21"
type: guide-draft
---

# ACI Standby Pools Troubleshooting

## Architecture

Standby Pools work like Kubernetes ReplicaSets: a container group profile template generates/recycles instances.

Resources: containerGroupProfiles (ACI RP) -> standbyContainerGroupPools (StandbyPool RP/PMaaS)

**Chain**: UserReq -> ARM -> PMaaSRP -> PoolMgr -> PoolWorker -> ACIRP -> containerInstance

## Key Kusto Tables

- PMaaSPoolRPServiceEvent: RP-level CRUD records
- PMaaSPoolManagerServiceEvent: Pool management records
- PMaaSPoolWorkerServiceEvent: Worker-to-ACI interaction records

**Important**: Data is in azurecm.kusto.windows.net (NOT accprod.kusto.windows.net)

## Troubleshooting

### StandbyPool CRUD Issues
Query PMaaSPoolRPServiceEvent: where Message contains <resourceId>

### ContainerGroup Lifecycle Issues
1. Get CG name from pool worker logs
2. Follow regular ACI troubleshooting for the CG
3. For missing/unexpected instances: check PMaaSPoolWorkerServiceEvent
4. Note: use subscriptionId/resourceGroup/standbyPoolName (not full resource ID) in where clause
