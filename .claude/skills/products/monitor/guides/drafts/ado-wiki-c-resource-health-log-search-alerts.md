---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Concepts/Resource Health for Log Search Alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/Concepts/Resource%20Health%20for%20Log%20Search%20Alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Resource Health for Log Search Alerts — Reference Guide

## Overview

Log Search Alerts are onboarded to Azure Resource Health to help customers self-diagnose and resolve issues. Resource Health reports the current and past health of Log Search Alert rules.

## Unavailable Events

| Title | Event Name | Summary | Advice for CSS |
|-------|-----------|---------|---------------|
| Unknown | RESOURCE_STATE_UNKNOWN | Alert rule is disabled or in unknown state | Check if alert was disabled; investigate outages. |
| Unknown Reason | NO_REASON | Alert unavailable due to unknown reason | If alert runs **less frequently than every 15 minutes** (30min, 1hr, etc.) — Unavailable is **expected behavior**, not an issue. May also appear right after creation until first evaluation completes. Otherwise investigate outages. |
| Unavailable | NO_REASON | Issues with backend querying service | Investigate outages; check evaluation history for error messages. |

## Degraded Events

| Title | Event Name | Summary | Advice for CSS |
|-------|-----------|---------|---------------|
| Degraded (unknown reason) | NO_REASON_DEGRADED | Degraded due to unknown reason | Investigate outages; check evaluation history error messages. |
| Setting up resource health | RESOURCE_STATE_NOT_IN_DATAMART | Setting up Resource Health for new resource | Expected for newly created alert rules — resolves after first evaluation. |
| Semantic error | DRAFT_SEMANTIC | Query failing due to semantic error | Check evaluation history for error messages. |
| Syntax error | DRAFT_SYNTAX | Query failing due to syntax error | Check evaluation history for error messages. |
| Response size too large | DRAFT_RESPONSE_SIZE | Query response size exceeds limits | Check Log Analytics service limits. |
| Query consuming too many resources | DRAFT_QUERY_COST | Query consuming too many resources | See query optimization best practices: https://aka.ms/logqueryperf |
| Query validation error | DRAFT_QUERY_VALIDATION | Query failing due to validation error | Most often caused by using **Basic logs tables** — not supported in log search alerts. Use Analytics log data plan. |
| Workspace not found | DRAFT_WORKSPACE_NOT_FOUND | Target Log Analytics workspace not found | Alert scope workspace was moved/renamed/deleted. **Recreate the alert rule** with a valid workspace. |
| App Insights resource not found | DRAFT_APPLICATION_NOT_FOUND | Target Application Insights resource not found | Alert scope AI resource was moved/renamed/deleted. **Recreate the alert rule** with a valid AI resource. |
| Query throttled (429) | DRAFT_THROTTLING_CUSTOMER | Query throttled | Review query; see query limits in Azure Monitor Service Limits. |
| Query throttled (429) | DRAFT_THROTTLING_QUEUED_REQUESTS_LIMIT | Query throttled | Review query; see query limits. |
| Query throttled (429) | DRAFT_THROTTLING_QUEUED_TIMEOUT | Query throttled | Review query; see query limits. |
| Query throttled (429) | DRAFT_THROTTLING | Query throttled | Review query; see query limits. |
| Unauthorized to run query | DRAFT_UNAUTHORIZED | Query failing due to lack of permissions | Check permissions object / managed identity access on workspace and resources. Check evaluation history error messages. |
| Unauthorized to run query | DRAFT_FORBIDDEN | Query failing due to lack of permissions | Check permissions object / managed identity access on workspace and resources. Check evaluation history error messages. |
| NSP validation failed | DRAFT_NSP_VALIDATION | Query failing due to NSP validation issues | Log Analytics workspace is in NSP but alert rule is not. Add alert rule to NSP or add inbound NSP rules to allow Alerts access. Public preview feature. |
| Active alerts limit exceeded | LIMIT_DAILY_ALERT_COUNT_EXCEEDED | Exceeds limit of fired (non-resolved) alerts per day | Limit: **6000 fired alerts per rule at a time** (technically 12000 fires within 48hrs). See Azure Monitor Service Limits — Alerts. |
| Dimension combinations limit exceeded | LIMIT_DIMENSION_COMBINATION_COUNT_EXCEEDED | Exceeds allowed dimension combination limit | **Stateless**: 6000 combinations max. **Stateful**: 300 combinations max. See Azure Monitor Service Limits — Alerts. |

## Escalation

- **Swarming Channel:** Azure Monitor Pod Swarming — Alerts and Action Groups (Teams)
- **ICM Path:** Azure Monitor | Log Alerts (aka Log Search Alerts) - Data Plane - False or missed alerts
  - Service: Azure Log Search Alerts
  - Team: Log Search Alerts (Scheduled Query Rules) On Call

## Helpful Resources

- [Resource Health Overview](https://learn.microsoft.com/azure/service-health/resource-health-overview)
- [Log alert rule health documentation](https://learn.microsoft.com/azure/azure-monitor/alerts/log-alert-rule-health)
- [Azure Monitor Service Limits — Alerts](https://learn.microsoft.com/azure/azure-monitor/service-limits#alerts)
- How to interpret log alert evaluation failure messages (internal wiki)
- Troubleshooting Log Search Alert evaluation failures and Resource Health events (internal wiki)
