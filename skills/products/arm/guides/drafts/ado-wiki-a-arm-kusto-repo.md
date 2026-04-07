---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/AON Kusto Repo/ARM Kusto Repo"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FTools%20and%20Processes%2FAON%20Kusto%20Repo%2FARM%20Kusto%20Repo"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Description
KQL queries for Azure Resource Manager (ARM) Kusto Clusters for troubleshooting AON resource operations.

ARM acts as the management layer: validates requests (Entra ID tokens, RBAC), applies Azure Policies, routes to Resource Provider (RPaaS for AON).

## How to Access
- Cluster URL: https://armprodgbl.eastus.kusto.windows.net/
- Database: ARMProd
- Requires `macro-expand` syntax for cross-region queries

## Query Template
```kql
macro-expand isfuzzy=true ARMProdEG as X(
    X.database('<Database>').<Table>
    | <Query>
)
```

## HttpIncomingRequests - ARM CRUD Operations
Review all CRUD operations ARM received for a given resource. Collects correlation IDs and timestamps.

```kql
let ARMPRODEntityGroup = entity_group [cluster('armprodeus.eastus.kusto.windows.net'), cluster('armprodweu.westeurope.kusto.windows.net'), cluster('armprodsea.southeastasia.kusto.windows.net')];
macro-expand isfuzzy=true ARMPRODEntityGroup as X (
    X.database("Requests").HttpIncomingRequests
    | where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
    | where subscriptionId contains "{subscription}"
    | where targetUri contains "{ResourceID}"
    | project PreciseTimeStamp, subscriptionId, correlationId, httpMethod, userAgent, ActivityId, TaskName, httpStatusCode, operationName, apiVersion,
      ResourceProvider=targetResourceProvider, ResourceType=targetResourceType, durationInMilliseconds,
      Message = strcat(
        iif(isnotempty(exceptionMessage), strcat("exceptionMessage: ", exceptionMessage, ";\n"), ""),
        iif(isnotempty(tostring(errorCode)), strcat("errorCodeE: ", tostring(errorCode), ";\n"), ""),
        iif(isnotempty(tostring(failureCause)), strcat("failureCause: ", tostring(failureCause), ";\n"), ""),
        iif(isnotempty(errorMessage), strcat("errorMessage: ", errorMessage, ";\n"), "")),
      referer, targetUri
    )
    | sort by PreciseTimeStamp asc
```

## Traces - RBAC Authorization (403 Errors)
For ARM 403, get details on authorization failure.

```kql
let ARMPRODEntityGroup = entity_group [cluster('armprodeus.eastus.kusto.windows.net'), cluster('armprodweu.westeurope.kusto.windows.net'), cluster('armprodsea.southeastasia.kusto.windows.net')];
macro-expand isfuzzy=true ARMPRODEntityGroup as X (
    X.database("Traces").Traces
    | where PreciseTimeStamp >= ago(3d)
    | where correlationId == "{correlationID}"
    | where message contains "Denied" or message contains "failed access"
    | project PreciseTimeStamp, subscriptionId, correlationId, ActivityId, TaskName, operationName, message
    )
    | sort by PreciseTimeStamp asc
```
