---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Customer Facing Queries for AGW"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Gateway Customer-facing Logs

Examples of Kusto queries for Application Gateway resources with Diagnostic Settings enabled.

## Diagnostic Settings Tables

**Azure Diagnostics (legacy)** — AzureDiagnostics table. Drawbacks: noisy (requires Category filter), Daily Cap risk, cross-AGW mixing.

**Resource Specific (new)** — AGWAccessLogs, AGWFirewallLogs, AGWPerformanceLogs. Benefits: per-service tables, independent retention, better performance, RBAC per table.

## AzureDiagnostics AccessLogs

```kusto
// All AccessLog by AppGW Name
AzureDiagnostics
| where Category == "ApplicationGatewayAccessLog" and Resource =~ "myAppGW"

// WAF 403 Blocks (serverStatus empty = WAF block, not backend 403)
AzureDiagnostics
| where Category == "ApplicationGatewayAccessLog" and Resource =~ "myAppGW"
| where httpStatus_d == 403 and serverStatus_s == ""
| project TimeGenerated, clientIP_s, httpMethod_s, originalHost_s, requestUri_s, userAgent_s, transactionId_g, listenerName_s, ruleName_s

// All 4xx / 5xx from backend
AzureDiagnostics
| where Category == "ApplicationGatewayAccessLog" and Resource =~ "myAppGW"
| where serverStatus_s startswith "4"  // or "5" for 5xx
```

## AzureDiagnostics FirewallLogs

```kusto
// WAF Blocks
AzureDiagnostics
| where Category == "ApplicationGatewayFirewallLog" and Resource =~ "myAppGW"
| where action_s =~ "Blocked"

// Block details by TransactionID
AzureDiagnostics
| where Category == "ApplicationGatewayFirewallLog" and Resource =~ "myAppGW"
| where transactionId_g == "<transactionId>"
| project TimeGenerated, clientIp_s, hostname_s, requestUri_s, ruleSetVersion_s, ruleId_s, Message, action_s, details_message_s, details_data_s, transactionId_g
```

## Resource Specific AccessLogs

```kusto
// WAF 403 Blocks
AGWAccessLogs
| where _ResourceId contains "core-agw-v2"
| where HttpStatus == 403 and isnull(ServerStatus)
| project TimeGenerated, ClientIp, HttpMethod, OriginalHost, RequestUri, UserAgent, TransactionId, ListenerName, RuleName

// All 4xx/5xx from backend
AGWAccessLogs
| where _ResourceId contains "core-agw-v2"
| where ServerStatus >= 400 and ServerStatus < 500
```

## Resource Specific FirewallLogs

```kusto
// WAF Blocks
AGWFirewallLogs
| where _ResourceId contains "myAppGW"
| where Action =~ "Blocked"
```

## Known Issues

**Diagnostic Settings Conflict**: Cannot have multiple Diagnostic Settings with same Log category to same LAW (even if Destination Table differs).

**Missing Logs Troubleshooting**:
1. Simplify query to base table first
2. Check case-sensitivity (`==` vs `=~`)
3. Expand time range to find earliest/latest TimeGenerated

## References
- [Application Gateway Monitoring Data Reference](https://learn.microsoft.com/en-us/azure/application-gateway/monitor-application-gateway-reference#resource-logs)
- [KQL Quick Reference](https://learn.microsoft.com/en-us/kusto/query/kql-quick-reference?view=microsoft-fabric)
