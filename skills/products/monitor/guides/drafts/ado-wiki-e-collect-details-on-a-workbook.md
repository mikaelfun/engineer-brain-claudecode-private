---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Collect details on a workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCollect%20details%20on%20a%20workbook"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect details on a workbook

## Summary

Key to assisting on a workbook issue is to understand what resource the workbook is getting its data. This allows the proper team to be engaged.

## Steps

1. Go to the Azure portal
1. Navigate to the workbook in question
1. Collect the browser URL as to where the workbook is located
1. Note the name of workbook (above URL will not contain this information)
1. Use the "</>" button at the top of the page
1. In the resulting window, leave the "Template Type" as "Gallery Template" as this is easier to read.
1. Copy and collect the JSON contents of this window
1. Use the "Cancel" button in the upper right to close the window
