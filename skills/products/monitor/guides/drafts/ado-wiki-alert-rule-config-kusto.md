---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/All Alerts/How to get alert rule configuration using Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAll%20Alerts%2FHow%20to%20get%20alert%20rule%20configuration%20using%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Alert Rule Configuration Using Kusto

## Scenario
Retrieve alert rule configuration when:
- Customer accidentally deleted an alert rule and wants to recreate with same config
- Azure Support Center is down

**Note**: Kusto table contains snapshots taken every few hours. Recent changes before deletion may not be captured.
**Note**: Search query, custom property values, and description will be redacted.

## Prerequisites
- Access to cluster `azalertsprodweu.westeurope`, database `Insights`
- For log/activity log/metric alerts: need alert rule ARM ID or subscription ID
- For Prometheus rule groups: need rule group ARM ID, or rule name + subscription ID

## Log Search Alert Rules and Activity Log Alert Rules

### By ARM Resource ID
```kql
let alertRuleId = "";
let myAlertRuleIdArray = split(alertRuleId, '/');
let mysubscription = tostring(myAlertRuleIdArray[2]);
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ mysubscription
| extend decodedRuleArmId = url_decode(RuleArmId)
| where decodedRuleArmId =~ alertRuleId and isnotempty(alertRuleId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| project TIMESTAMP, RuleType, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```

### All Log Search Alert Rules in Subscription
```kql
let subscriptionId = '';
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| where RuleType == 'Microsoft.Insights/scheduledQueryRules'
| extend decodedRuleArmId = url_decode(RuleArmId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| project TIMESTAMP, RuleType, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```

### All Activity Log Alert Rules in Subscription
```kql
let subscriptionId = '';
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| where RuleType == 'Microsoft.Insights/ActivityLogAlerts'
| extend decodedRuleArmId = url_decode(RuleArmId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| project TIMESTAMP, RuleType, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```

## Metric Alert Rules

### By ARM Resource ID
```kql
let alertRuleId = '';
let myAlertRuleIdArray = split(alertRuleId, '/');
let subscriptionId = tostring(myAlertRuleIdArray[2]);
cluster('azalertsprodweu.westeurope').database('Insights').
MetricAlertsTelemetry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| extend decodedRuleArmId = url_decode(RuleArmId)
| where decodedRuleArmId =~ alertRuleId and isnotempty(alertRuleId)
| extend decodedTargetResource = url_decode(TargetResourceId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| extend IsEnabled = iff(IsEnabled == 1, "True", "False")
| extend IsDeleted = iff(IsDeleted == 1, "True", "False")
| project TIMESTAMP, decodedRuleArmId, decodedTargetResource, TargetResourceProviderAndType, IsEnabled, IsDeleted, Region, JsonPayload
```

### All Metric Alert Rules in Subscription
```kql
let subscriptionId = '';
cluster('azalertsprodweu.westeurope').database('Insights').
MetricAlertsTelemetry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| extend decodedRuleArmId = url_decode(RuleArmId)
| extend decodedTargetResource = url_decode(TargetResourceId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| extend IsEnabled = iff(IsEnabled == 1, "True", "False")
| extend IsDeleted = iff(IsDeleted == 1, "True", "False")
| project TIMESTAMP, decodedRuleArmId, decodedTargetResource, TargetResourceProviderAndType, IsEnabled, IsDeleted, Region, JsonPayload
```

## Prometheus Rule Groups

### By ARM Resource ID
```kql
let prometheusRuleGroup = "";
let myAlertRuleIdArray = split(prometheusRuleGroup, '/');
let mysubscription = tostring(myAlertRuleIdArray[2]);
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ mysubscription
| extend decodedRuleArmId = url_decode(RuleArmId)
| where decodedRuleArmId =~ prometheusRuleGroup and isnotempty(prometheusRuleGroup)
| summarize arg_max(TIMESTAMP, *) by RuleName
| project TIMESTAMP, RuleName, RuleType, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```

### All Prometheus Rule Groups in Subscription
```kql
let subscriptionId = '';
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| where RuleType == 'Microsoft.AlertsManagement/prometheusRuleGroups'
| extend decodedRuleArmId = url_decode(RuleArmId)
| summarize arg_max(TIMESTAMP, *) by tolower(RuleArmId)
| project TIMESTAMP, RuleType, RuleName, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```

## Prometheus Recording Rules

### By Rule Name and Subscription
```kql
let prometheusRecordingRule = "";
let subscriptionId = "";
cluster('azalertsprodweu.westeurope').database('Insights').
AlertRuleTelemtry
| where TIMESTAMP > ago(48h)
| where SubscriptionId =~ subscriptionId
| where RuleType == "Microsoft.AlertsManagement/prometheusRuleGroups"
| where RuleName =~ prometheusRecordingRule
| extend decodedRuleArmId = url_decode(RuleArmId)
| summarize arg_max(TIMESTAMP, *) by RuleName
| project TIMESTAMP, RuleName, RuleType, decodedRuleArmId, IsEnabled, IsDeleted, RuleUpdateTimes, RuleCreationTime, Region, JsonPayload, ApiVersion
```
