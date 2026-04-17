---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Quick Kusto Library/[Kusto] changes on Query - DataScanAgentEvent"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FQuick%20Kusto%20Library%2F%5BKusto%5D%20changes%20on%20Query%20-%20DataScanAgentEvent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [Kusto] DataScanAgentEvent Migration to DataScanAgentLinuxEvent

Due to migration in Purview infra, the Kusto table **DataScanAgentEvent** is being replaced with **DataScanAgentLinuxEvent** for Azure IR troubleshooting.

## How to Check if K8S Migration Applies

Run the following query to check if the scan job is running via K8S:

```kql
database("babylonMdsLogs").ScanningLog
| where ScanResultId == "{scanResultID}"
| where Message contains "k8s"
```

- If **no output** → continue using original `DataScanAgentEvent` queries
- If **output found** → use `DataScanAgentLinuxEvent` queries below

## DataScanAgentLinuxEvent Query

```kql
cluster('{kustoCluster}').database('{kustoDatabase}').DataScanAgentLinuxEvent
| where ScanResultId == '{scanResultID}'
//| where Message contains "syntax error" or Message contains " unexpected " or Message contains "failed " or Message contains "terminated " or Message contains "unsupported " or Message contains "exception " or Message contains "memory" or Level == "1" or Level == "2" or Level == "3"
// Level 1 = Critical, 2 = Error, 3 = Warning
```

## Find Cluster by Region

Use the following query to get the region name:

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "{scanResultID}"
| project Tenant
```

Then find the cluster from the [Kusto Cluster Details page](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/azure-data-governance/security-platform-ecosystem/microsoft-purview/microsoft-purview-troubleshooting-guides/regionexpansion/regionexpansion/kustoclusterdetails).

## Cluster List (DataScanAgentLinuxEvent uses same clusters as DataScanAgentEvent)

| Region | Cluster |
|--------|---------|
| East US 2 | `babylon.eastus2.kusto.windows.net` |
| East US 2 EUAP | `purviewadxeus2euap.eastus2euap.kusto.windows.net` |
| West Central US | `purviewadxwcus.westcentralus.kusto.windows.net` |
| East US | `purviewadxeus.eastus.kusto.windows.net` |
| West Europe | `purviewadxweu.westeurope.kusto.windows.net` |
| Southeast Asia | `purviewadxsea.southeastasia.kusto.windows.net` |
| Brazil South | `purviewadxbrs.brazilsouth.kusto.windows.net` |
| East US 2 | `purviewadxeus2.eastus2.kusto.windows.net` |
| Canada Central | `purviewadxcc.canadacentral.kusto.windows.net` |
| South Central US | `purviewadxscus.southcentralus.kusto.windows.net` |
| Central India | `purviewadxcid.centralindia.kusto.windows.net` |
| UK South | `purviewadxuks.uksouth.kusto.windows.net` |
| Australia East | `purviewadxae.australiaeast.kusto.windows.net` |
| North Europe | `purviewadxne.northeurope.kusto.windows.net` |
| West US 2 | `purviewadxwus2.westus2.kusto.windows.net` |
| France Central | `purviewadxfc.francecentral.kusto.windows.net` |
| Korea Central | `purviewadxkc.koreacentral.kusto.windows.net` |
| Central US | `purviewadxcus.centralus.kusto.windows.net` |
| UAE North | `purviewadxuaen.uaenorth.kusto.windows.net` |
| Japan East | `purviewadxjpe.japaneast.kusto.windows.net` |
| West US | `purviewadxwus.westus.kusto.windows.net` |
| Switzerland North | `purviewadxstzn.switzerlandnorth.kusto.windows.net` |
| South Africa North | `purviewadxsan.southafricanorth.kusto.windows.net` |
| Germany West Central | `purviewadxdewc.germanywestcentral.kusto.windows.net` |
| West US 3 | `purviewadxwus3.westus3.kusto.windows.net` |
| Australia Southeast | `purviewadxase.australiasoutheast.kusto.windows.net` |
| North Central US | `purviewadxncus.northcentralus.kusto.windows.net` |

Database: `DataScanLogs`
