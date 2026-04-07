---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Admin Highlights/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Admin%20Highlights/Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Admin Highlights / Insights — Troubleshooting

## Common Error Codes and Failure Tags

### Expected Failures (No IcM Alert)

| Failure Tag | Description | Resolution |
| --- | --- | --- |
| FlightDisabled | Insights feature not enabled for tenant | Enable flight for tenant |
| TestEnvironment | Service Health API skipped in TEST env | Expected in test environments |
| InvalidTenantId | Tenant ID format is invalid | Check tenant ID format (GUID) |
| ServiceHealthDisabled | Service Health feature disabled for tenant | Enable ServiceHealth flight |
| EntityNotFoundException | Insight ID not found in database | Invalid ID, expired (TTL), or never created |
| DataLeakException | User accessing data from different tenant | Security check - expected |
| ArgumentNullException | Missing required parameter | Check API request parameters |
| 401/Unauthorized | OBO token acquisition failed | User needs proper permissions |
| 403/Forbidden | Access denied to Service Health API | Tenant may lack Graph permissions |

### Unexpected Failures (May Trigger IcM)

| Failure Tag | Description | Resolution |
| --- | --- | --- |
| NullQueryParameters | Query parameters not provided | Code bug - check topic/subcategory mapping |
| InvalidResourceName | Service Health resource name invalid | Code configuration issue |
| HttpRequestException | HTTP call failed with unexpected error | Check network, downstream service |
| TaskCanceledException | Request timed out | Increase timeout or check service health |
| Exception (generic) | Unhandled exception | Check logs for stack trace |
| 500/Other 5xx | Server error from downstream | Check downstream service status |

## Kusto Queries

### 1. Find Insights API Errors

```kusto
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName in ("HighlightController", "HighlightService", "HighlightSourceDataService")
| where TraceLevel <= 3
```

### 2. Investigate Service Health API Failures

```kusto
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
```

### 3. Find Errors for Specific Tenant

```kusto
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where TenantId == "<TenantId>"
| where UserId == "<UserId>"
| where ComponentName contains "Highlight"
| where TraceLevel <= 3
```

### 4. Track HTTP Failures by Status Code

```kusto
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient" or ComponentName contains "Highlight"
| where Message contains "code: 4" or Message contains "code: 5"
| summarize Count = count() by bin(env_time, 1h)
```

### 5. Error Distribution Summary

```kusto
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight" or ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
| summarize ErrorCount = count() by ComponentName
| order by ErrorCount desc
```

### 6. Daily Error Trend

```kusto
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight"
| summarize Total = count(), Errors = countif(TraceLevel <= 2), Warnings = countif(TraceLevel == 3) by bin(env_time, 1d)
```
