---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics"
importDate: "2026-04-20"
type: guide-draft
---

# How to Collect Self-Diagnostic Logs for Application Insights SDKs

When encountering issues with Application Insights SDK itself, self-diagnostic logs are needed to spot and diagnose problems.

## .NET/.NET Core Framework SDK (v2.18.0-beta2+)

### Configuration
Create `ApplicationInsightsDiagnostics.json` in the app working directory:

```json
{
    "LogDirectory": "<LogDirectory>",
    "FileSize": 5120,
    "LogLevel": "Verbose"
}
```

- FileSize: 1 MB to 128 MB (KB units)
- LogLevel: matches EventLevel (Warning includes Error and Critical)
- SDK reads config every 10 seconds; delete file to disable

### App Service (Windows)
1. Go to Kudu (Advanced Tools > Go)
2. Navigate to `<drive>:\home\site\wwwroot`
3. Create `ApplicationInsightsDiagnostics.json` with LogDirectory set to `<drive>:\home\site\wwwroot`
4. Log file appears within 10 seconds

### App Service (Linux)
1. Create config file locally
2. Upload via Kudu new UI (`/newui` suffix) > File Manager > Site > wwwroot

## Java 2.x
Add `<SDKLogger>` element under root node of `ApplicationInsights.xml`:
```xml
<SDKLogger type="FILE">
    <Level>TRACE</Level>
    <UniquePrefix>AI</UniquePrefix>
    <BaseFolderPath>C:/agent/AISDK</BaseFolderPath>
</SDKLogger>
```

## Java 3.x
Use self-diagnostics configuration per Azure Monitor documentation.
