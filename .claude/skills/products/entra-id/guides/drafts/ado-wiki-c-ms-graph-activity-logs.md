---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph Activity Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20Activity%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph Activity Logs

## Overview

Customers may ask for us to send them Microsoft Graph API logs. Customers can self service and set up Microsoft Graph Activity Logs through Entra ID Diagnostics:
- https://learn.microsoft.com/en-us/graph/microsoft-graph-activity-logs-overview

Once Microsoft Graph Activity Logs has been set up, this will only collect any new requests. Please be aware of the limitations:
- https://learn.microsoft.com/en-us/graph/microsoft-graph-activity-logs-overview#limitations

For issues with Entra ID Diagnostics pushing MicrosoftGraphActivityLogs to Azure Monitor please see:
- https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/407453/TSG-Troubleshoot-Activity-Logs-sent-to-Azure-Monitor

## Kusto query

Customers still might push us to send them Microsoft Graph API logs for past events prior to setting up Microsoft Graph Activity Logs. Internal logs have PII truncated, so the self service logs will actually contain more data. We also do not want to expose internal only data.

```kusto
// MS Graph Activity Logs equivalent
let start = datetime(2025-04-21T18:26:53);
let end = datetime(2025-04-23T18:28:53);
let tenantIdFilter = "{tenant-id}"
let appIdFilter = "{app-id}"
cluster("msgraphkus").database("msgraphdb").GlobalAggregatorServiceLogEvent
| where env_time > start and env_time < end
| where tenantId == tenantIdFilter
| where appId == appIdFilter
| where tagId == 30746268
| extend DurationMs = (totalAgsDuration /10000)
| project startTime,TIMESTAMP,correlationId,tenantId,appId,oidClaim,requestMethod,responseStatusCode,apiVersion,incomingUri,tokenUti,responseSize,tokenClaims,DurationMs,userAgent,env_cloud_location,callerIpAddress
```

For more information about Kusto queries for Microsoft Graph API see https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/485299/Microsoft-Graph-API-TSG?anchor=using-kusto
