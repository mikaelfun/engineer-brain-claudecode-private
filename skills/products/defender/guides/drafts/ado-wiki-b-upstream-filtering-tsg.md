---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[TSG] - Upstream Filtering"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTSG%5D%20-%20Upstream%20Filtering"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Background
`UpstreamFiltering` is a simple backend service that aims to **send filtering rules** (officially named `RoutingRules`) to another service named SDS and owned by Scuba team. This filtering rules, are used to filter out from Scuba's EHs audit-log events originated from non-paying customers.

## Workflow
1. Requesting from `Defenders Pricing (core) API` all subscriptions that have specific pricing bundles enabled on them.
2. Getting from Scuba the currently stored `RoutingRules`.
3. Calculating the diff between Pricing data and Scuba's `RoutingRules`.
4. Sending request to add/delete `RoutingRules` form scuba based on the diff calculated.

# What to do:
For any Monitor that was triggered regading UpstreamFiltering we should first identity if the issue is coming from the service dependencies (pricing/scuba) - **if the answer is yes**, you should **contact the service OnCall**. **If the answer is no**, you should **contact Sefi Tufan**.

## Identify the issue

Find the last failed run in the last 4h:
```kql
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where ingestion_time() > ago(4h)
| where env_name == "Microsoft.Azure.Security.Detection.UpstreamFilteringService"
| where name == "UpstreamFilteringTaskSender.SendUpstreamFilteringTasksAsync"
| where OperationResult == "Failure"
| summarize arg_max(env_time, resultDescription)
| take 1
```

Take the trace id from above query and let's find out which operation threw this exception:
```kql
let traceId = "<replace trace id>";
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where ingestion_time() > ago(4d)
| where env_name == "Microsoft.Azure.Security.Detection.UpstreamFilteringService"
| where env_dt_traceId == traceId
| project env_time, name, OperationResult, resultDescription, customData
```

The names of the operations are pretty descriptive, if you see a failure message from the `PricingProvider.GetEnrichedPricingDataAsync, UpstreamFilteringTaskSender.GetEnrichedPricingData` operation, understand if it's pricing service issue like `internal server error` and contact Pricing OnCall: `Defenders - internal - pricing`. If it's authentication/timeout issue contact the Sefi Tufan to look into it.
And the same goes for operations which used to get/send data to Scuba Config API such as: `UpstreamFilteringTaskSender.GetRoutingRulesFromScuba, ScubaRoutingRulesAPI.PostRequestInBatchesToScuba.UpsertRoutingRules/RemoveRoutingRules`.
Check who's OnCall for `Scuba Security Platform - Platform-ASC` and contact them if it looks like the issue originats from their service.
