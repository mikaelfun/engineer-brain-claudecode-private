---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Application Insights Diagnostic Logs/dot-Net Core"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FApplication%20Insights%20Diagnostic%20Logs%2Fdot-Net%20Core"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

User has instrumented an application with Application Insights either via Auto Instrumentation or Manual Instrumentation with an SDK and is encountering issue with the Application Insights itself logs of Application Insights itself is required.

## Self Diagnostics

- Starting with classic Application Insights SDK version 2.18 collecting diagnostics from the SDK become a lot easier.
- .Net OpenTelemetry Exporter supports this same functionality in the same fashion.

Works for the following environments:
- Running in Azure App App Services - Web app
- Cloud Service
- Azure VM running IIS
- Running in on-premises machine

This functionality is SDK version dependent, so consider the following:
- Azure Monitor Application Insights Agent for on-premises servers (aka Status Monitor V2) depends on SDK 2.18 starting with v.2.0 Beta, meaning self-diagnostics works with v2.0 Beta and later.
- VMs and VMSS with the extension currently does not work but coming Soon

NOTES for App Service Web Apps:
- the ApplicationInsightsDiagnostics.json needs to be placed in the `<drive>:\home\site\wwwroot` folder
- the LogDirectory should be set to `<drive>:\home` for easy; but other locations are valid assuming sufficient access
- the FileSize may need to be adjusted to accommodate capturing the necessary logs, the logs are circular and will overwrite existing data when the size is reached
- a DRIVE is not noted above; this is because not all App Service Web Apps reside on the same drive, some can be on C and some might be on D. To know where it is go to the default KUDU page.

Official links:
- Classic Application Insight SDKs: https://github.com/microsoft/ApplicationInsights-dotnet/tree/main/troubleshooting/ETW#self-diagnostics
- [How to collect self-diagnostic logs for Application Insights SDKs](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/enable-self-diagnostics)
- OpenTelemetry: https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry#troubleshooting

### Self Diagnostics for App Services Web Apps on Windows

1. Go to Azure Portal and the App Service Web App running SDK version 2.18 or later
2. Go to Advanced Tools choose Go to start Kudu
3. Go to Debug Console and choose CMD
4. Navigate to `D:\Home\Site\wwwroot`
5. Use the "+" icon at the top of the screen to create a new file in wwwroot folder
6. Name the new file, "ApplicationInsightsDiagnostics.json"
7. Edit the file and add the following for contents:
   ```json
   {
     "LogDirectory": "D:\\home\\site\\wwwroot",
     "FileSize": 5120,
     "LogLevel": "Verbose"
   }
   ```
8. Save the file
9. After 10 seconds a new file will show up in the wwwroot folder, i.e, "20220307-193542.w3wp.exe.7692.log"
10. The file will NOT grow larger than the 5MB it is configured, it is circular thus data may be overwritten
11. Rename file to "ApplicationInsightsDiagnostics.bak" and after 10 seconds the logging will stop

### Self Diagnostics for App Services Web Apps on Linux

1. On your local machine create file by the name of "ApplicationInsightsDiagnostics.json"
2. Edit the file and add the following for contents:
   ```json
   {
     "LogDirectory": ".",
     "FileSize": 5120,
     "LogLevel": "Verbose"
   }
   ```
3. Save the file
4. Go to Azure Portal and the App Service Web App running SDK version 2.18 or later
5. Go to Advanced Tools choose Go to start Kudu
6. When the browser session starts up add "/newui" to the end of the url
7. The url should look like `https://appnamehere.scm.azurewebsites.net/newui`
8. Choose File Manager
9. Click on the "Site" folder then "wwwroot" folder
10. Drag and drop the json file into the list of files
11. After 10 seconds a new log file will appear
12. Rename file to "ApplicationInsightsDiagnostics.bak" and after 10 seconds the logging will stop

## Profiler traces on App Services

- See: Collect Profiler traces on App Services environments

## PerfView

Works for the following environments:
- Cloud Service
- Azure VM running IIS
- Running in on-premises machine

Works for both Auto and Manual instrumentation methods. The easiest method when the application is running on accessible environment like on-premises server or Azure VM. Requires customer to put PerfView tool on the system and execute the command to generate an ETW file.
- https://docs.microsoft.com/azure/azure-monitor/app/asp-net-troubleshoot-no-data#PerfView

## SDK Logging

Works for the following environments:
- Running in Azure App App Services - Web app
- Cloud Service
- Azure VM running IIS
- Running in on-premises machine

This method requires Manual instrumentation (SDK). See Self-Diagnostics above as a preferred approach.
This method requires implementation and application restarts.
- If deploying to App Service Web app: set LogFilePath to `D:\\HOME\\SDKLOGS` as C: is not accessible.
- https://docs.microsoft.com/azure/azure-monitor/app/asp-net-troubleshoot-no-data#net-core

The user should disable the logging after the necessary data is collected to not cause issues by generating a large amount of files on the drive.

## Data Collection — App Service Web App

1. Go to the App Service Web App in the Azure Portal
2. Scroll down → "Development Tools" → "Advanced Tools" → select
3. Click "Go ->" to launch Kudu in new browser session
4. Choose CMD from the Debug Console menu
5. Navigate to `D:\HOME` folder (as set in ApplicationInsights.config)
6. Navigate into SDKLogs and download the log file(s)

NOTES:
- The folder does not need to exist, it will be created if necessary.
- If folder/files not generated, double check NuGet packages are same version.
- Download PerfView: https://github.com/Microsoft/perfview/blob/master/documentation/Downloading.md
