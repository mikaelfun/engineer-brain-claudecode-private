---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Lighthouse/Troubleshooting Guides/Get Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Lighthouse%2FTroubleshooting%20Guides%2FGet%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## For a Lighthouse delegation CRUD operation
We do not currently have any logs on resource provider scope to review for Lighthouse.

For logs at ARM layer, follow [[TSG] Locate a specific operation in Kusto](https://supportability.visualstudio.com/AzureDev/_wiki/wikis/Dev_ARM/1623816) with the information about the Lighthouse resource being managed.

## For an operation that Azure Lighthouse should authorize
Since Lighthouse works with API calls that go through Azure Resource Manager, follow [[TSG] Get a HTTP trace](https://supportability.visualstudio.com/AzureDev/_wiki/wikis/Dev_ARM/1623815) to collect logs about these calls.
