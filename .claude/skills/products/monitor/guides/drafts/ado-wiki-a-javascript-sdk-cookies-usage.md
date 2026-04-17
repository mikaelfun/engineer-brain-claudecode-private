---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/JavaScript/JavaScript SDK and cookies usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FJavaScript%2FJavaScript%20SDK%20and%20cookies%20usage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# JavaScript SDK and Cookies Usage

## Overview

Common customer concerns about `ai_user` and `ai_session` browser cookies created by the Application Insights JavaScript SDK, often triggered by security scans.

## Cookie Attribute Details

### HttpOnly
- `ai_user`/`ai_session` should **NOT** have `HttpOnly` — the SDK reads/writes these client-side
- Setting `HttpOnly` would prevent SDK from accessing cookies, breaking user/session tracking

### SameSite
- Set to `None` by default in latest SDK
- Allows cross-site sending, but cookies contain no secrets — only populate user/session fields in telemetry
- No CSRF risk since values cannot exploit any vulnerability

### Secure
- Set automatically when connection is HTTPS and browser supports the attribute
- Available in latest SDK versions

## Key Talking Points for Customer

1. **No secrets exposed** — cookie values only populate `user_Id` and `session_Id` fields in Application Insights telemetry
2. **HttpOnly would break SDK** — setting it server-side causes SDK to generate random values, creating inconsistency between client/server events
3. **Latest SDK has best coverage** — update to latest version for SameSite + Secure attributes
4. **Cookie inspection** — visible in browser DevTools > Application tab > Cookies

## SDK Version References

- [Snippet setup](https://github.com/Microsoft/ApplicationInsights-JS) — version identified by "sv:"
- [NPM setup](https://www.npmjs.com/package/@microsoft/applicationinsights-web)

## Internal References

- Teams threads discussing cookie security concerns with customers
