---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Resource health - \"Query success\" signal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FResource%20health%20-%20%22Query%20success%22%20signal"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Resource Health - "Query Success" Signal

## Service Health, Outages and Resource Health

The following rule-of-thumb should be followed:
- A Service Health of query success would typically correspond to one (or more) Resource Health query success signals.
- Not every Resource Health signal necessarily indicates an outage (Although it is likely to be correlated).

Each issue should be checked on a case-by-case basis.

## The Resource Health query success signal states

When Azure Service Health detects average latency in your Log Analytics workspace, the workspace resource health status is **Unavailable**.
When Azure Service Health detects query execution issue, the workspace resource health status is **Degraded**.

**MICROSOFT INTERNAL - DO NOT SHARE WITH CUSTOMERS:**

Three conditions for query success signal (any triggers Degraded):
1. QuerySuccessRate < 99% AND TotalRequests.Count > 500
2. QuerySuccessRate < 90% AND TotalRequests.Count >= 300 AND < 500
3. QuerySuccessRate < 80% AND TotalRequests.Count >= 100 AND < 300

These thresholds are subject to change - do not share with customers.

The signal does **not** calculate internal (S2S) queries like Sentinel, internal metadata calls, scheduled alert rules, etc. The threshold is only relevant for **user queries** (standard users or AAD registered applications).

## How to access Resource Health

1. From the Monitor service menu > **Service health > Resource health**, filter for Log Analytics.
2. From the Log Analytics workspace > **Resource health**.
3. From the Log Analytics workspace > **Insights** > **health** tab.

## FAQ

### How can customers check the impact of query success rate?

Customers can use the **AvailabilityRate_Query** SLI metric:
- See: https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-workspace-health#view-log-analytics-workspace-health-metrics

### What message does the customer see?

> "The query success rate for this workspace in the last 45 minutes was too low. We're working on mitigating this issue"

Resource Health messages also provide:
- Direct navigation to Metrics Explorer in context of affected workspace
- Reference to Service Health portal
- Link to public doc on monitoring Workspace Health

### How to help customers with root cause analysis

If a customer asks for RCA regarding a query success health signal:

1. **Check Service Health** for a corresponding issue affecting their workspaces reported by SRE team. A factual correlation indicates the root cause.
2. **Check query draft telemetry** from backend (ASC > Log Analytics workspace > Query Draft Telemetry tab):

```kql
let wsId = '<Enter ws id here>';
requests
| where customDimensions.['Workspace.workspaceId'] == wsId
| where resultCode != '200'
| extend Request_clientApp_ = tostring(customDimensions.["Request.clientApp"])
| extend QueryRan = tostring(customDimensions.["Request.rawBody"])
| extend Request_tokenizedPath_ = tostring(customDimensions.["Request.tokenizedPath"])
| extend Monitoring_source_ = tostring(customDimensions.["Monitoring.source"])
| extend Monitoring_scenario_ = tostring(customDimensions.["Monitoring.scenario"])
| extend Failure_message_ = todynamic(customDimensions.['Failure.message'])
| extend Failure_message_1 = todynamic(customDimensions.['Response.errorMessage'])
| extend message = iff(isnotempty(Failure_message_), Failure_message_, Failure_message_1)
| extend requestId = operation_ParentId
| order by timestamp
| project timestamp, Request_tokenizedPath_, Monitoring_source_, Monitoring_scenario_,
    Request_clientApp_, QueryRan, url, resultCode, Failure_message_,
    Failure_message_1, message, requestId
```

3. **Check for partial errors** on succeeded queries (2xx with error messages):

```kql
dependencies
| where customDimensions has '<wsId>'
-- continue filtering for partial error messages
```
