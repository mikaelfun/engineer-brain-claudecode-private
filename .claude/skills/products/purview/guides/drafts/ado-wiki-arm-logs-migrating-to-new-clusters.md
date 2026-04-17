---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Quick Kusto Library/ARM logs are migrating to new clusters"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Overview

ARMProd Kusto Cluster is a data store for ARM Operational Logs e.g., HttpIncomingRequests, HttpOutgoingRequests, DeploymentOperations etc. ARM internal teams as well as several Partner teams query this cluster to use ARM Logs for various use cases.

Current ARMProd Kusto Cluster had been facing many performance issues, e.g. heavy ingestion ingress load, no support for application based access, slow query performance etc. New ARM Logs v2 Clusters are created to address these issues.

## Cluster changes

The ARMProd Kusto cluster will be retired on 12/31/2023 and replaced by 3 regional clusters:

- ARMPRODEUS: https://armprodeus.eastus.kusto.windows.net
- ARMPRODWEU: https://armprodweu.westeurope.kusto.windows.net
- ARMPRODSEA: https://armprodsea.southeastasia.kusto.windows.net

This is to ensure data residency requirements. The location where the logs will be stored is determined by the ARM role instance where the workload is running.
ARM PG has provided a way to group the above regional clusters for query purposes via the following global cluster:

- ARMPRODGBL: https://armprodgbl.eastus.kusto.windows.net

From CSS, we would mostly query this global cluster for troubleshooting purposes. To run a query on the global cluster, users must use the Unionizer function (example further below).

NOTE: There are currently no changes planned for Fairfax or Mooncake clusters.

## Database changes

On the previous ARMProd cluster, most tables lived under a database with the same name (ARMProd). In the new cluster, the table to database structure has changed as follows:

| Database | Tables |
|--|--|
| Requests | EventServiceEntries, HttpIncomingRequests, HttpOutgoingRequests |
| Deployments | DeploymentOperations, Deployments, PreflightEvents |
| Traces | Errors, Traces |
| Providers | ProviderErrors, ProviderTraces |

Additional tables that used to be present under ARMprod are now restricted to the ARM team.

## How to query?

From the global cluster, users can query all regional clusters in a single query with the Unionizer format.
```
Unionizer("Requests", "HttpIncomingRequests")
| where TIMESTAMP >= ago(1h)
| take 10
| summarize Count = count() by $cluster, httpMethod
```
Where Requests represents the database name and "HttpIncomingRequests" represents the table name. The rest of the query syntax remains the same.
The query with the full path will look like this:

```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where TIMESTAMP >= ago(1h)
| take 10
| summarize Count = count() by $cluster, httpMethod
```

## Access

There are no changes in access. Current users that have access to the ARMprod Kusto cluster should already have access to the new ARM regional and global clusters.
Getting Access: https://aka.ms/ARMLogsV2Access

## Resources

Docs: https://aka.ms/ARMLogsV2
