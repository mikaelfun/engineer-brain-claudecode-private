---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Ingestion Pipeline/Ingestion-time Transformation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FIngestion%20Pipeline%2FIngestion-time%20Transformation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Ingestion-time Transformation

## Background

Ingestion-time transformations in Azure Monitor are defined in a Data Collection Rule (DCR) using KQL statements. They enable filtering or modifying incoming data before it's sent to a Log Analytics workspace.

## Why Use Transformations

- **Remove sensitive data**: Filter out or obfuscate sensitive information
- **Enrich data**: Add business context or calculated information
- **Reduce data costs**: Filter out unnecessary data to lower ingestion costs

## Transformation DCR Types

### Workspace transformation DCR
- Applied directly to a Log Analytics workspace
- Performs transformations on data without an associated DCR (e.g., Diagnostics Settings, legacy MMA/OMS agents)
- Does NOT apply to AMA-collected data or API-ingested data

### Azure Monitor Agent transformation DCR
- Transformation logic defined in the DCR used for AMA data collection
- Configured during DCR creation or from Data Sources tab

### Logs Ingestion API transformation DCR
- Transformation logic defined in the DCR used for log ingestion API
- Available when creating custom table via Portal or from Data Sources tab

## Troubleshooting

### parse command 10-column limit

The `parse` command in `transformkql` is limited to 10 columns per statement (performance reasons).

- **Since Jan 6, 2025**: Enforced for new/updated DCRs
- **Jan 6, 2026**: Existing DCRs with >10 parse elements will be STOPPED

**Fix**: Split the `parse` command — see [Optimize log queries](https://learn.microsoft.com/azure/azure-monitor/logs/query-optimization#break-up-large-parse-commands)

For detailed transformation troubleshooting, see the wiki page: Issues related to table transformation (under Support Topics/Configure and Manage Log Analytics tables)

## References

- [Data collection transformations](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-transformations)
- [Workspace transformation DCR](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-transformations-workspace)
- [AMA transformation](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-transformation)
- [Logs Ingestion API transformation](https://learn.microsoft.com/azure/azure-monitor/logs/tutorial-logs-ingestion-portal)
