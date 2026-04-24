---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/workspace-recommended-alerts"
importDate: "2026-04-23"
type: guide-draft
---

# Set Up Recommended Alerts for Log Analytics Daily Cap and Ingestion

## Overview

Configure proactive alerts for daily cap reached events and ingestion anomalies in Log Analytics workspace.

## Configuration Steps

1. Sign in to Azure portal
2. Navigate to Log Analytics workspace
3. Monitoring → Alerts
4. Select "Set up recommendations"
5. Turn on desired alert rules (recommend enabling all)
6. In Notify me section, specify email address
7. Select Save

## Key Notes

- When daily cap is reached, a banner appears in Azure portal
- An event is logged in the Operations table
- Recommended alerts provide proactive notification before issues impact monitoring
- All alert rules should be enabled for comprehensive coverage
