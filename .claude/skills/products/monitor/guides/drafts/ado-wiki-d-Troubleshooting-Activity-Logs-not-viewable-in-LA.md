---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Activity Logs/Troubleshooting Guides/Troubleshooting Activity Logs not viewable in Log Analytics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Activity%20Logs/Troubleshooting%20Guides/Troubleshooting%20Activity%20Logs%20not%20viewable%20in%20Log%20Analytics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to customer reports of when they expect the Azure Activity Log to have been exported to their Log Analytics Workspace, but are unable to return any data related to it when they attempt a query.

# Support Boundaries
---
- [Support Boundaries - Activity Logs](/Monitoring-Essentials/Activity-Logs#support-boundaries)

# Information you will need
---
- The Azure subscription id for which the customer wants to export activity logs.

- The Log Analytics Workspace resource Id (or workspace Id) that acts as the destination for the export.

- The verbatim of any error message(s) or output that was seen in the logs pane when attempting to query the Azure Activity Log from the workspace.

- Context for what the customer's expectation was of their data (did they expect to see records of a certain type, of a large count, from a certain date, under a certain URI, etc) **This is an important piece of information for any 'missing data' support requests.**

::: template /.templates/TSG-KnownIssues-ActivityLogs.md
:::
- #28523
- #16804

# Troubleshooting
---

1. **Confirm the context of the data missing from their Log Analytics query**

   This is a reiteration of the fourth item above from "Information you will need", but it is important to ensure the context of the missing data is well established before engaging in deep troubleshooting. 

   The customer may be expecting only a specific category of data, such as "Security" events, or may be expecting events from a specific time of day, or even individually from specific Activity Id(s) related to actions taken by a resource. 

   This is the time to resolve 'common sense' reasons for the missing data, such as a customer expecting to see "Security" events and specifying in their query only the "Administrative" category, or expecting events to appear in Log Analytics from before their Diagnostic Setting was even created to perform the exports.

   However, it should be noted that even if the issue is not resolved as a misunderstanding of the context, identifying the exact difference between the customer's expectation of the data and what they see in their query result is important for moving forward.

   <u>This step may involve changing the scope of the troubleshooting depending on how the context is identified:</u>
   - If the customer is missing an individual Activity Log Event(s), verify the existence of the events in the Activity Log itself using a method such as [Activity Log From ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480451/How-to-get-Activity-Log-events-from-Azure-Support-Center)
   - If the event itself does not exist, we would not expect it to get exported to Log Analytics, and so the scope will change. We likely then need to colab with the owning Resource Provider team to clarify whether that kind of operation should have generated an Activity Log event to begin with, and if it was meant to, why it did not. 
   - If the event itself does exist in the Activity Log at least, then we can proceed to the next steps in identify how it should have been exported, and if it was.

1. **Identify the source of the data**

   When working with exported Azure Activity Log data in a Log Analytics Workspace the data will always exist as type "AzureActivity", but may come from one of currently two sources
   - The standard source will be Diagnostic Settings, as this is the currently supported export configuration
   - The secondary source is the older Log Analytics [Data Connector for the Activity Log](https://learn.microsoft.com/azure/azure-monitor/essentials/activity-log?tabs=powershell#legacy-collection-methods). This is currently on path to be deprecated, and it no longer has a UI, but can still have been enabled by a customer in the past. If this is enabled, the recommendation is to disable this, and create a Diagnostic Setting for the same purpose instead.

   Identifying the source of the data can be done in various ways, such as [checking the subscription Diagnostic Settings](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480503/How-to-get-Activity-Log-diagnostic-settings-for-an-Azure-subscription-from-Jarvis), or using the above link to [list the data sources on the workspace](https://learn.microsoft.com/azure/azure-monitor/essentials/activity-log?tabs=powershell#legacy-collection-methods).

   Another method for performing this check is to see if fields such as the "Category" and "OperationName" fields exist in the data. In the Diagnostic Setting export configuration, these fields have been replaced by ["CategoryValue" and "OperationNameValue"](https://learn.microsoft.com/azure/azure-monitor/essentials/activity-log?tabs=powershell#data-structure-changes:~:text=OperationName-,OperationNameValue,-REST%20API%20localizes) fields, for example. 

   *An example of performing this check, confirming the source is Diagnostic Settings: "OperationName" and "Category" are excluded from the results as they do not exist in the data*
![An example of performing this check, confirming the source is Diagnostic Settings: "OperationName" and "Category" are excluded from the results as they do not exist in the data](/.attachments/image-c1c09311-7364-4d55-b2ee-c178bdfff483.png)

   - If the source of the data is the Log Analytics Data Connector, while this would be expected to function properly, the recommendation is still to remove the data connector and replace it with a Diagnostic Setting to perform the export. Further troubleshooting may need to resume after this change has taken affect and the behavior tested again.

3. **Proceed toward the relevant troubleshooting scope**

<div style="margin:35px">
<details closed>
<summary><b>The data missing is [all data]</b></summary>
<div style="margin:25px">

- Verify the [Diagnostic Setting exists for the subscription](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Kusto#get-all-settings-for-an-azure-subscription), is configured to export the relevant categories of Activity Log data, and is targeting the expected Log Analytics Workspace

- If the Diagnostic Setting exists as expected, check if [OBO is receiving data from the Activity Log for export](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480502/How-to-check-if-resource-provider-sent-data-to-OnBehalfOf-service-in-Kusto#:~:text=by%20PreciseTimeStamp%20asc-,Azure%20subscription,-%5BLaunch%20Kusto)

- If OBO is receiving data from the Activity Log for export, check if the data received by OBO is being sent to the workspace properly, or if failures are occurring. A query built for checking this is below.

**(Should we build this as a How-To separately?)**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let subId = " <the subscription Id> ";
let startDate = datetime("2023-01-01 00:00:00");
let endDate = datetime("2023-01-05 00:00:00");
ODSPostTelemetry
| where PreciseTimeStamp between (startDate .. endDate)
| where customerFirstTagId startswith strcat("/subscriptions/", subId) and serviceIdentity == "AzureResourceManager" and odsDataTypeId == "MICROSOFTINSIGHTS_AZUREACTIVITYLOG"
| summarize min(PreciseTimeStamp), min(isFailed) by firstPartyBlobPath, category
| extend resultMatrix = strcat(category, "-", case(min_isFailed == 0, "Success", "Failed"))
| summarize count() by bin(min_PreciseTimeStamp, 1h), resultMatrix
| render timechart 
               
   ```


- If the data is being received properly by the Log Analytics Workspace, continue downstream to the Log Analytics Workspace for checking blockers such as retention/quotas/ingestion issues
</div>
</details>

&nbsp;
<details closed>
<summary><b>The data missing is [one category of data]</b></summary>
<div style="margin:25px">

- Verify the [Diagnostic Setting exists for the subscription](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Kusto#get-all-settings-for-an-azure-subscription), is configured to export the relevant category(ies) of Activity Log data, and is targeting the expected Log Analytics Workspace

- If the Diagnostic Setting exists as expected, check if [OBO is receiving data from the Activity Log for export](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480502/How-to-check-if-resource-provider-sent-data-to-OnBehalfOf-service-in-Kusto#:~:text=by%20PreciseTimeStamp%20asc-,Azure%20subscription,-%5BLaunch%20Kusto) of the required Category(ies). 

This may require an edit to the above document's queries similar to the following, to check for the existence of specific categories of Activity Logs sent to OBO:

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let subId = " <the subscription Id> ";
let startDate = datetime("2023-01-01 00:00:00");
let endDate = datetime("2023-01-05 00:00:00");
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startDate .. endDate)
| where firstTagValue startswith strcat("/subscriptions/", subId) and serviceIdentity == "AzureResourceManager"
| extend removespace = substring(recordCountByCategories, 0, strlen(recordCountByCategories)-1)
| extend categoriesArray = split(removespace, " ")
| mv-expand categoriesArray
| extend categoryNameOnly = substring(categoriesArray, 0, indexof(categoriesArray, "("))
| extend categoryRecordCount = toint(substring(categoriesArray, indexof(categoriesArray, "(") + 1, indexof(categoriesArray, ")") - indexof(categoriesArray, "(") - 1))
| summarize sum(categoryRecordCount) by bin(PreciseTimeStamp, 1h), categoryNameOnly
| render timechart 
               
   ```

- If OBO is receiving data from the Activity Log for export of either the required category or categories of "Write/Action/Delete", check if the data received by OBO is being sent to the workspace properly, or if failures are occurring. A query built for checking this is below.

**(Should we build this as a How-To separately?)**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let subId = " <the subscription Id> ";
let startDate = datetime("2023-01-01 00:00:00");
let endDate = datetime("2023-01-05 00:00:00");
ODSPostTelemetry
| where PreciseTimeStamp between (startDate .. endDate)
| where customerFirstTagId startswith strcat("/subscriptions/", subId) and serviceIdentity == "AzureResourceManager" and odsDataTypeId == "MICROSOFTINSIGHTS_AZUREACTIVITYLOG"
| summarize min(PreciseTimeStamp), min(isFailed) by firstPartyBlobPath, category
| extend resultMatrix = strcat(category, "-", case(min_isFailed == 0, "Success", "Failed"))
| summarize count() by bin(min_PreciseTimeStamp, 1h), resultMatrix
| render timechart 
               
   ```

- If the data is being received properly by the Log Analytics Workspace, continue downstream to the Log Analytics Workspace for checking blockers such as retention/quotas/ingestion issues
</div>
</details>

&nbsp;
<details closed>
<summary><b>The data missing is [one/several individual records/activityIds]</b></summary>
<div style="margin:25px">

- Identify the category of the record(s) that are missing from the customer's workspace or query by checking from the Activity Log directly in the Event.

- Afterward, verify the [Diagnostic Setting exists for the subscription](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-settings-for-Azure-resources-from-Kusto#get-all-settings-for-an-azure-subscription) and is configured to export the relevant category of Activity Log data, and is targeting the expected Log Analytics Workspace.

- Identify the blobpath the should contain the record in question via the How-To process [outlined here](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/804141/How-to-get-blobpath-for-Activity-Log-Event) 

- Once you have located the blobpath that should contain the particular missing record, get the [processing history of that blobpath](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/500274/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto) by using **"/subscriptions/ <the sub Id>"** as the resource Id. (for example, "/subscriptions/abcdabcd-abcd-abcd-abcd-abcdabcdabcd" as the resourceId supplied for the How-To articles' query, as this is the resourceId of the Activity Log)

- If the processing history indicates failures or does not exist, engage a SME for further assistance in locating the individual record(s).
- If the processing history indicates that the record was successfully processed, continue downstream to the Log Analytics Workspace for checking blockers such as retention/quotas/ingestion issues

</div>
</details>

</div>

## Getting Help
:::template /.templates/TSG-GettingHelp-ActivityLogs.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::