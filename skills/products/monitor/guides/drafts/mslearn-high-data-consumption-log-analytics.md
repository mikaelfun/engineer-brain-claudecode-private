# Understand and Mitigate High Data Consumption in Log Analytics

**Source**: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/configure-and-manage-log-analytics-tables/understand-and-mitigate-high-data-consumption-log-analytics)
**Date**: 2026-04-05

## Overview

High data consumption in Log Analytics workspaces, particularly in the `AzureDiagnostics` table, can lead to unexpected costs. This guide covers identification, optimization, and cost reduction steps.

## Diagnostic Steps

### 1. Identify High Data Tables

Run the following query in the Log Analytics workspace to identify resources sending large amounts of data:

```kql
AzureDiagnostics | distinct _ResourceId
```

Use the Usage table for broader analysis:
```kql
Usage
| where TimeGenerated > ago(30d)
| summarize TotalGB = sum(Quantity) / 1000 by DataType
| sort by TotalGB desc
```

### 2. Review Diagnostic Settings

- Navigate to the diagnostic settings of the identified resource
- Remove unnecessary diagnostic settings if the data isn't required
- This stops data from being sent to the AzureDiagnostics table

### 3. Configure Data Retention

- Ensure data retention settings are appropriate to avoid unnecessary storage costs
- Consider shorter retention for high-volume, low-value tables

### 4. Implement Data Filtering

- Collect only necessary data to reduce ingestion volume
- Use transformation rules in DCR to filter before ingestion

## Key Considerations

- **Data retention** settings directly affect storage costs
- **Data filtering** at collection time is more cost-effective than filtering at query time
- Review Azure Monitor pricing documentation for current cost structures

## References

- [Azure Monitor pricing](https://azure.microsoft.com/pricing/details/monitor/)
- [Best Practices for Cost Management](https://learn.microsoft.com/en-us/azure/azure-monitor/fundamentals/best-practices-cost)
- [Cost Management for Logs](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs)

## 21V Applicability

Applicable to 21Vianet (Mooncake) environments with similar Log Analytics workspace configurations.
