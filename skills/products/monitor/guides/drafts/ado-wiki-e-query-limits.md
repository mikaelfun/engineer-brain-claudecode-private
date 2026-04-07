---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Query limits"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FQuery%20limits"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Log Analytics Query Limits

## Background

Azure Monitor Logs has query limits documented at:
[Azure Monitor service limits](https://learn.microsoft.com/azure/azure-monitor/service-limits#log-queries-and-language)

## Can Query Limits Be Increased?

**Generally NO.** Limits protect customers and the service. User education is the correct approach.

### Exceptions (can be increased via CRI)

| Measure | Default Limit | Max Increase | Description |
|--|--|--|--|
| Concurrent queries | 5 per user | Up to 15 | Running queries; extras queued. Alert queries excluded. |
| Query rate | 200 per 30s per user | Case-by-case | Applies to programmatic queries and dashboard refreshes |

**Process to request increase:**
1. Must be for a specific Service Principal (SPN) or standard user
2. Open a CRI and assign to Draft team
3. Approval is NOT guaranteed — subject to PG discretion

## Dedicated Cluster and Limits

Dedicated clusters are NOT meant for bypassing query limits. This should not be the motivation for choosing a dedicated cluster.

## Limits Apply To

- **ADX to Log Analytics queries**: Yes, same limits apply
- **Grafana queries**: Yes, same limits for all offerings except Azure Managed Grafana (planned future improvement for user-based auth, no ETA)

## Tips to Manage Limits

1. **Optimize queries**: See TSG "Queries run slowly or have performance issues"
2. **Break up dashboards/workbooks**: Split into smaller views that load on demand
3. **Multiple SPNs for Grafana**: Create separate SPNs per data source to distribute limits
4. **Power BI**: Extract aggregated results rather than raw logs
5. **Non-efficient queries** → more likely to hit 429 (queue timeout after 180s)
