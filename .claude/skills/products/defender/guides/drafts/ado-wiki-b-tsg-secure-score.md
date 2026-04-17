---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Secure Score/[TSG] - Secure Score"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FSecure%20Score%2F%5BTSG%5D%20-%20Secure%20Score"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] Secure Score

[[_TOC_]]

## ADX Dashboard

[Secure Score - Investigation](https://dataexplorer.azure.com/dashboards/3c1f9409-da67-4121-9e2a-e9bbd718d830?p-_startTime=2days&p-_endTime=now&p-_subIds=v-2cfeb409-5f32-4833-b0b7-f8588ccaaf86&p-_controlKey=all&p-_cloud=all&p-_connectorId=all#671c3520-3c47-4a10-af8b-d588575009b4) — Owner: Aviram Yitzhak

---

## No Secure Score / Secure Score is N/A / Secure Score is 0

### Pre-requisite

Read the official documentation: https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls#how-your-secure-score-is-calculated

### AME Tenant

Secure Score isn't calculated on subscriptions under MS AME tenant (33e01921-4d64-4f8c-a055-5bdaffd5e33d).
If you want to add the subscription to an allow list, ask the Secure Score team to add it.

### No Secure Score Recommendations

Recommendations that don't affect Secure Score (see Secure score exemptions) won't cause a subscription to have a Secure Score — the score will appear as "N/A".

**Only Controls with 0 max score:** There are Secure Score controls with max score == 0. If a subscription has only assessments related to controls with max score 0, it won't have a Secure Score. Check with:

```kusto
let subscriptionId = "<subscriptionId>";
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').SecureScoreV3ControlsScore
| where Timestamp > ago(3d)
| where SubscriptionId == subscriptionId
| where HealthyResources > 0 or UnhealthyResources > 0
| join kind=leftouter 
(
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').SecureScoreV3ControlsMetadata
) on ControlKey
| distinct ControlKey, MaxScore
```

### No Secure Score due to Inactivity

If there is no activity in MDC for a period of ~30 days, processing and publishing of recommendations stops (by design). Ref: ICM 336791730.

Check the active/inactive history:

```kusto
let _subscriptionId = '{subscriptionId}';
cluster("https://romelogs.kusto.windows.net").database('Prod').SubscriptionActivityQueryOE
| where env_time > ago(30d)
| where operationName == "GetSubscriptionActivityStatusAsync"
| project env_time, SubscriptionId, ActivityStatus
| where SubscriptionId == _subscriptionId
| summarize count() by ActivityStatus, bin(env_time,1d)
| render timechart
```

### The Score is 0 — How to investigate

```kusto
let _subIds = "{subscriptionId}";
let _controlKey = '';
let _cloud = dynamic(['GCP']);
cluster('romecore').database('Prod').ServiceFabricDynamicOE
| where env_time > ago(1d)
| project env_time, operationName, resultType, customData
| where operationName == "CoreV2.TraceSecureScoreControlsData"
| extend customData = todynamic(customData)
| extend SubscriptionId = tostring(customData.SubscriptionId)
| where _subIds contains SubscriptionId
| extend ControlKey = tostring(customData.ControlKey)
| where isempty(_controlKey) or _controlKey contains ControlKey
| extend CurrentScore = todecimal(customData.CurrentScore)
| extend Weight = todecimal(customData.Weight)
| extend Percentage = todecimal(customData.Percentage)
| extend UnhealthyResources = todecimal(customData.UnhealthyResources)
| extend HealthyResources = todecimal(customData.HealthyResources)
| extend NotAvailableResources = todecimal(customData.NotAvailableResources)
| extend NotApplicableByPolicyResources = todecimal(customData.NotApplicableByPolicyResources)
| extend CalculationId = tostring(customData.CalculationId)
| extend Source = tostring(customData.Source)
| where isempty(['_cloud']) or Source in (['_cloud'])
```

### Control shows 0 score despite healthy resources

**By design.** Secure Score counts **resources**, not assessments. If a resource is unhealthy in at least one recommendation within the control, it does not positively contribute to the control score — even if it appears healthy in another recommendation in the same control.

---

## Secure Score shows as "not scored"

This means the entire Secure Score Control is not affecting Secure Score. This happens when:
- All assessments under the control are exempted
- There are no assessments under this control
- All recommendations are within the Grace Period of the governance assignment

---

## Score changed from X to Y — Why?

Use the Secure Score workbook to track changes. To see which recommendations changed on a given date:

```kusto
let _controlKey = '';
let _startTime = datetime(2025-01-01);
let _endTime = datetime(2025-07-01);
let _subId = "{subscriptionId}";
cluster('rometelemetrydata').database('RomeTelemetryProd').SecureScoreV3Assessments
| where Timestamp between (_startTime .. _endTime)
| where SubscriptionId == _subId
| where AssessmentKey in (
    cluster('rometelemetrydata').database('RomeTelemetryProd').SecureScoreV3ControlsMetadata
    | where _controlKey has ControlKey or isempty(_controlKey)
    | mv-expand Assessments
    | project AssessmentKey=tostring(Assessments))
| order by Timestamp asc
| project Timestamp, CalculationId, AssessmentKey, AssessmentDisplayName, HealthyResources, UnhealthyResources, NotApplicableResources, NotApplicableByPolicyResources
| order by Timestamp, AssessmentKey
| summarize take_any(*) by bin(Timestamp, 1d), AssessmentKey
| order by Timestamp asc
| summarize make_set(HealthyResources), HealthyResourcesDetails = bag_pack("HealthyResources", make_list(HealthyResources), "Date", make_list(Timestamp)), make_set(UnhealthyResources), UnHealthyResourcesDetails = bag_pack("UnhealthyResources", make_list(UnhealthyResources), "Date", make_list(Timestamp)), make_set(NotApplicableResources), NotApplicableResourcesDetails = bag_pack("NotApplicableResources", make_list(NotApplicableResources), "Date", make_list(Timestamp)), make_set(NotApplicableByPolicyResources), NotApplicableByPolicyResourcesDetails = bag_pack("NotApplicableByPolicyResources", make_list(NotApplicableByPolicyResources), "Date", make_list(Timestamp)) by AssessmentKey, AssessmentDisplayName
| where array_length(set_HealthyResources) > 1 or array_length(set_UnhealthyResources) > 1 or array_length(set_NotApplicableResources) > 1 or array_length(set_NotApplicableByPolicyResources) > 1
| project-away set_HealthyResources, set_NotApplicableByPolicyResources, set_NotApplicableResources, set_UnhealthyResources
```

---

## Retrieve Current Secure Score by Subscription

```kusto
let _subIds = '{SubId}';
let _controlKey = '';
let _cloud = dynamic(['Azure']);
cluster('romecore').database('Prod').ServiceFabricDynamicOE
| where env_time > ago(1d)
| where operationName == "CoreV2.TraceSecureScoreControlsData"
| project env_time, operationName, resultType, customData
| extend customData = todynamic(customData)
| extend 
    SubscriptionId = tostring(customData.SubscriptionId),
    ControlKey = tostring(customData.ControlKey),
    CurrentScore = todecimal(customData.CurrentScore),
    Weight = todecimal(customData.Weight),
    Percentage = todecimal(customData.Percentage),
    UnhealthyResources = todecimal(customData.UnhealthyResources),
    HealthyResources = todecimal(customData.HealthyResources),
    NotAvailableResources = todecimal(customData.NotAvailableResources),
    NotApplicableByPolicyResources = todecimal(customData.NotApplicableByPolicyResources),
    CalculationId = tostring(customData.CalculationId),
    Maximo = todecimal(customData.MaxScore),
    Source = tostring(customData.Source)
| where _subIds contains SubscriptionId
| where isempty(_controlKey) or _controlKey contains ControlKey
| where isempty(_cloud) or Source in (_cloud)
| summarize 
    TotalScore = sum(CurrentScore), 
    MaximoTotal = sum(Maximo) 
    by CalculationId
| extend SecureScore = (TotalScore / MaximoTotal) * 100
| project _subIds, SecureScore
```

## Secure Score Fluctuation by Subscription

```kusto
// DISCLAIMER: Do NOT set date range > 30 days (timeout risk)
let _subId = '{SubId}';
let startDate = datetime(2026-02-06);
let endDate = datetime(2026-03-06);
let _controlKey = '';
let _cloud = dynamic(['Azure']);
cluster('romecore').database('Prod').ServiceFabricDynamicOE
| where env_time between (startDate .. endDate)
| where operationName == "CoreV2.TraceSecureScoreControlsData"
| project env_time, customData 
| extend customData = todynamic(customData)
| extend
    SubscriptionId = tostring(customData.SubscriptionId),
    ControlKey = tostring(customData.ControlKey),
    CurrentScore = todecimal(customData.CurrentScore),
    Maximo = todecimal(customData.MaxScore),
    Source = tostring(customData.Source)
| project-away customData 
| where isempty(_subId) or _subId contains SubscriptionId 
| where isempty(_controlKey) or _controlKey contains ControlKey
| where isempty(_cloud) or Source in (_cloud)
| extend ScoreDate = bin(env_time, 1d)
| summarize AverageSecureScore = avg((CurrentScore / Maximo) * 100) by ScoreDate, SubscriptionId
| sort by ScoreDate asc
```

---

## Secure Score Workbook shows partial / no data

1. Ensure continuous export is configured for secure score (Portal: Defender for Cloud > Environment Settings > Subscription > Continuous Export)
2. Note the Log Analytics Workspace parameters used in continuous export
3. Check data in the workspace: run `SecureScore` and `SecureScoreControls` queries
4. **If no data in LAW** → issue is with continuous export, not secure score — reroute ticket accordingly
5. **If data in LAW but workbook wrong** → secure score team issue (provide exact row examples from LAW vs workbook)

---

## Secure Score Calculation

To get all possible points for a security control, ALL resources must comply with ALL recommendations within the control.

### Formulas

| Metric | Formula |
|--------|---------|
| Security control's current score | `sum(healthy resources) / sum(total resources) * max score` |
| Secure score (single subscription) | `sum(current scores) / sum(max scores) * 100` |
| Secure score (multiple subscriptions) | Combined posture — not an average; resources across all subscriptions evaluated together |

### Secure Score Exemptions (do NOT affect score)

1. **Custom Initiative recommendations** — only built-in recommendations affect score
2. **Preview Recommendations** — excluded until preview period ends
3. **Disabled recommendations** — disabled via Default Security Policy don't affect score
4. **Exempted resources** — resource exempted from a recommendation → not counted as unhealthy

---

## Secure Score API

```
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/secureScores/{secureScoreName}?api-version=2020-01-01-preview
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/secureScores?api-version=2020-01-01-preview
```

## Secure Score using ARG

```kusto
SecurityResources 
| where type == 'microsoft.security/securescores/securescorecontrols'
| extend healthyResourceCount = properties.healthyResourceCount
| extend unhealthyResourceCount = properties.unhealthyResourceCount
| extend notApplicableResourceCount = properties.notApplicableResourceCount
| extend displayName = properties.displayName
| project displayName, name, healthyResourceCount, unhealthyResourceCount, notApplicableResourceCount, properties
```

**Keywords:** Secure, Score, API, Calculation, Formula, Model, ARG
