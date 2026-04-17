---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Determine a data type source"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Determine%20a%20data%20type%20source"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
---
The first thing we need to determine while troubleshooting Log Analytics data issues, is the data type source, as that will influence both the troubleshooting as well the escalation path. We have two main sources which are '**Agents**' and '**OBO**' (On Behalf Of).

# Pre-requisites
---
To be able to run the Jarvis, you'll need access to the relevant Jarvis namespace, so please follow the procedure described in HT: Get access to ODS telemetry namespace in Jarvis.

# Identifying a data type source
---
Currently we have two ways to do this:
1. consulting a Excel file that we periodically updated (preferred way)
2. running a Jarvis query

**Please note that all custom logs are ingested via ODS, as they are either created via agents or the HTTP Data Collector API.**

## Consulting the Excel file
---
You can access the table using this link: [Data type source](https://microsofteur-my.sharepoint.com/:x:/g/personal/josecons_microsoft_com/EXkOj15ieG9MsV_lZ-S4q7MBOpO737u7vjoFbrXnZRDHfA?e=sooepA)

Once you open the file, use the 'Find' feature or the built-in filters to find the relevant data type.

## Using a Jarvis query
---
Use Jarvis query: https://jarvis-west.dc.ad.msft.net/35EA2600

Fill in:
1 - Workspace region
2 - Time range ('Now' and '- 2 Hours')
3 - The data type name (note: space between colon and data type name)

### Interpreting the results
The 'SourceService' column shows the data type source.

# References
---
- [Log Analytics agent data sources in Azure Monitor](https://learn.microsoft.com//azure/azure-monitor/platform/agent-data-sources)
- [Collect custom logs with Log Analytics agent](https://learn.microsoft.com//azure/azure-monitor/platform/data-sources-custom-logs)
- [Send log data to Azure Monitor with the HTTP Data Collector API](https://learn.microsoft.com//azure/azure-monitor/platform/data-collector-api)
