---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure Container Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Boundaries/Azure%20Container%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support Boundary: Azure Container Apps + App Insights

## Overview
Azure Container Apps (ACA) is a PaaS offering for hosting serverless containers and microservices in Azure.

## Critical: Managed OpenTelemetry Agent NOT Supported by App Insights
- ACA has a managed OpenTelemetry agent currently [in Preview](https://learn.microsoft.com/azure/container-apps/opentelemetry-agents)
- This implementation was developed by the ACA team using an **unsupported community version** of OpenTelemetry
- **The Application Insights team does NOT support this integration**
- App Insights SDK team is collaborating with ACA team on a supported implementation (no ETA)

## Supported Integration
- APIs hosted on ACA can be **manually instrumented** with supported Application Insights SDKs
- Documentation: [Container Apps observability](https://learn.microsoft.com/azure/container-apps/observability)

## SAP Routing
- `Azure/Container Apps/Monitoring resources`
- App Services OSS team owns Container Apps support

## Data Collection
- Precise ask to the team
- Container app resource URI
- Names of specific APIs hosted within Container Apps (if applicable)
- Application Insights resource URI
