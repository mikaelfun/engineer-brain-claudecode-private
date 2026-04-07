---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Increase ingestion rate limit(IRL)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management%2FHow-to%3A%20Increase%20ingestion%20rate%20limit(IRL)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Increase Ingestion Rate Limit (IRL)

## What is Ingestion Volume Rate Limit?
See: [Ingestion Volume Rate Limit TSG](/Log-Analytics/Troubleshooting-Guides/Workspace-management/Ingestion-Volume-Rate-Limit)

Ref: https://learn.microsoft.com/azure/azure-monitor/service-limits#data-ingestion-volume-rate

## Step-by-step Instructions

### 1. Validate the IRL symptoms

Check if IRL breaching is one-off or consistent:

```kql
// Error: IRL breached
_LogOperation  
| where TimeGenerated >= ago(30d)  
| where Level == "Error"  
| where * has "The data ingestion volume rate crossed the threshold in your workspace"
| summarize count() by bin(TimeGenerated, 1d)
| sort by TimeGenerated desc
```

```kql
// Warning: 80% threshold reached
Operation  
| where TimeGenerated > ago(30d)  
| where OperationStatus == "Warning" and Details contains "The data ingestion volume rate crossed 80% of the threshold"  
| summarize count() by bin(TimeGenerated, 1d)
| sort by TimeGenerated desc
```

> Note: `_LogOperation` may not include all activities. For full visibility, use the `Operation` table. See: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/monitor-workspace

### 2. Retrieve workspace environment

```kql
// Run on omsgenevaodsprod.eastus.kustomfa.windows.net/OperationInsights_ODS_PROD
union cluster("https://omsgenevaodsprod.eastus.kustomfa.windows.net").database("OperationInsights_ODS_PROD").ActivityCompletedEvent
| where TIMESTAMP > ago(10m)
| where properties has '<workspace-id>'
| distinct Environment
```

### 3. Determine rate-limiting impact on ingestion

```kql
// Run on ActivityCompletedEvent - keep timeframe tight (10-min window when IRL was breached)
ActivityCompletedEvent
| where TIMESTAMP between(datetime(start) .. datetime(end))
| where Environment == "<environment>"
| where properties has '<workspace-id>'
| where activityName == "RateLimitingWorkspaceIngestionAboveThreshold"
| parse properties with * "AccumulatedTotal=[" AccumulatedTotal:long "]" * "AccumulatedTotalMode=[" AccumulatedTotalMode "]" * "BucketTime=[" BT:datetime "]" * "CustomerId=[" CustomerId "]" * "EffectiveLimit=[" EffectiveLimit:long "]" * "LimitBucket=[" LimitBucket "]" *
| project TIMESTAMP, CustomerId, Environment, AccumulatedTotal, AccumulatedTotalMode, EffectiveLimit, LimitBucket, activityId, RoleInstance, Tenant, properties
| where AccumulatedTotalMode == "All" and LimitBucket == "Percent100"
| summarize EffectiveLimit = max(EffectiveLimit), AccumulatedTotal= max(AccumulatedTotal), InstanceCount = count() by CustomerId, Environment, TIMESTAMP = bin(TIMESTAMP, 1m)
| extend EffectiveLimit=format_bytes(EffectiveLimit,2), AccumulatedTotal=format_bytes(AccumulatedTotal,2)
| summarize arg_max(TIMESTAMP,*) by CustomerId, EffectiveLimit
```

- **EffectiveLimit**: Current IRL for the workspace
- **AccumulatedTotal**: Ingestion in MB during time window (amount beyond limit is dropped)

### 4. Decision on IRL increase

Provide sufficient headroom for normal spikes. Example: if limit=1000MB and spikes reach 1300-1400MB, increase to 1500MB. Consult SME/TA/EEE if unsure.

### 5. Raise an IcM

> Do not add multiple workspaces to a single IcM unless all reside in the same region.

Use ASC IcM Template: **"Azure Log Analytics | Core PG"**

| Request Type | Feature Area | Notes |
|---|---|---|
| Standard (up to 30%) | "Ingestion Rate Limit" | Auto-approved (default limit is 500) |
| Above 30% | Use title "[Ingestion Rate Limit above 30%]" | Requires PSS Backend approval. Raise to **Log Analytics\EEE** |

**IRL increase rules:**
- Up to 30%: automatically approved
- Up to 1000 in large regions (West/North Europe, West/East/Central US/US2): EEEs can perform directly
- Above 30% or above 1000 or in small regions: requires PSS Backend team approval

### Permissions (SAW device)
Requires AME domain account in groups: `AME\TM-AILXBEFT` and `AME\TM-LAControlPlaneCore`

**Contacts:**
- Tzachi Elkabatz (EEE, EMEA): tzachie@microsoft.com
- Nicolas Zamora (EEE, NA): nzamoralopez@microsoft.com
- Todd Foust (EEE, NA): toddfous@microsoft.com
- Einat Urbach (SME, EMEA): einat.urbach@microsoft.com
- Jorge Baracat (SME, EMEA): jorge.baracat@microsoft.com
