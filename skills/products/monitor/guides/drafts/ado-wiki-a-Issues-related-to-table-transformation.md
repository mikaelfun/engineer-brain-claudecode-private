---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Configure and Manage Log Analytics tables/Issues related to table transformation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FConfigure%20and%20Manage%20Log%20Analytics%20tables%2FIssues%20related%20to%20table%20transformation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scenario
The purpose of this workflow is to guide you to troubleshoot issues regarding table transformation.

## Minimum information needed
* Subscription ID
* Time window of when the issue occurred
* Issue type: Transformation not applied, No new data after transformation, Volume reduced after transformation
* Error message (if applicable)
* Workspace name or URI, region
* Name(s) of the table(s)

## Troubleshooting
First review: [Ingestion-time Transformation wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1616875/Ingestion-time-Transformation)

- **Workspace transformation DCR**: [Ingestion-time Transformation with Default DCR](/Log-Analytics/Troubleshooting-Guides/Table-management/Ingestion%2Dtime-transformation-with-default-DCR)
- **AMA transformation DCR**: [Ingestion-time Transformation with AMA](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1521138/Ingestion-time-Transformation-with-Azure-Monitor-Agent)

> **Important**: When using custom tables, ensure the destination table schema contains custom columns matching all fields in the records. Fields not in schema are silently dropped (e.g., SyslogMessage dropped if not defined, leaving RawData empty).

## Useful links
- [Data collection transformations in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-transformations)
- [Structure of transformation](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-transformations-structure)