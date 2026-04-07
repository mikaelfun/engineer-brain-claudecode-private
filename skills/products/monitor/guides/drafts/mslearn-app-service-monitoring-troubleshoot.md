# App Service Application Insights Monitoring Troubleshooting

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/troubleshoot-app-service-issues
> Quality: guide-draft | 21vApplicable: true

## Diagnostic Checklist (All Languages)

1. Verify `ApplicationInsightsAgent_EXTENSION_VERSION` app setting:
   - ASP.NET / ASP.NET Core / Node.js on **Windows**: `~2`
   - Java / Node.js / Python on **Linux**: `~3`
2. Browse diagnostic page: `https://{sitename}.scm.azurewebsites.net/ApplicationInsights`
3. Confirm `Application Insights Extension Status` shows running
4. Confirm `IKeyExists` is `true` (set `APPINSIGHTS_INSTRUMENTATIONKEY` + `APPLICATIONINSIGHTS_CONNECTION_STRING`)
5. Check for `AppAlreadyInstrumented` / `AppContainsDiagnosticSourceAssembly` entries

## ASP.NET Specific

- Remove SDK NuGet packages: `Microsoft.ApplicationInsights`, `System.Diagnostics.DiagnosticSource`, `Microsoft.AspNet.TelemetryCorrelation`
- Clean `bin/` and `wwwroot/` for leftover DLLs (use Kudu > Debug console > CMD)
- APPINSIGHTS_JAVASCRIPT_ENABLED + gzip = 500 URL rewrite error -> remove setting, use manual JS SDK

## ASP.NET Core Specific

- Windows: same as ASP.NET check
- Linux: check `/var/log/applicationinsights/status_*.json` for `Auto-Instrumentation enabled successfully`
- If app uses SDK: enable **Interop with Application Insights SDK** in portal (preview)
- Hosting startup override: ensure `Microsoft.ApplicationInsights.StartupBootstrapper` included

## Java Specific

- Check agent log: Kudu > SSH > `LogFiles/ApplicationInsights`
- Set `APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL=debug` if no telemetry
- Live Metrics validates agent before app deployment

## Node.js Specific

- Windows: check `D:\local\Temp\status.json` for `SDKPresent:false`, `AgentInitializedSuccessfully:true`
- Linux: check `/var/log/applicationinsights/status.json`
- If `SDKPresent:true` -> extension backs off, remove SDK

## Python Specific

- Confirm autoinstrumentation enabled in App Insights blade
- Check `/var/log/applicationinsights/status_*.json` and `applicationinsights-extension.log`
- Django: set `DJANGO_SETTINGS_MODULE` env var
- Do NOT combine autoinstrumentation + manual OpenTelemetry -> duplicate telemetry

## Known Break/Fix Issues

| Symptom | Root Cause | Fix | JSONL ID |
|---------|-----------|-----|----------|
| 500 URL rewrite error with gzip | APPINSIGHTS_JAVASCRIPT_ENABLED + content encoding | Remove setting, use manual JS SDK | 022 |
| FileNotFoundException Unsafe.dll after 2.8.44 | Binding redirect mismatch | Fix binding redirect or rollback to 2.8.37 | 023 |
| Python duplicate telemetry | Autoinstrumentation + manual OTel | Use only one method | 024 |

## Extension Version History

- 2.8.44: upgrades SDK to 2.20.0 (may break binding redirects)
- 2.8.37: last safe rollback version
