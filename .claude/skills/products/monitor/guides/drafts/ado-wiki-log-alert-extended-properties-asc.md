---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get log alert rule extended properties from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20log%20alert%20rule%20extended%20properties%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Log Alert Rule Extended Properties from Azure Support Center

## Instructions

1. Open ASC from the support request → navigate to Resource Explorer.
2. Locate the alert rule under **microsoft.insights** → **scheduledqueryrules** → click the rule.
3. Click on the **Properties** tab → observe details starting with scope.

## Property Reference

| Property | Description |
|----------|-------------|
| Scope | Scope on which customer query runs: LA / AI / Resource specific |
| API Version | API version used to create the alert rule |
| Is V2 | V1 = 2018-04-16. Newer versions supporting resource-centric rules and splitting by dimensions are V2 |
| Automatically resolve alerts | True = stateful, False = stateless |
| Is optimizable | Whether alert rule qualifies for optimization flow query strategy |
| Is optimized | Whether alert rule is evaluated using optimization flow |
| Is Invariant | True = query result only increases/plateaus/stays same over time (e.g., count > threshold). False = result can change as data arrives (e.g., average). Variant rules normally have a "less than" condition |
| Permissions object | Lists resource IDs requiring access to execute the query (e.g., VM resource + LA workspace) |
| Managed identity authentication details | Identity used for authentication. Required for ADX or ARG queries. N/A if not used |
| Mute actions duration (Minutes) | Time to wait before alert notifications trigger again. Applied per dimension combination |
