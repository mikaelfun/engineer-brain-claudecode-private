---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD User Management/TSG - Users Graph API query latency"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20User%20Management%2FTSG%20-%20Users%20Graph%20API%20query%20latency"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG - Users Graph API Query Latency

## Background
Customer may complain latency when calling Users Graph API. For example during B2C sign in, CPIM service will call Users Graph API. If customer observed some latencies which exceeds their expectation, you may need to pinpoint at which stage it delays the most.

## Key Investigation Steps

1. Identify the specific application calling Users Graph API
2. Determine if latency affects all apps in tenant or just one
3. Measure duration and ratio of high latency requests (count of high latency / count of all requests)

## Kusto Queries (MSODS GlobalIfxRestBusinessCommon)

### All requests by application
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-02T01:00)
| where contextId == "<tenantid>"
| where applicationId == "<applicationid>"
| project env_time, httpMethod, operationName, durationMs, correlationId, contextId, internalCorrelationId, applicationId, httpStatusCode, resourcePath, responseObjectCount, filterQueryParameter
```

### Count requests exceeding 5s threshold
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| where durationMs >= 5000
| summarize count()
```

### Duration line chart (identify when latency occurred)
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| project todatetime(env_time), durationMs
| render linechart
```

### P99 latency over time
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| summarize percentile(durationMs, 99) by bin(env_time, 5m), operationName
| render timechart
```

### Average latency over time
```kql
cluster('msodsweu.kusto.windows.net').database('MSODS').GlobalIfxRestBusinessCommon
| where env_time > datetime(2024-05-01T00:00) and env_time < datetime(2024-05-06T00:00)
| where contextId == "<tenantid>" and applicationId == "<applicationid>"
| summarize avg(durationMs) by bin(env_time, 5m), operationName
| render timechart
```

## Key Factors
1. **UpdateUser vs GetUser**: Update calls have larger response times due to distributed consistency and geo-availability (multiple writes required)
2. **Low ratio acceptable**: From RDS perspective, low ratio of high latency is acceptable; no 100% reliability guarantee
3. **No SLA for latency**: GetUser typically 200ms-500ms, but can spike to 1s at low ratio

## Escalation
If unreasonable ratio of high latency to Users Graph API is confirmed, raise ICM with details. Have Identity TA review and transfer to **IAM Services \ Users Graph API** team.
