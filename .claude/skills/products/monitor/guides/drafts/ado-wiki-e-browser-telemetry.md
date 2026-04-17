---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Browser telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FBrowser%20telemetry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect Browser Telemetry

Help collecting browser telemetry such as page views, browser timings, users, or sessions.

## Scoping

Confirm the product scope and identify the specific telemetry types missing (pageViews, browserTimings, users, sessions).

## Analysis

1. Check the Known Issues section below for potential explanation.
2. For understanding data collected from client-side monitoring (cookie usage, sessions, common plugins), see the Relevant Documentation section.
   - For cookie attribute questions (`HttpOnly`, `SameSite`, `Secure`), see: JavaScript SDK and cookies usage guide.
3. For tracking time spent on a page: enable `autoTrackPageVisitTime` in the SDK configuration.
   - Doc: [JavaScript SDK configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk-configuration?tabs=javascriptwebsdkloaderscript#sdk-configuration)

### Enabling Client-Side Monitoring by Platform

#### .NET Framework
1. Can be added automatically or manually.
2. **Automatic**: Add `APPINSIGHTS_JAVASCRIPT_ENABLED` app setting in App Service + restart.
   - ⚠️ Known issue: HTTP 500/500.53 errors when URL compression is enabled. See: [Incompatibility docs](https://docs.microsoft.com/azure/azure-monitor/app/azure-web-apps-net#appinsights_javascript_enabled-and-urlcompression-is-not-supported)
3. **Manual**: Two variations documented at: [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

#### .NET Core
1. Can be added automatically or manually.
2. **Automatic**: Same as .NET Framework — add app setting + restart.
   - ⚠️ Same 500/500.53 URL compression issue applies.
3. **Manual**: [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

#### Java
1. Manual only — no automatic option available.
2. [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

#### Node.js
1. Manual only — no automatic option available.
2. [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

#### On-Premises Servers (Azure Monitor Application Insights Agent)
1. Manual only.
2. Supports .NET Framework and .NET Core web apps running on IIS.
3. [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

#### Azure VMs and VMSS
1. Manual only.
2. Supports .NET Framework and .NET Core web apps running on IIS.
3. [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)

### JavaScript SDK Specific Issues
1. Manual integration: [JavaScript SDK docs](https://docs.microsoft.com/azure/azure-monitor/app/javascript)
2. **ai_user and ai_session cookies security vulnerability**: Security scanners flag these cookies because they are not `HttpOnly`. These cookies MUST be readable by the JavaScript SDK in the browser and CANNOT be `HttpOnly`. Unsupported workaround: [GitHub issue #626](https://github.com/microsoft/ApplicationInsights-JS/issues/626)

## Known Issues
- See general Application Insights known issues template.

## Public Documentation
- [JavaScript SDK upgrade info](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/javascript-sdk-upgrade)
- [JavaScript SDK configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk-configuration?tabs=javascriptwebsdkloaderscript)
