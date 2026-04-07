---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Status Page - App Services Web Apps and Application Insights/Net (Core) Running on Linux Web App"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FStatus%20Page%20-%20App%20Services%20Web%20Apps%20and%20Application%20Insights%2FNet%20(Core)%20Running%20on%20Linux%20Web%20App"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Status Page — .NET (Core) Running on Linux Web App

## Purpose

App Services offers Web Apps running on Linux. Starting November 2021, .NET 6 is GA and offers auto-instrumentation (codeless) with Application Insights.

A key feature of support in auto-instrumentation on Windows running in Azure Web Apps is the Advanced Tools (Kudu) status page. This now exists for .NET Core running on Linux. There is also a corresponding status file. If the status page shows contrary to the user experience, accessing the underlying status file might reveal additional details.

## Method — Accessing the Status JSON File

1. Hit the web app first to make sure it is running
2. Go to Azure Portal → App Service Linux Web App
3. Go to Advanced Tools → Go
4. When the page loads, choose "BASH" (provides better experience)
5. Type `ls` to see contents
6. Navigate to: `home/LogFiles/ApplicationInsights/status`
   - Use: `cd LogFiles`
7. Type `ls` to see contents of the folder
8. Use `cat` to examine status_*.json files, e.g.: `cat status_4ccbc6e40ed5_24_1.json`
9. Read through all lines looking for: **AppAlreadyInstrumented**

**NOTE:** These two scenarios are NOT applicable to .NET Core:
- AppContainsDiagnosticSourceAssembly
- AppContainsAspNetTelemetryCorrelationAssembly

## Key Points — Status JSON Structure

```json
{
  "AppType": ".NETCoreApp,Version=v6.0",
  "MachineName": "4ccbc6e40ed5",
  "PID": "24",
  "AppDomainId": "1",
  "AppDomainName": "dotnet-monitor",
  "InstrumentationEngineLoaded": false,
  "InstrumentationEngineExtensionLoaded": false,
  "HostingStartupBootstrapperLoaded": true,
  "AppAlreadyInstrumented": false,
  "AppDiagnosticSourceAssembly": "System.Diagnostics.DiagnosticSource, Version=6.0.0.0, ...",
  "AiHostingStartupLoaded": true,
  "IKeyExists": true,
  "IKey": "999999999-9999-9999-9999-999999999999",
  "ConnectionString": "InstrumentationKey=...;IngestionEndpoint=https://centralus-2.in.applicationinsights.azure.com/",
  "AutoInstrumentationStatus": true
}
```

If **AppAlreadyInstrumented** is `true`, the application is already instrumented with the SDK. Options:
- **Disable auto-instrumentation**: Turn off Application Insights in the App Service Web App experience
- **Use PreemptSdk**: Stops the flow of any custom telemetry the SDK was configured to use and yields to auto-instrumentation

For more details: [Application Monitoring for Azure App Service and ASP.NET Core](https://docs.microsoft.com/azure/azure-monitor/app/azure-web-apps-net-core?tabs=Linux%2Cwindows)
