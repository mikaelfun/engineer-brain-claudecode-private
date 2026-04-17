---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/[TSG] Diagnostic Setting API calls fail with 5xx response codes"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FDiagnostic%20Settings%2FTroubleshooting%20Guides%2F%5BTSG%5D%20Diagnostic%20Setting%20API%20calls%20fail%20with%205xx%20response%20codes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] Diagnostic Setting API calls fail with 5xx response codes

## Scenario
Customer is attempting to create a new diagnostic setting or update an existing diagnostic setting but receives "internal server error" (500).

## Information Needed
1. CorrelationId from the ARM EventServiceEntries table

## Troubleshooting Steps

### Step 1 - Get correlationId from ARM
Query the ARM table EventServiceEntries:

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')
let startDateTime = datetime(2024-07-03 14:00:00);
let endDateTime = datetime(2024-07-03 23:00:00);
Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (startDateTime .. endDateTime)
| where subscriptionId contains "<SUBSCRIPTION_ID>"
| where resourceUri contains "<RESOURCE_ID>"
| where operationName contains "microsoft.insights/diagnosticSettings"
| extend principalType = extractjson("$.evidence.principalType", authorization)
| extend role = extractjson("$.evidence.role", authorization)
| extend userPrincipalName = extract("claims/name\":\"([^\"]+)\"", 1, claims)
| project TIMESTAMP, ActivityId, correlationId, principalPuid, claims, properties, authorization, operationName, status, subStatus, userPrincipalName, principalType, principalOid
```

### Step 2 - Get ActivityId from Insights service
Use the correlationId to find the Insights service request:

```kusto
// cluster('azureinsights.kusto.windows.net').database('Insights')
SvcIncomingRequests
| where PreciseTimeStamp > ago(2d)
| where correlationId =~ "<CORRELATION_ID>"
| project PreciseTimeStamp, ActivityId, httpVerb, statusCode
```

### Step 3 - Check outgoing calls for failures
Use the ActivityId to check if any downstream service calls failed:

```kusto
// cluster('azureinsights.kusto.windows.net').database('Insights')
SvcOutgoingRequests
| where PreciseTimeStamp > ago(30d)
| where ActivityId =~ "<ACTIVITY_ID>"
| project PreciseTimeStamp, targetUri, statusCode
```

### Step 4 - Check for error details
```kusto
// cluster('azureinsights.kusto.windows.net').database('Insights')
SvcErrors
| where PreciseTimeStamp > ago(3d)
| where ActivityId =~ "<ACTIVITY_ID>"
| project PreciseTimeStamp, message
```

## Common Root Cause Example
When creating a diagnostic setting, the service performs a GET on the target resource first. If an expected property (e.g., `properties.defaultHostName`) is missing from the response, the Diagnostic Setting creation fails and throws a 500 error.
