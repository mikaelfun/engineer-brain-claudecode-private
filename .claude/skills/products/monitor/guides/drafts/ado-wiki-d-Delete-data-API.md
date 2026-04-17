---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Table management/Delete-data API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FTable%20management%2FDelete-data%20API"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Delete-data API

## Public Documentation
- [Delete data from a Log Analytics workspace by using the Delete Data API](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/delete-log-data)

## How the Delete Data API works

The Delete Data API is ideal for unplanned deletions of individual records. For example, when you discover that corrupt telemetry data was ingested to the workspace and you want to prevent it from skewing query results. The Delete Data API marks records that meet the specified filter criteria as deleted without physically removing them from storage.

To specify which rows of the table you want to delete, you send one or more filters in the body of the API call.

## When to use Delete-data API vs Purge
1. We recommend using Delete data API instead of Purge for any non-GDPR delete.
2. Purge is intended for GDPR delete only.
3. Delete data API requests are faster than purge API - completes typically within minutes, in rare cases queued for up to 5 days.
4. Just like purge API, delete data API has no impact on cost - customers will be charged for ingestion and retention once the data arrives.
5. Delete data API operates on data in **Analytics plan only**. To delete data from a table with Basic plan, change the plan to Analytics first. Auxiliary plan is not supported.

## Troubleshooting

### Prerequisites
Verify customer has correct permissions and has reviewed considerations:
- Permissions: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/delete-log-data?tabs=powershell#permissions-required
- Considerations: https://learn.microsoft.com/en-us/azure/azure-monitor/logs/delete-log-data?tabs=powershell#considerations

### A. Checking status of delete data request

1. **Activity Logs**: Check workspace activity logs. For a successful request, activity logs show "accepted" then "succeeded" with operation name "Delete data from log analytics workspace."

2. **PowerShell async check**: The PowerShell script example in docs has an async way to check for the operation. For direct API calls, preserve the operation ID from the response and make a GET call:
   - https://learn.microsoft.com/en-us/azure/azure-monitor/logs/delete-log-data?tabs=api#check-delete-data-operations-and-status

3. **Backend telemetry** (Kusto): Requires cluster access per https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480522/

   **All delete data requests by workspace:**
   ```kusto
   let wsid="<enter ws id here>";
   let queryStartTime = ago(); //provide time range
   cluster('oiildc.kusto.windows.net').database('AMBackend_PROD').GetDeleteDataRequestIdByWorkspaceAndQueryStartTime(wsid, queryStartTime)
   ```

   **By workspace and table:**
   ```kusto
   let wsid="<enter ws id here>";
   let queryStartTime = ago();
   let schemaName = "<enter table name here>";
   GetDeleteDataRequestIdByWorkspaceSchemaAndQueryStartTime(wsid, schemaName, queryStartTime)
   ```

   **By workspace and operation ID:**
   ```kusto
   let wsid="<enter ws id here>";
   let deleteRequestId = "<enter operation id here>";
   let queryStartTime = ago();
   cluster('oiildc.kusto.windows.net').database('AMBackend_PROD').GetDeleteDataStatusByWorkspaceRequestIdAndTime(wsid, deleteRequestId, queryStartTime)
   ```

### B. Activity logs status shows failed
Activity log status of delete data API request shows failed when customer does not have the right permission, or the filters used to delete data have syntax issues. The error will be visible in the activity log entry.

## IcM Escalation
After following this TSG and receiving SME/TA/EEE approval, use Product Group Escalation process with '_Azure Log Analytics | Draft_' template.
