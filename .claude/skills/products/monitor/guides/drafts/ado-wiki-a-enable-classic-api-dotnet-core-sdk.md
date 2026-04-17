---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/ASPNet Core/Enable the classic API .NET Core SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FASPNet%20Core%2FEnable%20the%20classic%20API%20.NET%20Core%20SDK"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enable the classic API .NET Core SDK

## Overview

Guide for enabling manual instrumentation for a .NET Core web application with Application Insights using the classic API.

## With Visual Studio

1. Right-click project name → "Configure Application Insights"
2. Select "Azure Application Insights"
3. Choose existing or create new Application Insights resource
4. Leave default settings → click "Next" → "Finish"

### Changes Made

- `Program.cs`: `builder.Services.AddApplicationInsightsTelemetry(...)` added
- `appsettings.json`: `APPLICATIONINSIGHTS_CONNECTION_STRING` reference added
- NuGet packages: `Microsoft.ApplicationInsights` + `Microsoft.ApplicationInsights.AspNetCore`

## Without Visual Studio

1. Install NuGet: `NuGet\Install-Package Microsoft.ApplicationInsights.AspNetCore -Version 2.22.0`
2. In `Program.cs`, before `builder.Build()`:
   ```csharp
   builder.Services.AddApplicationInsightsTelemetry(new Microsoft.ApplicationInsights.AspNetCore.Extensions.ApplicationInsightsServiceOptions
   {
       ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]
   });
   ```
3. Set connection string in `appsettings.json` (recommended over hardcoding)

## Public Documentation

- [Application Insights for ASP.NET Core applications](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-core)
