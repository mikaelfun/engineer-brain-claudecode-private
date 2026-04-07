---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Reset Capacity Reservation now called Commitment Tiers"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Reset Capacity Reservation (Commitment Tiers)

## Scenario
Customer accidentally selected Capacity Reservation pricing tier and needs to opt out before 31-day commitment.

## Update (Dec 2025)
Customers can now lower tier from commitment to PAYG within 6 hours if accidental.
Doc: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/cost-logs#commitment-tiers

## Options

### Option 1: New/unimportant workspace
Delete workspace - no further charges.

### Option 2: Workspace with important data (after 6h window)
Escalate to PG/EEE for Jarvis action.
- Jarvis Path: AMBackend > LACP Operations > Opt out of 31 day capacity reservation
- ICM Queue: Azure Log Analytics/EEE

### Option 3: Cluster commitment tier reset
Use cluster-specific opt-out action. Note: Dedicated clusters minimum 500 GB/day, no PAYG.

## Escalation Steps
1. Raise IcM using Core Log Analytics template
2. Select "Reset Capacity Reservation" as Feature Area
3. Email/Teams azmonitoreee@microsoft.com
4. No action in 48h -> redirect to Control Plane - CRIs
5. Last resort: Azure Monitor Billing team

## Important
- After reset, customer must manually adjust pricing tier in portal
- **Sentinel workspaces**: Transfer CRI to Sentinel team (they own reset process)
