---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Concepts/VM Insights DCR"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FConcepts%2FVM%20Insights%20DCR"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM Insights DCR (Data Collection Rule)

## Overview

The VM Insights DCR is the instruction set AMA (and Dependency Agent for Map view, optional) uses to determine what data to collect. DCRs created through the portal experience will have names starting with 'MSVMI-'. Customers deploying via ARM, Bicep, or Terraform can use any name.

## DCR with Map (Performance + Map tabs)

This DCR includes:
- **Microsoft-InsightsMetrics** stream with `\\VmInsights\\DetailedMetrics` performance counter group
- **Microsoft-ServiceMap** stream with DependencyAgent extension configuration

```json
{
    "type": "Microsoft.Insights/dataCollectionRules",
    "apiVersion": "2023-03-11",
    "properties": {
        "description": "Data collection rule for VM Insights.",
        "dataSources": {
            "performanceCounters": [
                {
                    "streams": ["Microsoft-InsightsMetrics"],
                    "samplingFrequencyInSeconds": 60,
                    "counterSpecifiers": ["\\VmInsights\\DetailedMetrics"],
                    "name": "VMInsightsPerfCounters"
                }
            ],
            "extensions": [
                {
                    "streams": ["Microsoft-ServiceMap"],
                    "extensionName": "DependencyAgent",
                    "extensionSettings": {},
                    "name": "DependencyAgentDataSource"
                }
            ]
        },
        "destinations": {
            "logAnalytics": [
                {
                    "workspaceResourceId": "<LAW_RESOURCE_ID>",
                    "name": "VMInsightsPerf-Logs-Dest"
                }
            ]
        },
        "dataFlows": [
            {
                "streams": ["Microsoft-InsightsMetrics"],
                "destinations": ["VMInsightsPerf-Logs-Dest"]
            },
            {
                "streams": ["Microsoft-ServiceMap"],
                "destinations": ["VMInsightsPerf-Logs-Dest"]
            }
        ]
    }
}
```

## DCR without Map (Performance tab only)

Same as above but without the `extensions` data source and `Microsoft-ServiceMap` data flow.

## Resources

- [Enable VM Insights DCR](https://learn.microsoft.com/azure/azure-monitor/vm/vminsights-enable-overview#vm-insights-data-collection-rule)
