---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Grafana/Support%20Boundaries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Managed Grafana - Support Boundaries

We support any functionality within the public MS docs about Azure Managed Grafana. Outside of this, assist with best effort and find relevant Grafana documentation.

## Scenarios

### 1P (Microsoft Employee) Customer
- Direct to internal Swarm channel: [INTERNAL | Azure Managed Grafana Support](https://teams.microsoft.com/l/channel/19%3A877563ec9b9b409ba85a5595abe224f1%40thread.tacv2/Support?groupId=4e24cc02-a532-453a-bfeb-0089595e72e7&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
- If Swarm channel did not provide guidance for ICM, customer can submit ICM via [aka.ms/ags/icm](https://aka.ms/ags/icm) and we can archive the case
- For general usage questions, provide relevant docs and assist best effort

### Not Using Azure Managed Grafana
- We do not support Grafana hosted on VM, AKS, etc. Direct to Grafana Labs.

### Essential SKU Showing Evicted
- Essential SKU has no SLA, hosted on SPOT instances
- Wait 30 min - 24 hours, create in new region, or upgrade to Standard SKU

### Grafana Enterprise Customers
- Assist per support boundaries. Issues with Grafana Labs-owned features -> customer engages Grafana Labs directly via their Enterprise plan.

## Data Sources

| Data Source | Owner | Support Approach |
|-------------|-------|-----------------|
| Azure Monitor | Grafana Labs | Bug -> ICM to PG. Querying issues (syntax, errors, permissions) -> we assist. Azure Resource Graph -> collab with ARG team. |
| Azure Data Explorer | ADX Team | Data source issues -> GitHub issues page. Querying issues -> collab with ADX team. |
| Managed Prometheus | Microsoft | Full end-to-end support for Azure Monitor Workspace. Self-hosted: assist connectivity only. |
| Geneva | Internal MS only | Follow 1P customer guidance. |
| Plugin-installed | Various | Support adding/enabling in portal/Grafana UI. Usage docs -> point to data source documentation. |
| Other | Various | Help with connectivity, involve partner teams as needed. Locate data source docs. |

## Dashboards
- **Built-in dashboard bug** -> engage PG (who will engage partner team)
- **Built-in dashboard data missing** -> investigate the underlying data source, not PG
- **Custom dashboard** -> best effort, refer to Custom Solutions guidelines

## Alerts
- Alerting functionality owned by Grafana Labs, assist best effort
- Azure Monitor data source alerts -> assess if issue is with Azure Monitor REST API
- Recommended: use [Azure Monitor Alerting](https://learn.microsoft.com/azure/managed-grafana/how-to-use-azure-monitor-alerts) for Azure Monitor data sources

## ICM Scenarios (Submit Immediately)

### "Welcome to Grafana Enterprise" Splash Screen
- User with proper permissions only sees Enterprise splash screen
- Instance needs patching by PG, CSS cannot resolve

### Reproducible Azure Managed Grafana Resource Issue
- Follow data source guidance above for data source issues
- Resource-level reproducible issue -> submit ICM
