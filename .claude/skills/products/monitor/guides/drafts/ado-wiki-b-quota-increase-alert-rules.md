---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Troubleshooting Guides/Troubleshooting quota increase requests for alert rules"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Troubleshooting%20Guides/Troubleshooting%20quota%20increase%20requests%20for%20alert%20rules"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Quota Increase Requests for Alert Rules

## Scenario

Customer requesting quota increase for alert rules in their Azure subscription.

> **Important**: All severity 2 ICMs MUST be routed through SRE team. Do not increase severity of a sev 3 ICM to sev 2 without going through the correct SRE process.

## Information Needed

- Type of alert rules for which quota increase is requested
- New quota value the customer wants

## Step 1: Confirm Quota Increase Is Available

Check "Azure Monitor service limits" documentation. If the "Maximum limit" column states "Same as default", there is no ability to increase the quota.

## Step 2: Can Customer Work Within Current Limits?

Guide customer to use dimensions and alert processing rules to reduce alert rule count:

- **Multiple similar rules scoped to different resources**: Use dimensions to monitor many resources with a single alert rule. Example: Instead of many "low disk space" rules each for one VM, scope to a common Log Analytics workspace and use Resource Id column for dimension configuration.

- **Different actions per resource**: Use dimensions + alert processing rules to apply different action groups based on dimension values (filter: alert context contains / Resource contains).

- **Unused log alert rules**: Customer can disable unused rules to free up quota.

## Step 3: Review Requested Quota Value

Ensure the request is realistic. Reasonable limits without business justification:

### Metric Alerts

| Limit Description | Reasonable Limit |
|---|---|
| Active rules per subscription | 10,000 |
| Metric time-series per alert rule | 15,000 |

### Log Alerts (Log Search Alerts)

| Limit Description | Reasonable Limit | Notes |
|---|---|---|
| Active rules per subscription | 5,000 | CRIs need business justification |
| Active rules with 1-min evaluation | 150 | Guide customer to reduce count or use 5-min frequency |
| Active rules per resource | 1,600 | Guide to use dimensions |
| Time series per resource | 6,000 | Currently a hard limit; PG wants CRIs with justification |

If customer requests unrealistic values ("unlimited", "a million"), work with them to understand actual needs and set expectations that limits exist to protect service performance.

## Step 4: Submit CRI for Quota Increase

Follow "Product Group Escalation" process to submit the request using the appropriate CRI template in ASC.

- **Subscription limit**: Include subscription information
- **Resource limit**: Include list of all resource IDs needing the limit increase
