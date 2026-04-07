---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure Communication Services"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Boundaries/Azure%20Communication%20Services"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support Boundary: Azure Communication Services + App Insights

## Overview
Azure Communication Services are cloud-based services with REST APIs and client library SDKs for integrating communication into applications.

## Integration
- Uses Azure OpenTelemetry Exporter to funnel SDK telemetry to Application Insights
- [Quickstart: Using Azure OpenTelemetry Exporter](https://learn.microsoft.com/azure/communication-services/quickstarts/telemetry-application-insights)
  - [Funneling telemetry data to Application Insights](https://learn.microsoft.com/azure/communication-services/quickstarts/telemetry-application-insights?pivots=programming-language-csharp#funneling-telemetry-data-to-application-insights)
  - [View the telemetry data in Application Insights](https://learn.microsoft.com/azure/communication-services/quickstarts/telemetry-application-insights?pivots=programming-language-csharp#view-the-telemetry-data-in-application-insights)

## SAP Routing
- `Azure/Communication Services/Integrating with other Azure Services/Not listed above`

## Data Collection
- Precise ask to the team
- Application Insights resource URI
