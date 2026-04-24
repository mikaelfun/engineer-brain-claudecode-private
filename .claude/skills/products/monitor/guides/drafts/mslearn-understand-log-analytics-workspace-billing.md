---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/understand-log-analytics-workspace-bill"
importDate: "2026-04-23"
type: guide-draft
---

# Understanding Log Analytics Workspace Billing

## Overview

Comprehensive guide to understanding and analyzing costs associated with Log Analytics workspaces using Azure Preview portal Cost analysis.

## Step-by-Step Cost Analysis

### 1. Access Cost Analysis
- Sign in to Azure Preview portal
- Navigate to Log Analytics workspace
- Select View Cost on Overview page

### 2. Resources View
- View AccumulatedCosts → Resources tab
- See total cost per resource
- Expand workspace to see per-service breakdown
- Important: High workspace cost often driven by data-injecting services, not the workspace itself

### 3. Services View
- View costs grouped by service
- Expand each service to see charge types
- Identify which linked services contribute most cost

### 4. Daily Costs View
- View daily cost breakdown
- Identify anomalous spikes on specific dates
- Service name pie chart shows alternative cost distribution view

### 5. Invoice Details
- Match costs to billing cycle
- Sort by cost descending to identify highest-cost services

## Key Insight

Log Analytics workspace cost is often dominated by data from other services (Sentinel, Grafana, Kubernetes, etc.), not the workspace ingestion itself.
