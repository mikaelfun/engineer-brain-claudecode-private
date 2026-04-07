---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Smart detection/How to get smart detection configuration from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FAlerts%2FHow-To%2FSmart%20detection%2FHow%20to%20get%20smart%20detection%20configuration%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get smart detection configuration from Azure Support Center

> **Note**: This article is only applicable for smart detectors who hasn't been migrated to smart alerts.

## Steps

1. Navigate to Azure Support Center Resource Explorer.
2. Locate the desired Application Insights component (via Resource Group or providers → microsoft.insights → components).
3. Navigate to **Proactive Diagnostics Config** tab.

## Reviewing the results

| Property | Description |
|:---------|:------------|
| Config Name | Smart detector internal name. |
| Enabled | Is detector enabled or disabled. |
| Send to Owners | Is configured to send notifications to "Monitoring Reader" or "Monitoring Contributor" roles. |
| Custom E-mail Count | How many custom email addresses (not through ARM role) are configured to receive notifications. |
