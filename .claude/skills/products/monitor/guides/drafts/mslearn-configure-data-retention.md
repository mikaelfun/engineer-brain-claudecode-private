# Configure Data Retention for Log Analytics Workspace

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/configure-data-retention)

## Overview
How to configure data retention at workspace level and table level.

## Workspace-Level Retention
1. Navigate to Log Analytics workspace → Settings → Usage and estimated costs
2. Select **Data Retention** at top of page
3. Move slider to desired days (30-730)
4. Select OK

### Available retention values
30, 31, 60, 90, 120, 180, 270, 365, 550, 730 days

## Table-Level Retention
1. Navigate to Log Analytics workspace → Tables
2. Select target table → ellipsis (...) → **Manage table**
3. Configure retention and archive duration separately in **Data retention settings**

## Notes
- Free tier must upgrade to paid tier to change retention
- Table-level settings override workspace-level defaults
- Archive duration can extend data availability beyond interactive retention

## 21V Applicability
Applicable - Retention settings available in 21Vianet.
