---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Activity Log Alerts/How to get Activity Log Alert details from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FActivity%20Log%20Alerts%2FHow%20to%20get%20Activity%20Log%20Alert%20details%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get Activity Log Alert details from Azure Support Center

## Instructions

1. Navigate to the desired alert rule in ASC (follow steps in "How to get alert rule details from Azure Support Center").
2. Click on the **Properties** tab.

## Properties Reference

| Property | Description |
|:---------|:------------|
| Enabled | Whether or not the alert rule is enabled |
| Resource Group | The resource group where the alert rule is stored |
| Target Resource Scopes | The Azure scopes applied to the resource (e.g., Azure subscription) |
| ARM tags for rule Resource | Any ARM tags that the alert rule has applied to it |
| Condition JSON | A JSON blob of the conditions under which the alert will fire |
| Additional web hook properties | Deprecated property |
| Last Fired | The date and timestamp in UTC when the alert was last fired |
| Action Group ID (n) | The Azure resourceId with a link to an action group linked to the alert rule |
| Rule Last Updated | The date and timestamp in UTC when the alert rule was last modified |
