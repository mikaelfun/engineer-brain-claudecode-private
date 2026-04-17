---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/Azure Function .Net Core Out of Process/Using AppLens to validate Function Information"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FAzure%20Function%20.Net%20Core%20Out%20of%20Process%2FUsing%20AppLens%20to%20validate%20Function%20Information"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using AppLens to Validate Azure Function Information

AppLens is an extremely helpful tool that provides detailed insights into the hosting environment of Applications. These detectors can be used to review App Service plan details, versioning, framework information and more.

## Key Detectors for Azure Functions + Application Insights

### 1. AppSettings Detector
Search "appsettings" in AppLens to review environment variables:
- **FUNCTIONS_WORKER_RUNTIME**: Shows "Isolated" for out-of-process; absent for in-process
- **FUNCTIONS_EXTENSION_VERSION**: Current extension version
- **APPLICATIONINSIGHTS_CONNECTION_STRING**: Masked but indicates AI is enabled

### 2. Application Insights Auto Instrumentation Detector
Determines if autoinstrumentation was successful or not.
See: [Detector - Application Insights Auto Instrumentation](/Application-Insights/How-To/AppLens/Detector-%2D-Application-Insights-Auto-Instrumentation)

### 3. Host.json & Function(s).json Detector
Search "host.json" to review the detected host.json file. Application Insights specific features are managed/defined in the Host.Json file — this detector provides a quick view without needing to ask the customer.

### 4. Function Executions
Determines how and whether functions executed successfully.
See: [Determine successful executions from Function App](/Application-Insights/How-To/AppLens/Determine-successful-executions-from-Function-App)

## Related Internal References
- [AppLens](/Application-Insights/How-To/AppLens) — Top level tree with all AppLens How-To guides
- [Locate host.json file in a Function App](/Application-Insights/How-To/AppLens/Locate-host.json-file-in-a-Function-App)
- [Finding Application Insights Instrumentation Key](/Application-Insights/How-To/AppLens/Finding-Application-Insights-Instrumentation-Key)

## Public Documentation
- [Host.json reference for Functions](https://learn.microsoft.com/azure/azure-functions/functions-host-json)
