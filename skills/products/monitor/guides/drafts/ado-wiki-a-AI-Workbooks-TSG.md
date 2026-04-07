---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Integration with Application Insights/Built-in workbooks"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FIntegration%20with%20Application%20Insights%2FBuilt-in%20workbooks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Workbooks TSG (Built-in + Custom)

## Scenario
Problems using workbooks with Application Insights data.

### Built-in Workbooks
- Purple globe icon workbooks: Failure Analysis, Performance Analysis, HEART Analytics
- NOT about modified versions of built-in workbooks

### Custom Workbooks
- Modified versions of built-in workbooks or entirely custom-built
- NOT about the built-in purple-globe workbooks

## Scoping Questions
- Collect details on the workbook (name, type, location)
- Why is what is presented believed incorrect?
- What are expected results?
- Is there contradicting evidence?

## Analysis Decision Tree

### Item (table/chart) not populated
1. Use "Refresh" button at top of workbook to force refresh
2. Determine if the underlying query is correct
3. Use "Edit" to access the driving query
4. Validate: Is the query returning correct results for its design?

### Information shown is not correct
1. Use "Refresh" button to force refresh
2. Access the driving query via "Edit"
3. Validate query results match expected behavior

### Missing workbook
1. Follow: Troubleshoot general portal blade issues

### Exception being shown
1. Follow: Troubleshoot general portal blade issues

### Questions about Downtime & Outages workbook
- See: Downtime & Outage Report - Overview (internal wiki)

## Key Concepts
- Built-in workbooks can be validated using your own subscription/resources
- Query correctness is the key diagnostic - always check the underlying query first

## Documentation
- [Azure Workbooks overview](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)
