---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Support Topics/Solutions and Insights/A solution I use is being retired"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FSupport%20Topics%2FSolutions%20and%20Insights%2FA%20solution%20I%20use%20is%20being%20retired"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Retired Solutions Troubleshooting Guide

This workflow helps troubleshoot issues with retired Log Analytics solutions and provides migration guidance.

## Retired Solution List

| Solution | Status | Replacement |
|----------|--------|-------------|
| Azure Application Gateway analytics | Retired | Azure Monitor Workbooks |
| Network Performance Monitor (NPM) | Retired (no new tests since July 2021) | Connection Monitor in Azure Network Watcher |
| Wire Data 2.0 | Ended March 31, 2022 | VM Insights |
| Service Map | Deprecated | VM Insights (Map feature) |
| Office 365 management | Removed October 31, 2022 | Office 365 connector in Microsoft Sentinel |
| Alert Management | No longer in active development | Azure Resource Graph |

## Azure Application Gateway Analytics

- If customer receives error "Enabling solution of type AzureAppGatewayAnalytics is not allowed", the solution has been retired
- Migrate to Azure Monitor Workbooks: [Migration steps](https://learn.microsoft.com/azure/azure-monitor/insights/azure-networking-analytics#migrating-from-azure-gateway-analytics-solution-to-azure-monitor-workbooks)
- For custom requirements: [Workbook configuration](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-getting-started)
- For diagnostic data issues, use the diagnostic TSG

## Network Performance Monitor (NPM)

- No new tests can be added since July 1, 2021
- Existing tests created before July 2021 continue to work
- Migration: [Migrate from NPM to Connection Monitor](https://learn.microsoft.com/azure/network-watcher/migrate-to-connection-monitor-from-network-performance-monitor)
- NPM functionality is supported by Azure Network team; LA team supports workspace/query issues only
- Reference: [NPM FAQ](https://learn.microsoft.com/azure/azure-monitor/insights/network-performance-monitor-faq)

## Wire Data 2.0

- Support ended March 31, 2022
- If customer still has Wire Data enabled, suggest migration to [VM Insights](https://learn.microsoft.com/azure/azure-monitor/insights/wire-data#migrate-to-azure-monitor-vm-insights-or-service-map)
- Issues will not be fixed

## Service Map

- Deprecated in favor of VM Insights Map feature (with latest UI and additional health/performance monitoring)
- Troubleshooting is mostly related to dependency agent: [Service Map TSG](https://learn.microsoft.com/azure/azure-monitor/vm/service-map#troubleshooting)
- Clarify if customer uses Azure Monitor Agent or Log Analytics Agent:
  - AMA for Windows: see AMA TSG
  - AMA for Linux: see AMA TSG
  - LA agent for Windows: see MMA TSG
  - LA agent for Linux: see OMS Agent TSG
  - Dependency agent log collection: see Dependency agent TSG

## Office 365 Management Solution

- Onboarding scripts no longer available; solution removed October 31, 2022
- Migration: [Office 365 connector in Sentinel](https://learn.microsoft.com/azure/sentinel/data-connectors-reference#microsoft-office-365)
- O365 connector is fully supported by Azure Sentinel team
- For assistance with new connector, engage Azure Sentinel team

## Alert Management Solution

- No longer in active development; issues will not be fixed
- Alternative: [Azure Resource Graph for alerts](https://learn.microsoft.com/azure/azure-monitor/resource-graph-samples?tabs=azure-cli)
- Workbook alternative: [Azure Monitor Workbook with Resource Graph data source](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-data-sources#azure-resource-graph)

## General Guidance for Other Retired Solutions

- Check for [newer curated visualizations or insights](https://learn.microsoft.com/azure/azure-monitor/monitor-reference#insights-and-curated-visualizations)
- If replacement does not have exact same data, suggest deploying custom workbook by modifying existing workbook templates
- For workbook design questions, contact AME SME or workbook product team
