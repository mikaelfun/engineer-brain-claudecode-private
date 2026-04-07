---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Application Insights Diagnostic Logs/Python"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FApplication%20Insights%20Diagnostic%20Logs%2FPython"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Insights Diagnostic Logs — Python

## Scenario

User has instrumented an application with Application Insights either via Auto Instrumentation or Manual Instrumentation with an SDK and is encountering issue with the Application Insights itself logs of Application Insights itself is required.

## Self Diagnostics

### Manual SDK (OpenTelemetry)

- See: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=python#troubleshooting

### Auto Attach via App Services Web application

- TBD

## Additional environment details to collect

There are several other environment and file details you can gather from Python customers using the newer OTEL Python SDK:

- The **requirements.txt** file
- The output from running the console command: **pip freeze**
- The content of /agents/python/PYTHON_IMAGE_VERSION
- The content of the diagnostic logs at /var/log/applicationinsights/applicationinsights-extension.log
- If the customer is using a Django app, include the value of the **DJANGO_SETTINGS_MODULE** environment variable.

These details are helpful for Python SDK escalations.
