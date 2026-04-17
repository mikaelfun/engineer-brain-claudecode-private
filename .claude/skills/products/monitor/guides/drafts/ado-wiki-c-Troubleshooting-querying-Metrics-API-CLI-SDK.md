---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Metrics/Troubleshooting Guides/Troubleshooting querying of Azure Monitor Metrics with API CLI PowerShell or SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FMetrics%2FTroubleshooting%20Guides%2FTroubleshooting%20querying%20of%20Azure%20Monitor%20Metrics%20with%20API%20CLI%20PowerShell%20or%20SDK"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to querying [Azure Monitor Metrics](https://docs.microsoft.com/azure/azure-monitor/essentials/data-platform-metrics) using REST API, Azure CLI, Azure PowerShell or other Microsoft supported Azure SDK.

# Support Boundaries
---
See article [Support Boundaries](https://aka.ms/azmon/supportboundaries?anchor=metrics).

# Information you will need
---
- The Azure subscription id for which the customer is attempting to query metrics.

- A date and timestamp of when the attempt to query metrics occurred.

- The verbatim of any error message(s) that were returned when attempting to query metrics.

::: template /.templates/TSG-KnownIssues-Metrics.md
:::

# Permissions
---
Please check if the user has required Monitoring reader permissions. https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2100697/How-to-identify-RBAC-filtering-(permissions-issues)-with-Metrics


# Troubleshooting
---
1. **Review verbatim error message(s) or screenshots of errors provided for clues**

   If an error occurred, the underlying REST API will provide an error in the HTTP response and if performing the action via Azure PowerShell or Azure CLI those tools will often attempt to interpret the failure and provide a meaningful error message.  Examine any such messages for indications of why the attempted action failed (for example user doesn't have permissions).

1. **Trace the request submitted to Azure Resource Manager (ARM).**

   [How to trace ARM requests to Azure Monitor resource providers in Kusto](/Azure-Monitor/How%2DTo/Azure-Resource-Manager-\(ARM\)/How-to-trace-ARM-requests-to-Azure-Monitor-resource-providers-in-Kusto)

   Append the following line to the query against HttpIncomingRequests to filter the results to only include operations related to metrics.

   `| where targetResourceType =~ "metrics"`

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#efd9fd">
   
   **Note**
   
   Skip this step if the customer is using the new [Metrics Data Plane REST API](https://learn.microsoft.com/rest/api/monitor/metrics-data-plane) as those requests do not come through ARM.
   </div>

1. **Capture the HTTP request and HTTP response details.**

   Regardless of the programmatic language or tool that the customer is using to query the metrics, everything ultimately ends up as a request being made to the [Azure Monitor Metrics Azure REST API](https://docs.microsoft.com/rest/api/monitor/metrics).

:::template /.templates/TSG-CaptureDebug-SingleIndent.md
:::

## Getting Help
:::template /.templates/TSG-GettingHelp-Metrics.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
