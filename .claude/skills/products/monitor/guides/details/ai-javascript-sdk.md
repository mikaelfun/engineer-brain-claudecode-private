# Monitor Application Insights JavaScript/Browser SDK - Comprehensive Troubleshooting Guide

**Entries**: 26 | **Drafts fused**: 8 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-javascript-sdk-cookies-usage.md, ado-wiki-a-manage-sampling-with-javascript.md, ado-wiki-a-validate-javascript-cors-functionality.md, ado-wiki-b-Capture-Browser-Trace-HAR.md, ado-wiki-b-javascript-sdk.md, ado-wiki-d-How-To-Capture-Browser-Trace-as-har-file.md, ado-wiki-e-browser-telemetry.md, mslearn-javascript-sdk-troubleshoot.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights JavaScript SDK stops collecting browser-side telemetry after disabling local authentication and enabling Entra ID authentication on the App Insights resource.

**Solution**: Deploy Azure API Management (APIM) as a telemetry proxy between the browser and App Insights ingestion endpoint: 1) Create APIM instance with System-Assigned Managed Identity; 2) Assign 'Monitoring Metrics Publisher' role to the MI on the App Insights resource; 3) Add HTTP API in APIM with backen...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: The 'client_OS' field in 'browserTimings' and 'pageViews' tables in Application Insights reports incorrect or inaccurate OS data. For example, Windows 11 clients are reported as 'Windows 10'.

**Solution**: Currently no fix available. Microsoft plans to investigate viable workarounds using User-Agent Client Hints. See: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: JavaScript SDK telemetry correlation headers (W3C/HTTP) are not sent on outbound XmlHttpRequests from web pages despite enabling distributedTracingMode configuration setting.

**Solution**: Troubleshoot checklist: (1) Capture Fiddler/F12 HAR trace of outbound requests; (2) Verify SDK config follows latest docs; (3) Confirm SDK version ≥ 2.8.12 with distributedTracingMode=1; (4) Ensure IFrame pages also load JS SDK; (5) Initialize SDK in each Web Worker; (6) Check for XMLHttpRequest ...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Security scanners flag Application Insights ai_user and ai_session cookies as vulnerable because they are not marked as HttpOnly

**Solution**: This is by design. Unsupported workaround documented at https://github.com/microsoft/ApplicationInsights-JS/issues/626 — customers can implement custom cookie handling, but it is not officially supported.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: HTTP 500 or 500.53 errors occur after enabling Application Insights client-side monitoring via APPINSIGHTS_JAVASCRIPT_ENABLED app setting in Azure App Service

