# Monitor Application Insights Profiler 与 Snapshot Debugger

**Entries**: 18 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | No SQL Dependency telemetry in Application Insights for .NET Framework 4.x ap... | Application Insights SDK only byte-code instruments System.Data.SqlClient cla... | Option 1: Disable the Profiler — SDK falls back to EventSource which supports... | 8.5 | ADO Wiki |
| 2 | Application Insights Profiler not collecting traces on Azure VM/VMSS after en... | The Profiler installer detects an existing Standard Collector Service (VSStan... | Uninstall Visual Studio or Visual Studio Remote Debugging Tools from the VM. ... | 8.5 | ADO Wiki |
| 3 | Application Insights Profiler emits '401 Unauthorized' exception in telemetry... | Application Insights component is associated with AMPLS (Azure Monitor Privat... | Configure Bring Your Own Storage (BYOS) for Application Insights Profiler. BY... | 8.5 | ADO Wiki |
| 4 | 'Profile Traces' button in Azure Portal is disabled/grayed out even though Ap... | Profiler captured a trace session and logged a request ID via ServiceProfiler... | Run KQL in ASC Customer Query Data tab to verify: let RQID=(){union traces, c... | 8.5 | ADO Wiki |
| 5 | Application Insights Profiler telemetry shows trace message 'Upload trace was... | Profiler session successfully started and created an ETL file, but no complet... | Ensure the application is receiving HTTP requests during the Profiler samplin... | 8.5 | ADO Wiki |
| 6 | Profiler traces not collected on Azure App Service; navigating to https://{si... | Profiler webjob (ApplicationInsightsProfiler#) is not enabled or running on t... | From App Service resource menu: select 'Application Insights' → choose the ap... | 8.5 | ADO Wiki |
| 7 | Application Insights Profiler shows unhealthy status on Kudu /DiagnosticServi... | Profiler webjob has encountered errors and is in an unhealthy state, was disa... | 1) Check AppLens → Web Job detectors for profiler webjob status. 2) Run KQL i... | 8.5 | ADO Wiki |
| 8 | App Service Profiler WebJob log shows 'Reached maximum allowed output lines f... | The App Service WebJob output log has a maximum line limit; once reached, sub... | Enable application diagnostics on the Web App via the portal, or restart the ... | 8.5 | ADO Wiki |
| 9 | DiagnosticsPlugin log on Azure VM or Cloud Service shows 'Skipping Profiler b... | The Azure Diagnostics profiler sink is not configured in the deployment confi... | Configure the profiler sink using Azure Resource Explorer: https://docs.micro... | 8.5 | ADO Wiki |
| 10 | No '[Profiler]' entries found in DiagnosticsPlugin log for Azure VM or Cloud ... | Profiler has not been installed or configured on the machine; this typically ... | Follow VM onboarding: https://docs.microsoft.com/azure/azure-monitor/app/prof... | 8.5 | ADO Wiki |
| 11 | Clicking the 'collect snapshots' button in Application Insights Failures expe... | Bug: Application Insights Snapshot Debugger RBAC role does not work when assi... | Explicitly grant the 'Application Insights Snapshot Debugger' RBAC role direc... | 8.5 | ADO Wiki |
| 12 | 'Profile Now' button in Application Insights Profiler fails instantly with 'P... | An internal configuration change broke Private Link IP address resolution for... | Workaround: Enable public network access for 'Query' in the App Insights reso... | 8.5 | ADO Wiki |
| 13 | Transaction Search in Application Insights shows only limited telemetry types... | The application's Application Insights SDK is not sending telemetry. The limi... | 1) Verify the SDK versions using ASC Ingestion tab (Aggregate by Raw SDK Name... | 8.5 | ADO Wiki |
| 14 | Application Insights Profiler generates COMException 'Exception from HRESULT:... | Antares platform v102 changed concurrent profiling session support - only one... | No action required - exceptions do not impact application performance. A Prof... | 8.5 | ADO Wiki |
| 15 | Application Insights Profiler generates exceptions: COMException "Exception f... | Antares platform version 102 changed concurrent profiling session support - o... | Known issue - Profiler agent update scheduled to handle these exceptions inte... | 8.5 | ADO Wiki |
| 16 | Application Insights Profiler not available or not functioning on Linux-based... | App Service Profiler feature is only supported on Windows-based web apps. Lin... | For Linux-based App Service apps, enable Profiler using the NuGet package Mic... | 8.5 | ADO Wiki |
| 17 | Application Insights Profiler traces not collected on App Service; Profiler a... | App Service Always On feature is not enabled. Without Always On, the applicat... | Enable Always On in App Service Configuration > General settings. Always On i... | 8.5 | ADO Wiki |
| 18 | Application Insights Profiler on Azure Functions fails with error 'Merging of... | Believed to be resource limitations on the VM hosting the Function worker, ca... | Potential workaround: scale App Service plan up/down to move worker to a new ... | 7.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-profiler-debugger.md)
