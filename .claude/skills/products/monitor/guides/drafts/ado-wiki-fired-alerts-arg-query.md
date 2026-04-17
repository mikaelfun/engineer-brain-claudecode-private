---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Alerts Management/How to get fired alerts using Azure Resource Graph query"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAlerts%20Management%2FHow%20to%20get%20fired%20alerts%20using%20Azure%20Resource%20Graph%20query"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get fired alerts using Azure Resource Graph query

## Before You Begin

This article is meant to provide guidance to customers seeking to query their fired alert instances programmatically. We want to encourage customers to go towards using ARG rather than the Alerts Management api, particularly when the requirement is querying at scale or across multiple subscriptions. This article will demonstrate querying through the Azure Portal, but this can be done using CLI / PS / REST and more.

## Querying Azure Resource Graph

1. In the Azure Portal, search and navigate to **Resource Graph Explorer**

   The scope for the query can be adjusted using the scope on the left side navigation.

2. Paste the below query in the query window:

   ```kusto
   alertsmanagementresources
   | where properties.essentials.lastModifiedDateTime > ago(1d)
   | project alertInstanceId = id, parentRuleId = tolower(tostring(properties['essentials']['alertRule'])), sourceId = properties['essentials']['sourceCreatedId'], 
   alertName = name, severity = properties.essentials.severity, status = properties.essentials.monitorCondition, state = properties.essentials.alertState, 
   affectedResource = properties.essentials.targetResourceName, monitorService = properties.essentials.monitorService, signalType = properties.essentials.signalType,
   firedTime = properties['essentials']['startDateTime'], lastModifiedDate = properties.essentials.lastModifiedDateTime, lastModifiedBy = properties.essentials.lastModifiedUserName
   ```

   This sample query will display alerts fired in the last 24 hours along with some basic details, such as monitor service and signal type, fired time, alert rule etc.

   Additional fields can be added based on customer specific scenario using the essential fields.

## Documentation reference

- [Manage your alert instances programmatically](https://docs.microsoft.com/azure/azure-monitor/alerts/alerts-overview#manage-your-alert-instances-programmatically)
- [Azure Resource Graph overview](https://docs.microsoft.com/azure/governance/resource-graph/overview)