**Solution**: Disable URL compression or use manual JavaScript SDK injection instead of auto-injection. See: https://docs.microsoft.com/azure/azure-monitor/app/azure-web-apps-net#appinsights_javascript_enabled-and-urlcompression-is-not-supported

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights JavaScript SDK stops collecting browser-side telemetry a... | The Application Insights JavaScript SDK does not have built-in support for En... | Deploy Azure API Management (APIM) as a telemetry proxy between the browser a... | 8.5 | ADO Wiki |
| 2 | The 'client_OS' field in 'browserTimings' and 'pageViews' tables in Applicati... | Since Windows 11, browsers have frozen the User-Agent header value, making it... | Currently no fix available. Microsoft plans to investigate viable workarounds... | 8.5 | ADO Wiki |
| 3 | JavaScript SDK telemetry correlation headers (W3C/HTTP) are not sent on outbo... | Multiple possible causes: (1) SDK version too old (< 2.8.12 doesn't support W... | Troubleshoot checklist: (1) Capture Fiddler/F12 HAR trace of outbound request... | 8.5 | ADO Wiki |
| 4 | Security scanners flag Application Insights ai_user and ai_session cookies as... | The ai_user and ai_session cookies must be readable by the Application Insigh... | This is by design. Unsupported workaround documented at https://github.com/mi... | 8.5 | ADO Wiki |
| 5 | HTTP 500 or 500.53 errors occur after enabling Application Insights client-si... | Conflict between Application Insights automatic JavaScript snippet injection ... | Disable URL compression or use manual JavaScript SDK injection instead of aut... | 8.5 | ADO Wiki |
| 6 | Page visit duration (time spent on page) is not tracked in Application Insigh... | The autoTrackPageVisitTime configuration option is disabled by default in the... | Enable autoTrackPageVisitTime in the JavaScript SDK configuration. See: https... | 8.5 | ADO Wiki |
| 7 | Security scanner flags ai_user and ai_session Application Insights cookies as... | The ai_user and ai_session cookies are required to be readable by the JavaScr... | This is by design. These cookies must be readable by JavaScript. Unsupported ... | 8.5 | ADO Wiki |
| 8 | HTTP 500 or 500.53 errors after enabling APPINSIGHTS_JAVASCRIPT_ENABLED app s... | Conflict between Application Insights JavaScript auto-injection and URL compr... | Disable URL compression or use manual JavaScript SDK injection instead of the... | 8.5 | ADO Wiki |
| 9 | Application Insights portal experiences stop working for AMPLS-associated res... | Chrome/Edge 'Local Network Access Checks' feature (enabled by default) blocks... | Disable 'Local Network Access Checks' in browser flags: edge://flags/#local-n... | 8.5 | ADO Wiki |
| 10 | Failed OPTIONS preflight requests in browser dev tools to Application Insight... | CORS failure — Power BI plugin sends OPTIONS request with Origin 'https://app... | No user action needed — these failed requests don't impact the application. T... | 8.5 | ADO Wiki |
| 11 | Failed OPTIONS preflight requests to Application Insights ingestion endpoints... | Power BI JavaScript plugin (app.powerbigov.us) embeds code sending telemetry ... | No impact on the application - failed requests are harmless. The telemetry PO... | 8.5 | ADO Wiki |
| 12 | Users column missing in Application Insights Failures pane operation name table. | By design: the Failures blade query uses dcountif(user_Id,...) to calculate u... | Customer must produce telemetry that populates the user_Id field. Most common... | 8.5 | ADO Wiki |
| 13 | PageView duration field is always 0 in Application Insights for Single Page A... | By design - the JavaScript SDK cannot accurately measure page load duration i... | Workarounds: (1) Manually calculate duration between route changes and pass t... | 8.5 | ADO Wiki |
| 14 | PageView telemetry duration field always shows 0 for Single Page Applications... | By design - SPA route changes do not trigger traditional page loads, so the d... | Multiple workarounds: (1) Manually calculate duration between route changes a... | 8.5 | ADO Wiki |
| 15 | Security scan flags Application Insights JavaScript SDK cookies (ai_user, ai_... | By design - the JS SDK must read and write ai_user/ai_session cookies client-... | Explain: (1) cookies contain no secrets - values only populate user_Id/sessio... | 8.5 | ADO Wiki |
| 16 | CORS preflight (OPTIONS) request fails when Application Insights JavaScript S... | JS SDK adds traceparent/Request-Id HTTP header to outbound cross-domain reque... | If customer controls destination server: enable CORS and configure Access-Con... | 8.5 | ADO Wiki |
| 17 | All telemetry stops flowing to Application Insights after configuring AMPLS a... | Client-side JavaScript SDK telemetry from users not on private network cannot... | Ensure all sources on private network, or set AMPLS to Open mode. For JS SDK:... | 8.5 | ADO Wiki |
| 18 | JavaScript SDK cannot use Entra ID authentication for Application Insights, n... | JavaScript SDK does not support Entra ID authentication. Current platform lim... | Use separate AI component with local auth for JS telemetry, or use Azure APIM... | 8.5 | ADO Wiki |
| 19 | Hundreds or thousands of telemetry items share the same operation ID in Appli... | Client application (especially SPAs) sends multiple HTTP requests to backend ... | Identify the calling client. For SPAs, enable enableAutoRouteTracking in Java... | 8.5 | ADO Wiki |
| 20 | 500 URL rewrite error on App Service when APPINSIGHTS_JAVASCRIPT_ENABLED=true... | Outbound rewrite rules for JavaScript injection cannot be applied when HTTP r... | Remove APPINSIGHTS_JAVASCRIPT_ENABLED app setting. Use manual JavaScript SDK ... | 7.5 | MS Learn |
| 21 | Application Insights JavaScript SDK 记录的 PageView 遥测中，Windows 11 设备的操作系统显示为 Wi... | 浏览器 UserAgent 字符串冻结机制（Google 主导的行业决策）：浏览器故意将 UA 中的 OS 版本报告为 Windows 10，JS SDK... | 目前无可用 Workaround。JS SDK 团队在研究使用 NavigatorUAData.getHighEntropyValues() API 的可... | 7.0 | ADO Wiki |
| 22 | Application Insights JavaScript SDK LOAD Failure exception: Failed to load Ap... | SDK script cannot be downloaded from CDN or fails to initialize. Common cause... | 1) Check network tab in browser DevTools for download status; 2) Verify CDN e... | 6.5 | MS Learn |
| 23 | App Insights JS SDK reports 0 duration for page views in SPA | By design - SPA route changes do not trigger traditional page load events | Use trackPageView() with manual duration, startTrackPageView()/stopTrackPageV... | 6.5 | MS Learn |
| 24 | Failed to get Request-Context correlation header error in App Insights JS SDK | Third-party server missing correlation headers in Access-Control-Allow-Headers | Add domain to correlationHeaderExcludedDomains or update server CORS headers ... | 6.5 | MS Learn |
| 25 | Duplicate telemetry from App Insights JS SDK with connection strings | SDK recursive correlation causes duplicate auto-tracked requests to ingestion... | Set excludeRequestFromAutoTrackingPatterns config with endpoint URL | 6.5 | MS Learn |
| 26 | Application Insights shows only 1 user/session count instead of actual many u... | Anonymous user ID and session ID telemetry properties not populated with uniq... | Add Application Insights JavaScript SDK to all monitored pages; or create tel... | 6.5 | MS Learn |
