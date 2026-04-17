---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting Metric alert didn't resolve when it should (Missed Alert)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FTroubleshooting%20Guides%2FTroubleshooting%20Metric%20alert%20didn't%20resolve%20when%20it%20should%20(Missed%20Alert)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

This troubleshooting guide applies to Metric alert that did not resolve when it should have.

# Information you will need

- Resource id of the Alert rule (from ASC)
- Timestamp in UTC when alert was expected to resolve (from customer)

Note: If the rule Criteria is "PromQLCriteria", use the Query Metric alert didn't resolve TSG instead.

# Troubleshooting

## Step 1: Verify alert rule configuration

In ASC, navigate to alert rule under microsoft.insights/metriclalerts. Note scope, condition, aggregation type and dimensions.

Check payload and monitor configuration using "How to get metric alert rule extended properties from ASC".

## Step 2: Review metric chart

Follow "How to chart metric data in ASC" using **target resource scope** (not the alert rule). For rules with dimensions, also chart MDM metrics data by dimensions in Jarvis.

## Step 3: Verify 3 consecutive healthy evaluations completed

Navigate to **Execution History** tab. Extend timeframe to account for at least 3 evaluations.

**Note**: ASC displays only first 3 timeseries per evaluation. Use logs link for more.

### Using Jarvis evaluation logs

Check for records starting with "[CUSTOMMETRIC_..." - if present, the following instructions won't work.

For non-custom metric alerts:
- CombinationEvaluation → metric values didn't meet threshold (healthy)
- ThresholdViolated → threshold was met (unhealthy)

### Verify 3 consecutive healthy evaluations

In Jarvis Client query, comment out "where TraceGroup" line and add:
```
| where Method contains "EvaluateCombination" and Message startswith "Monitor"
```

**Are there 3 consecutive healthy evaluations?**

- **No** → Refer customer to public docs on view and resolution of fired alerts. Alert requires 3 consecutive healthy evaluations to auto-resolve.
- **Yes** → This indicates an issue with monitor health or evaluation. Escalate per Getting Help section.
