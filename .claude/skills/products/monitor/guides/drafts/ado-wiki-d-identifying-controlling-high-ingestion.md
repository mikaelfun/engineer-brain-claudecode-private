---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Billing/Identifying and controlling high ingestion in Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FBilling%2FIdentifying%20and%20controlling%20high%20ingestion%20in%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Identifying and Controlling High Ingestion in Application Insights

## Overview

A frequent issue encountered in Application Insights support cases involves customers observing an increase in billing charges related to Application Insights and/or Log Analytics. This increase may be evident in their monthly invoice or within the Usage and Estimated Costs blade.

Common questions:
1. Why are my billing charges so high?
2. Why is there a significant increase in data ingestion?
3. What has caused the rise in ingestion charges?
4. How can we prevent or mitigate high charges in the future?

## Considerations

Azure Monitor billing charges are influenced by several factors:

- **Data Retention**: Application Insights tables include 90 days of data retention by default at no charge. Extending beyond 90 days incurs additional charges.
- **Data Ingestion**: Billing depends on the table plan and the region of the Log Analytics workspace. Pay-as-you-go plans are based on GB consumed.
- **Pricing Tiers**: Workspace-based resources can opt for Commitment Tiers instead of Pay-as-you-go.

> The Azure Monitor team does not have authority to process or commit to providing refunds.

## Troubleshooting Guide (TSG)

### Step 1: Identify resources presenting high ingestion

- Navigate to Subscription > Cost Analysis blade to chart costs per resource
- Identify Application Insights resources or Log Analytics workspaces contributing to the issue
- Determine context: sudden unexpected increase vs. recently discovered ongoing issue

### Step 2: Identify the origin of high ingestion

#### 2.1 Identify costly tables

**By raw record count:**
```kql
search *
| where timestamp > ago(7d)
| summarize count() by $table
| sort by count_ desc
```

**By consumed bytes:**
```kql
systemEvents
| where timestamp > ago(7d)
| where type == "Billing"
| extend BillingTelemetryType = tostring(dimensions["BillingTelemetryType"])
| extend BillingTelemetrySizeInBytes = todouble(measurements["BillingTelemetrySize"])
| summarize TotalBillingTelemetrySize = sum(BillingTelemetrySizeInBytes) by BillingTelemetryType
| extend BillingTelemetrySizeGB = format_bytes(TotalBillingTelemetrySize, 1, "GB")
| sort by BillingTelemetrySizeInBytes desc
| project-away BillingTelemetrySizeInBytes
```

**Using Log Analytics Usage workbook**: Navigate to Log Analytics workspace > Workbooks > Usage (under Log Analytics Workspace Insights).

#### 2.2 In-depth analysis on costly tables

**Identify driving factors:**
```kql
requests
| where timestamp > ago(7d)
| summarize count() by cloud_RoleInstance
| sort by count_ desc
```

```kql
traces
| where timestamp > ago(7d)
| summarize count() by message
| sort by count_ desc
```

```kql
exceptions
| where timestamp > ago(7d)
| summarize count() by message
| sort by count_ desc
```

**Investigate evolution over time:**
```kql
dependencies
| where timestamp > ago(30d)
| summarize count() by bin(timestamp, 1d), operation_Name
| sort by timestamp desc
```

### Step 3: Reduce costs

1. **Update daily cap configuration** — protective measure against undesired excess telemetry
2. **Switch table plans** — consider Basic table plan for supported tables
3. **Use telemetry SDK features**:
   - **Java Agent**: sampling overrides, reduce log level, disable instrumentation, increase metrics interval
   - **.NET**: (SDK-specific sampling and filtering)
4. **Update application code** — fix noisy exceptions at source rather than suppressing observability

### Examples

**Example 1**: High ingestion from AppTraces — one specific app driving costs via two main logger categories.

**Example 2**: High ingestion from Azure Functions — one function app generating excessive Trace telemetry with specific noisy messages.

**Example 3**: Customer hit daily cap unexpectedly — reCAPTCHA events started ingesting and became noisy very quickly.

## Public Documentation

- [Azure Monitor Pricing](https://azure.microsoft.com/pricing/details/monitor/)
- [Table plans in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/logs/data-platform-logs#table-plans)
- [Log Analytics pricing tiers](https://learn.microsoft.com/azure/azure-monitor/logs/change-pricing-tier?tabs=azure-portal)
- [Azure Monitor cost and usage](https://learn.microsoft.com/azure/azure-monitor/cost-usage)
- [Analyze usage in a Log Analytics workspace](https://learn.microsoft.com/azure/azure-monitor/logs/analyze-usage#data-volume-by-solution)
