---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/ASPNet Core/Visual Studio Exploration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FASPNet%20Core%2FVisual%20Studio%20Exploration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Visual Studio Application Insights Exploration

## Overview

Visual Studio IDE offers integrated features for viewing Application Insights telemetry during local development and debugging.

## Application Insights Search Experience

Similar to Transaction Search in Azure portal. View telemetry from local debug sessions or directly from Application Insights resource.

### Prerequisites

- Web app instrumented with manual SDK
- Application Insights shown as "Connected" service dependency (right-click project > Publish > Connected Services)

### If Not Connected

Click green plus icon in Connected Services > select Application Insights > choose existing resource.

### Usage

1. Start app in debug mode with IISExpress
2. Click "Application Insights" button in VS toolbar (or use Search: "Application Insights Search")
3. Browse telemetry items, click to expand details
4. Note: experience shows when items filtered by sampling

## Output Experience

Visual Studio Output window shows Application Insights telemetry in real-time during debug sessions.

## Public Documentation

- [Application Insights for ASP.NET Core](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-core)
