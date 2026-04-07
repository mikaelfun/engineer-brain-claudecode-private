---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to get Azure Notification history for an Action Group from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Alerts/How-To/Action%20Groups%20and%20Notifications/How%20to%20get%20Azure%20Notification%20history%20for%20an%20Action%20Group%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Azure Notification History for an Action Group from Kusto

## Before You Begin

For details on how to add Kusto clusters, see article "How to add Kusto clusters needed by Azure Monitor to Kusto Explorer".

The Kusto cluster, database and table information varies by Azure cloud (refer to AzNS Kusto Endpoints template).

## Querying For Notification History

1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.
2. Expand the connection you created to the desired Kusto cluster and database.
3. Copy and paste the following Kusto query into the query window, replace `ACTIONGROUPRESOURCEIDGOESHERE` with the Azure resource ID of the Action Group, then click **Run (F5)**.

```kql
let actionGroupId = "ACTIONGROUPRESOURCEIDGOESHERE";
AzNSTransmissions_All
| where AssociatedGroupId =~ actionGroupId
| sort by CreatedTime desc
| project-reorder NotificationId, TransmitId, NotificationState, MechanismType, CreatedTime, TransmissionLogTime, CompletedTime, UserIdentity, AdditionalInfo
```

## Key Properties

| Property | Description |
|----------|-------------|
| NotificationId | The unique notification identifier in the Azure notification system. |
| TransmitId | The unique transmission identifier in the Azure notification system. |
| NotificationState | The status of the notification processing. |
| JobCtxSource | The source system that created the notification job (OMS Log Search = Log Search Alert, GenevaHealth = Metrics Alert, Microsoft.Insights/activityLogs = Activity Log Alert). |
| CreatedTime | The timestamp of when the notification was created in the Azure notification system. |
| CompletedTime | The timestamp of when the notification processing completed. |
| MechanismType | The type of notification (for example Email, SMS etc.). |
| AssociatedGroupId | The Azure resourceId of the action group. |
| FailureReason | If the notification processing failed, an error should be written here. |
| ActivityId | Contained in the AdditionalInfo property (formatted as a json blob), the activity identifier related to the notification. When looking at notifications generated from Azure Support Center, this will often be referred to as CorrelationId. |
