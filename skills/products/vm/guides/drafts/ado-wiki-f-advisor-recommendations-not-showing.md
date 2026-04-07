---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Advisor Recommendations are not showing_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAdvisor%20Recommendations%20are%20not%20showing_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Advisor Recommendations Are Not Showing - Troubleshooting Guide

## Step 1: Check if Recommendation Exists in Kusto

**Entitlement:** [Azure Advisor Telemetry](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azureadvisor-ir0t)

```kql
cluster('azeeclu.centralus.kusto.windows.net').database('AzEE-DB').Recommendations
| where env_time > ago(1d)
| where RecommendationType == "<Recommendation friendly name>"
| where SubscriptionId == "<Sub ID>"
```

Use [PowerBI Recommendations Catalog](https://msit.powerbi.com/groups/me/reports/9d768e5a-a6bd-4c74-a10f-9b447f14ec79/ReportSection53992398a6571612f44e) to find friendly names.

## Step 2: Check if Recommendations are in ARG

Run in ASC ARG Query Editor:
```kql
advisorresources
| where type == "microsoft.advisor/recommendations"
```

For specific recommendation:
```kql
advisorresources
| where type == "microsoft.advisor/recommendations"
| where properties.recommendationTypeId == "<recommendationTypeId>"
```

## Step 3: Check if Visible in Portal via ARG

Run the full Portal display query (with suppressions, configurations, RI filters) to see what Portal actually shows. This is a complex query that checks:
- Suppressions (dismissed/postponed)
- Subscription-level exclude configurations
- Resource group-level exclude configurations
- Low CPU threshold settings
- RI term and lookback period filters

## Step 4: Check Configurations and Permissions

If Step 3 returns no data but Step 2 does:

1. **Check permissions:** [Advisor permission table](https://learn.microsoft.com/en-us/azure/advisor/permissions#roles-and-their-access)

2. **Check exclude configuration:**
```kql
advisorresources
| where type =~ 'microsoft.advisor/configurations'
```

If `"exclude": true` in properties, customer has excluded recommendations for that subscription. Fix: Advisor > Configurations blade > uncheck the subscription.

## Step 5: Diagnose Active Flags

Run the full diagnostic query and check:
- **isActive1** not true → Subscription-level exclude configuration
- **isActive2** not true → VM/VMSS right-sizing CPU utilization threshold too low
- **isActive3** not true → Resource group-level exclude configuration
- **isRecommendationActive** not true → Recommendation is postponed or dismissed (customer can change filter to view dismissed/postponed)

## Escalation

Engage Advisor SME channel for further help.
