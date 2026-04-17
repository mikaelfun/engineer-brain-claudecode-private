---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Check billing costs for Log Analytics the consumption per Data Type"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/Workspace%20Management/How-to%3A%20Check%20billing%20costs%20for%20Log%20Analytics%20the%20consumption%20per%20Data%20Type"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
It is common for customers to ask for guidance on how to check for the cost on Log Analytics, but also to drill down which Data Type or Solution is ingesting the most data

# High level steps
---
- [ ] Go to your subscription Cost Management and filter by Log Analytics workspace to see the current cost
- [ ] Query your workspace(s) to validate the solution and data type responsible for the highest ingestion of data
- [ ] If a specific solution is the responsible for the high consumption, drill down and investigate further based on your findings
- [ ] Since App Insights falls under Log Analytics category in billing, if the workspaces are not consuming any data, raise a collaboration to their team

## Go to your subscription Cost Management and filter by Log Analytics workspace to see the current cost
1. From the Azure Portal, go to **Subscriptions** and select the one you are checking the cost on
1. Go to **Cost Analysis** and select the Log Analytics resource
1. Public documentation can be found here:

[View Azure Monitor Usage and Charges](https://learn.microsoft.com//azure/azure-monitor/cost-usage#view-azure-monitor-usage-and-charges)

## Query your workspace(s) to validate the solution and data type responsible for the highest ingestion of data
Query the Usage table. Queries for usage are publicly documented here:

[Analyze usage in a Log Analytics workspace](https://learn.microsoft.com//azure/azure-monitor/logs/analyze-usage)

## If a specific solution is the responsible for the high consumption, drill down and investigate further based on your findings

If you can see high consumption on a specific data source, drill down by querying that same data type and in case it is related either with **Azure Diagnostics**, **Agent data** such as events, custom logs or performance counters or even **Containers** make sure you investigate if the data being collected is present on the machine itself or (in azure diagnostics) on the resource that is configured to send data to Log Analytics. Example queries can be found in our public documentation here:

[Understand Nodes Sending Data](https://learn.microsoft.com//azure/azure-monitor/logs/analyze-usage#understand-nodes-sending-data)



## Since **App **Insights**** falls under Log Analytics category in billing, if the workspaces are not consuming any data, raise a collaboration to their team

If you do not observe a huge amount of GB being collected, and customer still complains that he is noticing high cost on **Log Analytics**, raise a collaboration with the **App Insights** team since the cost behind it, is categorized as **Log Analytics** on the billing reports.  Please use this SAP for the collaboration:

Azure/Application Insights/Deploy, Configure or Manage Application Insights Resources/Billing Related Issues



# References
---
[Manage usage and costs with Azure Monitor Logs | Microsoft Docs](https://learn.microsoft.com//azure/azure-monitor/platform/manage-cost-storage)
[Azure Monitor log queries | Microsoft Docs](https://learn.microsoft.com//azure/azure-monitor/log-query/query-language)

