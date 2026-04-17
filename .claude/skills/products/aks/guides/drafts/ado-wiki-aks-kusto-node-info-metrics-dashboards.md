---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Kusto query to get AKS nodes and metrics dashboard links"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FKusto%20query%20to%20get%20AKS%20nodes%20and%20metrics%20dashboard%20links"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto query to get the info of AKS nodes and the metric dashboard links

## Summary and Goals

This WIKI provides one quick method to get the information of AKS nodes and the metric dashboard links.

### Prerequisites

The entitlement, AKS Kusto Partners, to access the database, AKSccplogs.
The entitlement, FC Log Read-Only Access, to access the database, AzureCM.

### Involved Components

* ASC/ASI - get the resource ID or the Control Plane ID

## Implementation Steps

### Query 1: Get AKS node info + metrics dashboard by Control Plane ID

Uses `AKSccplogs` and `AzureCM` databases. Requires Control Plane ID as input.

Key tables:
- `AgentPoolSnapshot` — node pool metadata (vmSize, osSku, orchestratorVersion)
- `LogContainerSnapshot` — infra info (virtualMachineUniqueId, region)
- `KubeAudit` — node objects from audit logs

The query:
1. Fetches node pool metadata from `AgentPoolSnapshot`
2. Joins with `LogContainerSnapshot` for VM unique IDs and region info
3. Maps region to AzComputeShoebox account name
4. Constructs Geneva VMPerf dashboard links per node
5. Uses `KubeAudit` to enumerate current nodes and their properties
6. Outputs: pool, vmSize, base36 name, roleInstanceName, creation time, VM unique ID, region, and clickable vmPerf dashboard link

Parameters:
- `qCCP` — Control Plane ID
- `qNodePool` — (optional) filter to specific node pool
- `qInstance` — (optional) filter to specific instance

Output columns: pool, vmSize, base36, roleInstanceName, creationTime, virtualMachineUniqueId, RegionFriendlyName, AzComputeShoebox, vmPerf, nodeId, containerId

### Query 2: Get node pool metrics by Subscription ID and VMSS name

Uses `AzureCM.LogContainerSnapshot` and `AzureDCMDb.ResourceSnapshotHistoryV1`.

This query:
1. Finds all VMs matching the VMSS name in the subscription
2. Joins with DCM data for SocNodeId and CpuArchitecture
3. Generates per-VM and all-VM Geneva VMPerf dashboard links

Parameters:
- `subscription` — Subscription ID
- `vmname` — VMSS name

### Multi-node dashboard

To check multiple AKS nodes in one dashboard, concatenate virtualMachineUniqueId values with commas in the Geneva dashboard URL.

## Tips

- ASI Kusto queries are a good reference for building custom queries
- The RegionMap datatable maps Azure region names to AzComputeShoebox account names for Geneva dashboards

## Owner

Tom Zhu <zhuwei@microsoft.com>
