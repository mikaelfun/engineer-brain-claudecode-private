---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/configure-data-retention"
importDate: "2026-04-23"
type: guide-draft
---

# Configure Data Retention for Log Analytics Workspace

## Overview

How to configure data retention for Log Analytics workspace at workspace level and table level.

## Workspace-Level Retention

1. Sign in to Azure portal
2. Navigate to Log Analytics workspace
3. Settings → Usage and estimated costs
4. Select Data Retention at top of page
5. Move slider to set retention days (30/31/60/90/120/180/270/365/550/730)
6. Select OK

**Note**: Free tier requires upgrade to paid tier to change retention period.

## Table-Level Retention

1. Navigate to Log Analytics workspace → Tables
2. Select the target table → ellipsis (...) → Manage table
3. Configure retention and archive duration in Data retention settings section

## Key Notes

- Default retention applies workspace-wide
- Table-level settings override workspace defaults
- Archive settings available for long-term storage at reduced cost
