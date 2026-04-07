---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to identify a Simple Log Alert"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20identify%20a%20Simple%20Log%20Alert"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to identify a Simple Log Alert

Simple Log Alert Rules are built off the existing 1-minute frequency log alert rule architecture.

## Prerequisites

- Cluster: **azalertsprodweu.westeurope** / Database: **Insights** (or **LogSearchRule**)
- Either the operation_ParentId of a log alert evaluation OR the alert rule ARM ID

## Method 1: Azure Support Center (Quickest)

If the alert rule has had at least 1 successful evaluation and is enabled, but ASC shows **N/A** for Frequency and Threshold fields → most likely a **Simple Log Alert**. Verify with Kusto queries below.

## Method 2: Using operation_ParentId

```kql
lsa_requests
| where operation_ParentId == "72...a1"  // set operation id
| where name == "scheduledqueue-message-translator"
| project alertKind=tostring(customDimensions.AlertKind)
```

If result is **EventLogAlert** → this is a Simple alert.

## Method 3: Using Alert Rule ARM ID

```kql
let startTime = datetime(2025-04-21 08:00);
let endTime = datetime(2025-04-21 09:00);
let alertRuleId = "/subscriptions/<subId>/resourceGroups/<rgName>/providers/microsoft.insights/scheduledqueryrules/<alertRuleName>";
let _location = "";  // optional region filter
lsa_requests
| where timestamp between(startTime..endTime)
| where isempty(_location) or location =~ _location
| where name == "scheduledqueue-message-translator"
| where tostring(customDimensions.ArmResourceId) =~ alertRuleId
| distinct alertKind=tostring(customDimensions.AlertKind),
    ApiVersion = tostring(customDimensions.ApiVersion),
    IsStatefulRule = tostring(customDimensions.IsStatefulRule),
    ThresholdOperator = tostring(customDimensions.ThresholdOperator),
    ThresholdValue = tostring(customDimensions.ThresholdValue),
    MinRecurrenceCount = tostring(customDimensions.MinRecurrenceCount),
    FrequencyInMinutes = tostring(customDimensions.FrequencyInMinutes),
    PeriodInMinutes = tostring(customDimensions.PeriodInMinutes)
```

## Key Indicator

`alertKind == "EventLogAlert"` confirms the rule is a Simple Log Alert.
