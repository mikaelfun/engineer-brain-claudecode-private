---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Missing or incorrect telemetry and performance issues/Missing telemetry types"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FMissing%20or%20incorrect%20telemetry%20and%20performance%20issues%2FMissing%20telemetry%20types"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Missing Specific Telemetry Types

Some telemetry types are collected but others are not.

## Scenario
- Telemetry in general is flowing from the application.
- Only a specific telemetry type is missing (requests, dependencies, traces, etc.).
- This is NOT about missing random entries of a specific type.

## Scoping
- Use [Ingestion tab](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab) to check:
  - [Aggregate by Telemetry Names](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab/Read-Aggregate-by-Telemetry-Names)
  - [Aggregate by SDK Names](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab/Read-Aggregate-by-Parsed-SDK-Names-or-Raw-SDK-Names)
- When did telemetry stop or never flow?
- SDK version in use? Recently changed?
- Determine: hosting environment, language, instrumentation method, classic vs OpenTelemetry, which type is missing.

## Analysis

### Step 1: Check Known Issues (e.g., #65322)

### Step 2: Clarify scenario
[Clarify Missing Telemetry Scenarios](/Application-Insights/How-To/Additional-Reference-Material/General-References/Clarify-Missing-Telemetry-Scenarios)

### Step 3: Run Telemetry Flow Diagnostic Script
Detects DCR Workspace Transforms that can reshape, filter, or drop fields before data reaches the workspace.

### Language-Specific Scenarios

#### .NET Framework
- **Dependencies**: Ensure dependency type is one of [automatically tracked types](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-dependencies#automatically-tracked-dependencies).
- **Request**: Check if app actually accepts HTTP calls.
- **None of the above**: Collect `ApplicationInsights.config` file. Check TelemetryInitializers and TelemetryModules.
- **Client-side**: If PageViews/clientPerf missing, see JavaScript section.

#### .NET Core
- **Dependencies**: Check [auto-tracked dependency types](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-dependencies#automatically-tracked-dependencies).
- **Trace**: Check ILogger logs configuration. [Customize ILogger logs collection](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-faq#how-do-i-customize-ilogger-logs-collection).
- **Auto-instrumentation**: XDT_MicrosoftApplicationInsights_PreemptSdk=true causes custom Track calls to be lost. Check [Detector - App Settings](/Application-Insights/How-To/AppLens/Detector-App-Settings).
- **None of the above**: Collect *.deps.json file from WWWRoot folder.

#### Java 3.X
- Verify if the missing telemetry class is designed to be captured: [OpenTelemetry support table](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=java#automatic-data-collection).

#### Java 2.X
- **Dependencies**: [Monitor dependencies](https://learn.microsoft.com/azure/azure-monitor/app/java-2x-agent).

#### Node.js / JavaScript
- **Client-side**: If PageViews or clientPerf data is missing, check JavaScript SDK configuration.
- Check W3C TraceContext header support.

#### Python
- Check OpenCensus vs OpenTelemetry Distro configuration.
- Ensure only one SDK is active.
