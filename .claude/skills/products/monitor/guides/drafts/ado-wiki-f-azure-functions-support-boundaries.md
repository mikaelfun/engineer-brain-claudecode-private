---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure Functions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Boundaries/Azure%20Functions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Functions — Support Boundaries (Application Insights)

## Overview

Azure Functions is a serverless solution that allows you to write less code, maintain less infrastructure, and save on costs.
See: https://learn.microsoft.com/azure/azure-functions/functions-overview?pivots=programming-language-csharp

## General Considerations

- **Azure Functions owns the support of Application Insights integration** — weight of support is with the Azure Functions team.
  - **Azure Monitor**: responsible for ingestion and Application Insights portal experience issues.
  - **Azure Functions**: responsible for enabling, configuring, and connectivity out to ingestion.
- Before engaging an external team, follow [Guidelines for Application Insights case management](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1393084/Support-Boundaries-(new)?anchor=guidelines-for-app-insight-case-management%3A)
- Azure Functions CSS Wiki: [Monitoring resources, using metrics, logs and alerts - Overview](https://supportability.visualstudio.com/AzureAppService/_wiki/wikis/AzureAppService/488444/Monitoring-resources-using-metrics-logs-and-alerts)

## Integration Specifics

- Azure Functions team owns the [Microsoft.Azure.WebJobs.Logging.ApplicationInsights](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Logging.ApplicationInsights) NuGet package.
- Azure Function engineers should review:
  - [Azure Functions logging](https://supportability.visualstudio.com/AzureAppService/_wiki/wikis/AzureAppService/595349/Application-Insights?anchor=troubleshooting-missing-logs/metrics) around sending data to ingestion service
  - [Azure Functions wiki content](https://supportability.visualstudio.com/AzureAppService/_wiki/wikis/AzureAppService/595349/Application-Insights)

### Identifying Auto-instrumented Azure Functions

The `sdkVersion` field in telemetry indicates whether the issue is related to auto-instrumented Azure Functions. Check this field in the telemetry data to determine the instrumentation method.

## Before External Engagement

- Useful information for common issues: https://docs.microsoft.com/azure/azure-functions/functions-host-json#applicationinsights

## Data Collection for External Engagement

- Precise ask to the team
- Resource URIs of the product/service involved with Application Insights (if applicable)
- Application Insights resource URI

## Suggested SAP for Collaboration/Transfer

- `Azure/Function App/Monitoring resources, using metrics, logs, and alerts/Application Insights logs are missing or incorrect` — routes to Azure Functions team
- `Azure/Function App/Monitoring resources, using metrics, logs, and alerts/Custom telemetry with Application Insights SDK` — routes to our team by default; customer picks App Insights resource + support topic first

---
Created by: nzamoralopez (June 2024)
Last Modified by: matthofa (Feb 09, 2026)
