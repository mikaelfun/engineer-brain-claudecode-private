---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Advisor Recommendation Digest_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAdvisor%20Recommendation%20Digest_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Advisor Recommendation Digest Troubleshooting

## Support Boundaries

- **Advisor CSS:** Digest CRUD, logic/processing, Activity Logs, ICM escalation
- **Azure Monitor CSS:** Action Group behavior, CRUD, ICM to Monitor PG

## What is Recommendation Digest

Periodic notification summary of active recommendations across categories. Configured per subscription (no bulk creation).

**Limitation:** Can only create Digests per individual subscription. No bulk creation.

## Troubleshooting Checklist

1. **Active recommendations exist** - Verify at least one active recommendation in the tenant (up to 24h refresh)
2. **Digest configuration correct** - Verify configured date has passed (30d monthly, 7d weekly)
3. **Trigger enabled** - Check if digest trigger status is enabled
4. **Action Group configured** - Verify action group and trigger are correctly linked
5. **Action Group working** - Test action group independently via Portal
6. **Activity Logs** - Check Advisor Alerts or Activity Logs for errors
7. **Permissions** - Verify required roles: Subscription Owner/Contributor, RG Owner/Contributor, Resource Owner/Contributor
8. **ARM-side issues** - Use Kusto queries to check ARM logs

## ARM Kusto Diagnostics

**Cluster:** https://armprodgbl.eastus.kusto.windows.net (ARMProd database)

**HTTPIncomingRequests:**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')
| macro-expand isfuzzy=true ARMProdEG as X (
    let start = datetime(<START_DATE>);
    let end = datetime(<END_DATE>);
    let subid = "<SUBSCRIPTION_ID>";
    X.database('Requests').HttpIncomingRequests
    | where PreciseTimeStamp >= start and PreciseTimeStamp <= end
    | where subscriptionId == subid
    | where operationName !contains("GET")
    | where targetResourceProvider contains "advisor"
)
```

**ARMProd.Traces:**
```kql
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')
| macro-expand isfuzzy=true ARMProdEG as X (
    let start = datetime(<START_DATE>);
    let end = datetime(<END_DATE>);
    let subid = "<SUBSCRIPTION_ID>";
    let correlationid = "<CORRELATION_ID>";
    X.database('Traces').Traces
    | where subscriptionId == subid
    | where TIMESTAMP >= start and TIMESTAMP <= end
    | where correlationId contains correlationid
    | project TIMESTAMP, operationName, message, exception, additionalProperties
    | order by TIMESTAMP asc
    | limit 1000
)
```

## Known Issue: Digest Count Mismatch

Digest recommendation count uses `targetResourceCount` property from internal Kusto, which differs from Portal grouping logic. Verify via ARG:

```kql
advisorresources
| where type == "microsoft.advisor/recommendations"
| where (properties.category == 'Security' and properties.lastUpdated > ago(60h)) or properties.lastUpdated >= ago(1d)
| project id, subscriptionId, category=tostring(properties.category), count = iff((isnotempty(properties.extendedProperties) and isnotempty(properties.extendedProperties.targetResourceCount)), toint(properties.extendedProperties.targetResourceCount),1)
| summarize sum(['count']) by category
```

ADO Feature 24874339 in PG backlog (no ETA).

## Internal Kusto (NOT shareable)

```kql
cluster("Azeeclu").database("AzEE-DB").isRecommendationExist(ago(1d), now(), "<SUB_ID>")
| extend category=tostring(recommendation.Category)
| where category== 3
| extend targetResourceCount= recommendation.Recommendation.Properties.AllExtendedProperties.targetResourceCount
| distinct recommendationFriendlyName, resourceId, tostring(recommendation.StableId), tostring(targetResourceCount)
| extend count = iff((isnotempty(targetResourceCount)), toint(targetResourceCount),1)
| summarize sum(['count'])
```

## Escalation

Submit AVA request to [Azure Advisor SME Channel](https://teams.microsoft.com/l/channel/19%3ae676dc5eeb0f4bdb83999d5ec0317f00%40thread.tacv2/MGMT%2520-%2520Advisor%2520and%2520Advisor%2520Score%2520(AVA))
