---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Profiler & Snapshot Debugger/Profiler for Container Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Profiler%20%26%20Snapshot%20Debugger/Profiler%20for%20Container%20Apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Context

There are some specific steps that need to be taken in consideration when enabling Profiler for self-contained applications as well as ASP.NET Core Applications running in a container.

# Steps

   1. Add the Microsoft.ApplicationInsights.Profiler.AspNetCore package to your application
      
   2. Enable Profiler by registering it into the Service Collection in Program.cs:
      ```
      builder.Services.AddApplicationInsightsTelemetry(); // Register Application Insights
      builder.Services.AddServiceProfiler();              // Register Profiler
      ```
   3. The above does not rely on Diagnostics service extension so **no** need to add the following to the Application Settings:
      ```
      APPINSIGHTS_PROFILERFEATURE_VERSION
      DiagnosticServices_EXTENSION_VERSION
      ```
   4. The above is using the Profiler SDK and it does not rely on the WebJob. 
   5. The above statement means no logs are generated for Profiler, in order to get logs from Profiler turn on EventPipe profiler: https://github.com/microsoft/ApplicationInsights-Profiler-AspNetCore/tree/main/examples/EnableServiceProfilerForContainerAppNet6
   6. Once EventPipe profiler is on, any logs will be emitted via ILogger


# Enable Profiler Logging

Once the EventPipe Profiler is on, it will emit logging using ILogger into whatever logging provider is used. Informational logging should show key events like profiler starting, running, or errors. If you want to turn on Debug or Trace level of logging, follow the document here:

https://github.com/microsoft/ApplicationInsights-Profiler-AspNetCore/blob/main/Configurations.md 

Specifically, for Windows Apps deployed to Azure with EventPipe Profiler on, to check the log for the app service, follow these steps:

 1. Turn on App Service Logs

2. Query the logs — you would see messages about Profiler working or errors, and troubleshoot from there.
