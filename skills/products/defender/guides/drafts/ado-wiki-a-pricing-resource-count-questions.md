---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Pricing resource count questions"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Pricing%20resource%20count%20questions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Pricing Resource Count Questions

## Issue Categories

| Issue | Possible Reasons | Check |
|---|---|---|
| Resource count = 0 | Exception in blade, missing permissions, or bug | Execute resource count check manually with user permissions. If same result, likely not a bug. Verify user permissions on resource type. If different, check network calls for exceptions. |
| Incorrect count > 0 | Billed resources != actual resources, bug | Run ARG query with user permissions. If same, ensure customer understands counting method. |
| Failed to load | Subscription, user, or blade issue | Does this affect all subscriptions or just one? All users or just one? Compare across subscriptions. |

## Permissions Required

- `Pricing/read` permission to view MDC on/off status per subscription/bundle
- `<resourceType>/read` permission on resources per bundle for billable resource calculation
- Do not confuse AAD roles with Azure RBAC roles

## Required Data for CRI Escalation

Before escalating, provide:
- Clear problem summary with screenshots
- Written summary of customer meeting
- All queries executed with results
- HAR file with suspicious failures highlighted
- Permission checks performed
- All resource count comparisons filtered on same subscription

## Resource Count Explanation

### Subscription vs Workspace Scope

| Scope | Pricing Blade | Quickstart Blade |
|---|---|---|
| Subscription | Count per plan per subscription | Count per plan across all selected subscriptions |
| Workspace | Count per plan per subscription | Count per plan across all selected workspaces |

**Subscription plans** are Azure resources type `Microsoft.Security/Pricing`, managed by MDC backend.

**Workspace bundles** are "virtual" - reflect existence of solutions installed on workspace, not managed by MDC backend.

## Workspace Queries

### Servers Count

```kql
Heartbeat
| summarize by SourceComputerId, ComputerEnvironment
| summarize AggregatedValue = count() by ComputerEnvironment
```

Run on the workspace via Log Analytics workspace blade > Logs.

Returns aggregated VM count by environment (Azure/nonAzure).
