# Monitor Application Insights .NET SDK - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 20 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-Code-less-Explained-for-Net-and-Net-Core.md, ado-wiki-a-determine-vnet-integration-web-app.md, ado-wiki-a-enable-classic-api-dotnet-core-sdk.md, ado-wiki-b-ampls-add-vnet-link-to-private-dns-zone.md, ado-wiki-b-ampls-create-spoke-vnet-for-webapp-outbound.md, ado-wiki-b-ampls-create-vnet-peering-spoke-hub.md, ado-wiki-b-ampls-enable-spoke-vnet-integration-webapp.md, ado-wiki-b-create-hub-vnet-for-ampls-and-pe.md, ado-wiki-b-determine-dns-resolution-vnet-integrated-apps.md, ado-wiki-b-enabling-application-insights-dotnet-core.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights .NET SDK diagnostic log files (SDK Logging method) not generated when deployed to Azure App Service Web App

**Solution**: Set LogFilePath to 'D:\HOME\SDKLOGS' (or the correct drive letter for your App Service — check via Kudu default page). For SDK 2.18+, prefer Self-Diagnostics via ApplicationInsightsDiagnostics.json placed in <drive>:\home\site\wwwroot with LogDirectory set to <drive>:\home

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Application Insights self-diagnostics log file not generated on App Service Web App (.NET Core / .NET Framework SDK ≥ 2.18)

**Solution**: 1) Check drive letter via KUDU default page. 2) Place ApplicationInsightsDiagnostics.json in {drive}:\home\site\wwwroot. 3) Set LogDirectory to {drive}:\home (Windows) or '.' (Linux). 4) Verify SDK version ≥ 2.18. 5) Wait ~10 seconds for log file to appear. 6) Rename .json to .bak to stop logging...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Application Insights SDK diagnostic logs not generated on App Service Web App when using SDK logging method (LogFilePath)

**Solution**: Set LogFilePath to 'D:\\HOME\\SDKLOGS' in ApplicationInsights.config instead of default C: path. The SDKLOGS folder will be auto-created. Disable logging after data collection to prevent disk space issues. Collect log files from D:\HOME\SDKLOGS via KUDU Debug Console.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Application startup time increases after adding Application Insights .NET/.NET Core SDK due to byte-code instrumentation

**Solution**: 1) Discontinue use of profiling libraries to collect SQL command name. 2) Warm the application instance up before adding to the rotation.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Memory consumption shows saw-like pattern with Application Insights SDK - quick rise to high memory, abrupt drop, repeat (looks like memory leak with restarts)

**Solution**: 1) No action needed - this is how server GC was designed to operate. 2) Optionally replace server GC with desktop GC: set <gcServer enabled="false"/> in <runtime> configuration.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights .NET SDK diagnostic log files (SDK Logging method) not g... | The default LogFilePath may reference C: drive which is not writable in Azure... | Set LogFilePath to 'D:\HOME\SDKLOGS' (or the correct drive letter for your Ap... | 8.5 | ADO Wiki |
| 2 | Application Insights self-diagnostics log file not generated on App Service W... | ApplicationInsightsDiagnostics.json placed in wrong drive or directory. App S... | 1) Check drive letter via KUDU default page. 2) Place ApplicationInsightsDiag... | 8.5 | ADO Wiki |
| 3 | Application Insights SDK diagnostic logs not generated on App Service Web App... | LogFilePath set to C: drive path which is not accessible on App Service. The ... | Set LogFilePath to 'D:\\HOME\\SDKLOGS' in ApplicationInsights.config instead ... | 8.5 | ADO Wiki |
| 4 | Application startup time increases after adding Application Insights .NET/.NE... | Byte-code instrumentation setup disables certain .NET Runtime startup optimiz... | 1) Discontinue use of profiling libraries to collect SQL command name. 2) War... | 8.5 | ADO Wiki |
| 5 | Memory consumption shows saw-like pattern with Application Insights SDK - qui... | Server garbage collection (GC) works differently from desktop GC - it execute... | 1) No action needed - this is how server GC was designed to operate. 2) Optio... | 8.5 | ADO Wiki |
| 6 | Application Insights SDK diagnostic logs not generated on App Service (LogFil... | LogFilePath set to C: drive path which is read-only on App Service. | Set LogFilePath to D:\HOME\SDKLOGS. Folder auto-created. Disable logging afte... | 8.5 | ADO Wiki |
| 7 | Application Insights Event Counter metrics recorded as Trace telemetry with '... | Both EventSourceTelemetryModule and EventCounterCollectionModule are enabled ... | Disable conflicting events in EventSourceTelemetryModule by adding DisabledSo... | 8.5 | ADO Wiki |
| 8 | System.IO.FileNotFoundException for System.Runtime.CompilerServices.Unsafe.dl... | Extension 2.8.44 upgrades SDK to 2.20.0 which has indirect reference to Syste... | Remove binding redirect for System.Runtime.CompilerServices.Unsafe.dll from w... | 7.5 | MS Learn |
| 9 | High CPU, memory leaks, thread leaks, or TCP port exhaustion in .NET applicat... | Application code leaks TelemetryConfiguration objects - each leaked instance ... | For .NET Framework: use TelemetryConfiguration.Active singleton. For .NET Cor... | 7.5 | MS Learn |
| 10 | FileNotFoundException: Could not load file or assembly Microsoft.AspNet.Telem... | Missing HTTP modules and telemetry module configuration in web.config and App... | Add TelemetryCorrelationHttpModule before ApplicationInsightsHttpModule in we... | 7.5 | MS Learn |
