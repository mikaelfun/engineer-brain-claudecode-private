---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Break down SDKs used and their versions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FGeneral%20References%2FBreak%20down%20SDKs%20used%20and%20their%20versions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

Understanding Application Insights SDK versions. Telemetry sent using Classic Application Insights SDKs or OpenTelemetry Distros all provide an sdk version that can be challenging to interpret.

# SDK Version References

## OpenTelemetry
- [Telemetry-Collection-Spec - sdk_version_name.md](https://github.com/aep-health-and-standards/Telemetry-Collection-Spec/blob/main/ApplicationInsights/sdk_version_name.md)

## Classic Application Insights
- [ApplicationInsights-dotnet - versions_and_names.md](https://github.com/microsoft/ApplicationInsights-dotnet/blob/develop/docs/versions_and_names.md)

### SDK Names

| Name | Description |
| --- | --- |
| gsm | Availability |
| java 2.x | Java SDK (legacy) |
| java 3.x | Java agent |
| javascript | JavaScript SDK |
| r | Legacy Status Monitor V1 (deprecated) |
| rdddsaz | Remote dependency telemetry from Azure SDK Diagnostic Source callbacks |
| smr | Status Monitor V2 |
| vmr | Auto-instrumentation for Azure VMs running .NET/.NET Core |

### Codeless Attach Prefixes

| SDK Name | Prefix | Description |
|-----------|:------:|-------------------------------------|
| python-otel | awi_ | Python codeless attach on App Services for Windows |
| python-otel | ali_ | Python codeless attach on App Services for Linux |
| java | awr_ | Java codeless attach on App Services for Windows |
| java | alr_ | Java codeless attach on App Services for Linux |
| java | kwr_ | Java codeless attach on AKS for Windows |
| java | klr_ | Java codeless attach on AKS for Linux |
| java | fwr_ | Java codeless attach on Azure Functions for Windows |
| java | flr_ | Java codeless attach on Azure Functions for Linux |
| java | swr_ | Java codeless attach on Spring Cloud for Windows |
| java | slr_ | Java codeless attach on Spring Cloud for Linux |
