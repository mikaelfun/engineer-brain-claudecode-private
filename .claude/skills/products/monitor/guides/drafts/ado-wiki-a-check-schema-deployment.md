---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: How to check for Schema Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20How%20to%20check%20for%20Schema%20Deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# HT: How to check for Schema Deployment

## Scenario
Log Analytics schemas are not consistent across regions and with same schema versions. This causes issues when users cannot find a schema in certain region, or when schema is different between regions.

## New capability
We now have visibility for schemas deployment via Power BI report: **Artifact deployment report**.

Request access: [Artifact deployment report](//msit.powerbi.com/groups/me/reports/525a98e5-a4ec-451a-816c-e2040a096a71/ReportSection)

## How to Filter the Report
Available Filters:
- **Artifact Type** - should be 'Tables'. 'Select all' also shows workflows
- **Up to date in all regions** - shows only schemas that aren't available in all regions
- **Artifact name** - allows search for a particular schema(s)
- **Regions** - shows Log Analytics supported regions

## More Information
Related IcM: [228221408](//portal.microsofticm.com/imp/v3/incidents/details/228221408/home)
