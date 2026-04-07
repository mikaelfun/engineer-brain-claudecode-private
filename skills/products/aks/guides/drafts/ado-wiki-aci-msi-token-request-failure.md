---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] MSITokenRequestFailure"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG MSITokenRequestFailure

## Check the Token Request Failure in Kusto

```kql
AccessTokenRequestEvent
| where TIMESTAMP >= datetime("2023-01-18T01:01:33.7790000Z") - 5m //update the time
| where TIMESTAMP <= datetime("2023-01-18T02:01:33.7790000Z") + 5m
| where Tenant contains "WARP-Prod-MWH" //update the region
| where successful == "False"
```

Check the incident message for detail on the failure.

## For BadRequest error

Make sure the subscription has access to identity.

## Check if a limitation exists

```kql
let start = datetime(2022-09-28 10:00:00);
let end = 2d;
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp between (start..end)
| where subscriptionId == "{sub_ID}"
| where httpMethod == "PUT"
| join kind=inner (Traces
    | where PreciseTimeStamp between (start..end)
    | where * contains "Limitation") on correlationId
| order by PreciseTimeStamp asc
| project PreciseTimeStamp, operationName1, message
```
