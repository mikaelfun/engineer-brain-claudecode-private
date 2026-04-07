---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Activity Logs/Troubleshooting Guides/Troubleshooting configuring export of activity logs with API CLI PowerShell or SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Activity%20Logs/Troubleshooting%20Guides/Troubleshooting%20configuring%20export%20of%20activity%20logs%20with%20API%20CLI%20PowerShell%20or%20SDK"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to configuring the legacy feature of Activity Log Export known as [Log profiles](https://docs.microsoft.com/azure/azure-monitor/essentials/activity-log#log-profiles) via Azure REST API, Azure CLI, Azure PowerShell or other Microsoft supported Azure SDK.

# Support Boundaries
---
- [Support Boundaries - Activity Logs](/Monitoring-Essentials/Activity-Logs#support-boundaries)

# Information you will need
---
- The Azure subscription id for which the customer wants to export activity logs.

- A date and timestamp of when the attempt to configure the export of activity logs occurred.

- The verbatim of any error message(s) that were returned when attempting to create or update the configuration.

::: template /.templates/TSG-KnownIssues-ActivityLogs.md
:::

- #10976
- #10977

# Troubleshooting
---
1. **Confirm that the customer is really having issues with export of activity logs (aka log profiles).**

   This is a legacy feature but customers may select this even though they are attempting to configure a diagnostic setting against the Azure subscription.

   If they are using diagnostic settings rather than log profiles, stop following this article as it does not apply.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">
   
   **Important**
   
   Since this is a legacy feature and is due to be deprecated at some point in the future, you should recommend to your customer to use [diagnostic settings](https://docs.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings) rather than the export activity logs feature.  If they do agree to switch to using diagnostic settings, ensure that any log profiles are removed so that the customer does not export duplicate data.
   </div>

1. **Review verbatim error message(s) or screenshots of errors provided for clues**

   If an error occurred, the underlying REST API will provide an error in the HTTP response and if performing the action via Azure PowerShell or Azure CLI those tools will often attempt to interpret the failure and provide a meaningful error message.  Examine any such messages for indications of why the attempted action failed (for example user doesn't have permissions).

1. **Check activity logs for events related to log profile operations.**

   If any write (create or update) or delete operations against a log profile were attempted, an event will be recorded in the activity log.

   [How to get Activity Log events from Azure Support Center](/Monitoring-Essentials/Activity-Logs/How%2DTo/How-to-get-Activity-Log-events-from-Azure-Support-Center)

   After retrieving activity log events based on the date and timestamp of when the attempt to configure the export of activity logs occurred, filter the results by searching for **OperationName** contains **microsoft.insights/logprofiles**.

1. **Trace the request submitted to Azure Resource Manager (ARM).**

   [How to trace ARM requests to Azure Monitor resource providers in Kusto](/Azure-Monitor/How%2DTo/Azure-Resource-Manager-\(ARM\)/How-to-trace-ARM-requests-to-Azure-Monitor-resource-providers-in-Kusto)

   Append the following line to the query against HttpIncomingRequests to filter the results to only include operations related to log profiles.

   `| where operationName contains "subscriptions/providers/microsoft.insights/logprofiles"`

1. **Capture the HTTP request and HTTP response details.**

   Regardless of the programmatic language or tool that the customer is using to configure the log profile, everything ultimately ends up as a request being made to the [Log Profiles Azure REST API](https://docs.microsoft.com/rest/api/monitor/log-profiles).

   If the customer is using Azure PowerShell or Azure CLI, capture debug tracing which will include the HTTP request and response.

   [How to capture debug tracing for Azure PowerShell](/Azure-Monitor/How%2DTo/SDKs/How-to-capture-debug-tracing-for-Azure-PowerShell)
   [How to capture debug tracing for Azure CLI](/Azure-Monitor/How%2DTo/SDKs/How-to-capture-debug-tracing-for-Azure-CLI)

   If the customer is directly connecting to the Azure REST API or is using an otherwise supported Azure SDK, have the customer provide you with the full HTTP request and HTTP response.

## Getting Help
:::template /.templates/TSG-GettingHelp-ActivityLogs.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
