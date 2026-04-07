# Set Daily Cap for Log Analytics Workspace

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/set-up-a-daily-cap)

## Overview
How to configure a daily cap to prevent unexpected data ingestion cost surges.

## Steps
1. Navigate to Log Analytics workspace → Settings → Usage and estimated costs
2. Select **Daily Cap** at top of page
3. Set to **ON** and configure GB/day limit
4. Also set up an alert rule to notify before cap is reached

## Warnings
- When daily cap is reached, billable data collection stops for the rest of the day
- Monitoring and alerting capabilities are lost until next day
- Some excess data beyond the cap is expected (not exact cutoff)
- Should be a safety net, not a regular cost control mechanism
- Consider creating alert rules at a lower threshold to proactively address surges

## 21V Applicability
Applicable - Daily cap feature available in 21Vianet.
