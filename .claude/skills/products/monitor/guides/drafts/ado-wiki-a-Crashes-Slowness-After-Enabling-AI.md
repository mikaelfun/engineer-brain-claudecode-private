---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Missing or incorrect telemetry and performance issues/Crashes or slowness after enabling"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FMissing%20or%20incorrect%20telemetry%20and%20performance%20issues%2FCrashes%20or%20slowness%20after%20enabling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# App Crashes or Slow Performance after Enabling Application Insights

## Scenario
Application crashes after enabling Application Insights, or SDK logs internal errors.

## Scoping - Crash/Error
1. Is concern about AI causing app crash, or about SDK internal errors?
2. If crash-related:
   - When was AI first enabled? Was it working before?
   - Does enabling AI coincide with the crash?
   - How often does the error/crash occur?
   - Are there repeatable steps?
3. If SDK internal errors:
   - Is the app negatively affected? If users report no bad experience, the error is purely informational.

## Scoping - Performance
1. When was AI enabled?
2. When was performance impact noticed?
3. How is the impact manifested?
   - Some users or all? Some operations or all?
   - Can it be mitigated (e.g., restarting)?
   - Duration before onset?
4. Collect HTTP logs (IIS logs) showing before/after impact

## Analysis - Crash/Error

### Internal Trace 503 error code
- 503 = ServiceUnavailable = SDK could not communicate with ingestion service
- Purely informational; SDK will retry automatically
- See: https://learn.microsoft.com/azure/azure-monitor/app/telemetry-channels

### General crash investigation
- Reference: "How to approach application crash investigations with Application Insights suspected responsible" (internal wiki)

## Analysis - Performance (Autoinstrumentation)

AI performance impact is negligible and should cause no discernible impact. If suspected:

### Windows App Service - .NET Framework
1. Disable AI, restart web app
2. If problem persists -> not AI, dispatch to App Services Web Apps
3. If problem stops, re-enable and narrow down:
4. Check if auto-instrumentation pushed a coinciding update (Read Aggregate by Parsed SDK Names)
5. If Recommended mode: switch to Basic, restart, wait
6. If still occurring: disable one feature at a time (Profiler, Snapshot Debugger, SQL Commands)
7. Repeat until specific feature identified
8. If not identified -> collab with Azure Web Apps team

### Windows App Service - .NET (Core)
1. Disable AI, restart web app
2. If problem persists -> not AI, dispatch to App Services Web Apps
3. If problem stops: re-enable as before, narrow down
4. Disable features one by one (Profiler, Snapshot Debugger, SQL Commands)
5. Check for auto-instrumentation update coincidence
6. If not identified -> collab with Azure Web Apps team

### Windows App Service - Java
(Follow similar pattern - disable, validate, narrow down by feature)

## Support Boundary
- AI team handles: SDK behavior, autoinstrumentation configuration, telemetry pipeline
- App Services team handles: underlying application performance not caused by AI
- Reference: Support Boundaries - What Azure Monitor does not support
