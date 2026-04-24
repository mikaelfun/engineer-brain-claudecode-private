---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/set-up-a-daily-cap"
importDate: "2026-04-23"
type: guide-draft
---

# Set Up Daily Cap for Log Analytics Workspace

## Overview

Daily cap prevents unexpected data ingestion cost surges by stopping billable data collection when threshold is reached.

## Important Warnings

- When data collection stops, monitoring and alerting for dependent resources is lost
- Daily cap should be a preventative measure, NOT a regular cost reduction method
- Data collection beyond the cap can still occur (especially at high ingestion rates) and will be billed
- Create alert rules to notify before cap is reached

## Configuration Steps

1. Sign in to Azure portal
2. Navigate to Log Analytics workspace
3. Settings → Usage and estimated costs
4. Select Daily Cap at top of page
5. Set to ON
6. Set data volume limit (GB/day)
7. Save

## Best Practices

- Create alert rules for proactive notification before cap is reached
- Use daily cap as safety net, not as primary cost control
- Consider data filtering and diagnostic settings optimization first
