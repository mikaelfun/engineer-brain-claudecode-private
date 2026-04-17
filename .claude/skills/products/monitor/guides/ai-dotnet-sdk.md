# Monitor Application Insights .NET SDK

**Entries**: 10 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

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

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-dotnet-sdk.md)
