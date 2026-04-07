---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Query and REST API References/Use App Insights Query Converter Tool"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Query%20and%20REST%20API%20References/Use%20App%20Insights%20Query%20Converter%20Tool"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use App Insights Query Converter Tool

## Overview

Application Insights queries can be executed within Application Insights logs blade using Classic table schema, and can be executed within Log Analytics using the Workspace-based table schema.

This tool does a conversion based on the table schema mapping between Classic and Log Analytics Workspace-based Application Insights syntax.

Table schema mapping reference: https://learn.microsoft.com/azure/azure-monitor/app/convert-classic-resource#table-structure

## Tool

The tool is available at: `appinsightsquerysyntaxtool.azurewebsites.net`

## Considerations

- The Kusto query inserted must be a valid one (case sensitive).
- The original query must be running fine on the Azure Portal — this tool does not edit or validate the actual query.

## Workflow

1. Open the App using the link above to access the converter.
2. Enter the query you would like to convert.
3. The converter works to and from classic/LA schemas (bidirectional).

## Contact

For questions or feedback: David Limpo (Damanue) or TA contact Ban Abuasbeh (baabuasb).
