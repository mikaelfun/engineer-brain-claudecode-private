# Understanding Log Analytics Workspace Billing

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/understand-log-analytics-workspace-bill)

## Overview
Guide to understanding and analyzing costs associated with a Log Analytics workspace.

## Steps
1. Sign in to Azure Preview portal (preview.portal.azure.com)
2. Navigate to Log Analytics workspace → Overview → View Cost
3. Use Cost Analysis with multiple tabs:
   - **Resources tab**: Shows total cost including data from other services; expand workspace to see per-service breakdown
   - **Services tab**: Expand each service to view charge types
   - **Daily costs tab**: Identify cost trends and spikes via bar chart
   - **Invoice details tab**: Sort by cost descending to find highest-cost services

## Key Insight
The workspace itself may appear expensive, but expanding individual line items often reveals that data-injecting services (Sentinel, Defender, etc.) are the primary cost drivers, not the Log Analytics service itself.

## 21V Applicability
Applicable - Azure Preview portal available in 21Vianet.
