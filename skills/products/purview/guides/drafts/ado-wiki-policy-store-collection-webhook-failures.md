---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Policy/Policy - Customer Issues/Policy Store Collection Webhook Requests are failing"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FPolicy%2FPolicy%20-%20Customer%20Issues%2FPolicy%20Store%20Collection%20Webhook%20Requests%20are%20failing"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Policy Store Collection Webhook Requests are failing

## Issue
The Policy Store is a crucial service involved in creation and deletion of collections. If the collection creation or deletion fails, the Policy Store service may be involved.

Possible reasons for failure:
- Failure to perform CRUD on Artifact Store for the policy (PurviewAuthzPolicy)
- Failure to publish event in Storage queue for consumption by Authorization service

## Triaging Steps

### 1. Check Geneva Metrics Dashboard
Dashboard: https://portal.microsoftgeneva.com/dashboard/BabylonProd/PolicyStore/Collection%2520Webhook

Find the exception type by correlating exception with failures in the charts.

### 2. Exception Type Breakdown

| Exception Type | Meaning |
|---|---|
| ErrorResponseException | Unhandled ErrorResponseException received from Artifact Store |
| ArtifactStoreException | Unhandled ArtifactStoreException received from Artifact Store |
| PolicyStoreException | Handled Exception in Policy Store (e.g., Artifact Store returned 404) |
| Exception | Unhandled Exception in Policy Store (System Error, etc.) |
| TaskCanceledException | Task was cancelled (timeout or cancellation) |

### 3. Drill Down with Kusto/Jarvis Logs

**Geneva Config:**
- Endpoint: Diagnostics PROD
- Namespace: PolicyStoreProd
- Events: PolicyStoreLogEvent

**Kusto Query** (on https://dataexplorer.azure.com/clusters/babylon.eastus2/databases/babylonMdsLogs):

```kql
PolicyStoreLogEvent
| where ExceptionType == "<YourExceptionType>"
| where ['time'] > ago (1d)
| project CorrelationIdError = CorrelationId
| join (PolicyStoreLogEvent | where ['time'] > ago(1d) | where ExceptionMessage != "null")
  on $left.CorrelationIdError == $right.CorrelationId
| project CorrelationId, ExceptionMessage, Message, AccountId
```

> Replace `<YourExceptionType>` with the actual exception type from step 2.
> Replace `1d` with your lookup time range.

## Resolution

With the log search results, identify the failing component and symptoms. Then:
1. Check **Known Issue and Mitigation** to see if this is a known issue
2. If symptoms match and mitigation exists, follow mitigation steps
3. If no symptom match, contact the corresponding **Component SMEs**
