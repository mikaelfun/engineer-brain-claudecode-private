---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Application Insights Diagnostic Logs/Nodejs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FApplication%20Insights%20Diagnostic%20Logs%2FNodejs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Insights Diagnostic Logs — Node.js

## Scenario

User has instrumented an application with Application Insights either via Auto Instrumentation or Manual Instrumentation with an SDK and is encountering issue with the Application Insights itself logs of Application Insights itself is required.

## Self Diagnostics

### Manual SDK

#### Set up self-diagnostics for an application running SDK on App Service

1. See [reference](https://github.com/microsoft/ApplicationInsights-node.js#self-diagnostics)
1. Go to Advanced Tool > Go > SSH.
1. Navigate to your application's files. These are usually found in '/home/site/wwwroot'
1. Access the file where your Application Insights configuration is referenced. You can use a built-in Linux utility like 'nano' for this. Specify the configuration settings for your self-diagnostics. You can use '/tmp' for your destination log directory.
1. Save your changes and restart the App Service. You should now be able to find a file called 'applicationinsights.log' in the '/tmp/' directory.

#### Set up self-diagnostics for an application running SDK locally

1. See [reference](https://github.com/microsoft/ApplicationInsights-node.js#self-diagnostics)
1. Go to your local application and open it using the IDE of your choice.
1. Navigate to your application's files and find the file where your Application Insights configuration is specified. In this example, it is on app.js.
1. Specify the configuration settings for your self-diagnostics and a folder directory in your system.
1. Save changes, start your app, and confirm your self-diagnostics appear.

### OpenTelemetry

For OpenTelemetry, see: https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/opentelemetry-troubleshooting-nodejs

### Auto Attach via App Services Web application

- See: [Monitor Node.js services with Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs#how-can-i-configure-the-desired-log-level)
