---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Azure AI Search"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Boundaries%2FAzure%20AI%20Search"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AI Search - Application Insights Support Boundaries

## Overview

Azure AI Search (formerly "Azure Cognitive Search") provides secure information retrieval at scale over user-owned content in traditional and generative AI search applications.
See: https://learn.microsoft.com/azure/search/search-what-is-azure-search

## General Considerations

- Before engaging an external team, keep the following in consideration: [Guidelines for Application Insights case management](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1393084/Support-Boundaries-(new))

## Specifics on Integration

- See: https://learn.microsoft.com/azure/search/search-traffic-analytics#log-search-events
- Azure AI Search currently does **not** offer an autoinstrumentation offering, contrary to other resource providers in Azure such as Azure Functions and API Management.
- The Azure AI Search public documentation does show how to instrument clients with Application Insights making calls to Azure AI Search and enrich this telemetry information collected. See: https://learn.microsoft.com/azure/azure-monitor/app/asp-net
- Questions around available properties to enrich telemetry (SearchId, ClickedDocId, IndexName, etc.) should be addressed by the **Azure AI Search team**.
- Questions around the usage and instantiation of Application Insights code (.NET or JavaScript) need to be answered by the **Azure Monitoring team**.

## Before External Engagement

- https://learn.microsoft.com/azure/azure-monitor/app/api-custom-events-metrics
- https://learn.microsoft.com/azure/search/search-traffic-analytics#log-search-events

## Data Collection

If we need to engage this team:
- Precise ask to this team
- If applicable, resource URIs of the Azure AI Search service involved with Application Insights
- Application Insights resource URI

## Suggested SAP for Collaboration/Transfer

- Azure/Azure AI Search/Development/Issue with the .Net SDK
- Azure/Azure AI Search/Development/Issue with the JavaScript or Typescript SDK
