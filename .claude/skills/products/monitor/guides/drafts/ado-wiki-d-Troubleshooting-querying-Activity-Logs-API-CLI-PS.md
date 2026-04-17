---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Activity Logs/Troubleshooting Guides/Troubleshooting querying of Activity Logs with API CLI PowerShell or SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Activity%20Logs/Troubleshooting%20Guides/Troubleshooting%20querying%20of%20Activity%20Logs%20with%20API%20CLI%20PowerShell%20or%20SDK"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to querying [Azure Activity Logs](https://docs.microsoft.com/azure/azure-monitor/essentials/activity-log) using REST API, Azure CLI, Azure PowerShell or other Microsoft supported Azure SDK.

# Support Boundaries
---
- [Support Boundaries - Activity Logs](/Monitoring-Essentials/Activity-Logs#support-boundaries)

# Information you will need
---
- The Azure subscription id for which the customer is attempting to query activity logs.

- A date and timestamp of when the attempt to query activity logs occurred.

- The verbatim of any error message(s) that were returned when attempting to query activity logs.

::: template /.templates/TSG-KnownIssues-ActivityLogs.md
:::

- #16826

# Troubleshooting
---
1. **Review verbatim error message(s) or screenshots of errors provided for clues**

   If an error occurred, the underlying REST API will provide an error in the HTTP response and if performing the action via Azure PowerShell or Azure CLI those tools will often attempt to interpret the failure and provide a meaningful error message.  Examine any such messages for indications of why the attempted action failed (for example user doesn't have permissions).

1. **Trace the request submitted to Azure Resource Manager (ARM).**

   [How to trace ARM requests to Azure Monitor resource providers in Kusto](/Azure-Monitor/How%2DTo/Azure-Resource-Manager-\(ARM\)/How-to-trace-ARM-requests-to-Azure-Monitor-resource-providers-in-Kusto)

   Append the following line to the query against HttpIncomingRequests to filter the results to only include operations related to activity logs.

   `| where targetResourceType =~ "eventtypes/values"`

1. **Capture the HTTP request and HTTP response details.**

   Regardless of the programmatic language or tool that the customer is using to query the metrics, everything ultimately ends up as a request being made to the [Azure Monitor Activity Logs Azure REST API](https://docs.microsoft.com/rest/api/monitor/activity-logs).

:::template /.templates/TSG-CaptureDebug-SingleIndent.md
:::

## Getting Help
:::template /.templates/TSG-GettingHelp-ActivityLogs.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
