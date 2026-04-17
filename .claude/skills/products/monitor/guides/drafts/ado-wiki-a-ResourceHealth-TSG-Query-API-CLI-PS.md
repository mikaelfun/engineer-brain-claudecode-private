---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Resource Health/Troubleshooting Guides/Troubleshooting querying of Resource Health availability statuses via API CLI PowerShell or SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FResource%20Health%2FTroubleshooting%20Guides%2FTroubleshooting%20querying%20of%20Resource%20Health%20availability%20statuses%20via%20API%20CLI%20PowerShell%20or%20SDK"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This troubleshooting guide applies to querying [Azure Resource Health](https://docs.microsoft.com/azure/service-health/resource-health-overview) availability statuses using REST API, Azure CLI, Azure PowerShell or other Microsoft supported Azure SDK.

# Support Boundaries
---
:::template /.templates/SupportBoundaries-ResourceAndServiceHealth.md
:::

# Information you will need
---
- The Azure subscription id for which the customer is attempting to query resource health availability statuses.

- A date and timestamp of when the attempt to query resource health availability statuses occurred.

- The verbatim of any error message(s) that were returned when attempting to query resource health statuses.

::: template /.templates/TSG-KnownIssues-ResourceHealth.md
:::

# Troubleshooting
---
1. **Review verbatim error message(s) or screenshots of errors provided for clues**

   If an error occurred, the underlying REST API will provide an error in the HTTP response and if performing the action via Azure PowerShell or Azure CLI those tools will often attempt to interpret the failure and provide a meaningful error message.  Examine any such messages for indications of why the attempted action failed (for example user doesn't have permissions).

1. **Trace the request submitted to Azure Resource Manager (ARM).**

   [How to trace ARM requests to Azure Monitor resource providers in Kusto](/Azure-Monitor/How%2DTo/Azure-Resource-Manager-\(ARM\)/How-to-trace-ARM-requests-to-Azure-Monitor-resource-providers-in-Kusto)

   Append the following line to the query against HttpIncomingRequests to filter the results to only include operations related to resource health availability statuses.

   `| where targetResourceType =~ "availabilitystatuses"`

1. **Capture the HTTP request and HTTP response details.**

   Regardless of the programmatic language or tool that the customer is using to query the resource health availability statuses, everything ultimately ends up as a request being made to the [Azure Resource Health Azure REST API](https://learn.microsoft.com/rest/api/resourcehealth/2022-05-01/availability-statuses/list?tabs=HTTP).

:::template /.templates/TSG-CaptureDebug-SingleIndent.md
:::

## Getting Help
:::template /.templates/TSG-GettingHelp-ResourceHealth.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::

:::template /.templates/TSG-ProductTeamEscalation-ServiceAndResourceHealthAddOn.md
:::

