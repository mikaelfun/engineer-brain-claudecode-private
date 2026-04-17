---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Availability Tests/SLA Report workbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Topics/Availability%20Tests/SLA%20Report%20workbook"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SLA Report Workbook Troubleshooting

## Scenario
Questions about the Downtime & Outages workbook output in Application Insights Availability Tests.

## Common Issues

### Do not understand the meaning of a report
- See the "Help" tab on the workbook itself (beside the "Settings" tab)
- Reference: [Downtime & Outages workbook](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard#downtime--outages-workbook)

### Want to customize the workbook
- All workbooks can be modified for customized data
- CSS provides generic examples or helps debug customized workbooks, but does not deliver final solutions
- Reference: [Azure Workbooks overview](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview)

### Missing data
- Data is pulled from Resource Graph queries + Application Insights log data
- Use the "view in logs" icon throughout the workbook to inspect queries
- Collect HAR trace to reveal the Resource Graph queries, Log Queries, and their results

### Workbook is not loading or erroring
- Check if error is access privilege related
- Reference: [Access control for workbooks](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview#access-control)
- General portal blade troubleshooting may apply
