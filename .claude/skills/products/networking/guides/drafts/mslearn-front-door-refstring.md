---
title: "Azure Front Door RefString Diagnostics"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/front-door/refstring"
product: networking
date: 2026-04-18
type: troubleshooting-guide
---

# Troubleshoot Front Door 4xx/5xx Errors Using Reference String

## What is a Reference String (RefString)?
- Short Base64-encoded string in the `X-Azure-Ref` HTTP response header
- Contains details on request processing: POP location, backend status
- Useful for diagnosing cache misses, backend failures, latency issues
- Error pages from Microsoft services already include RefString

## How to Gather RefString

### Browser Method (Edge/Chrome)
1. Open DevTools (F12 / Ctrl+Shift+I)
2. Go to **Network** tab
3. Refresh page or trigger the request
4. Find the request in list
5. Look for `X-Azure-Ref` in response headers
6. Copy the value

## How to Use RefString for Diagnostics

### Azure Portal Diagnostic Tool
1. Navigate to Azure Front Door Profile
2. Select **Diagnose and solve problems**
3. Scroll to **Connectivity** under Common problems
4. Select **4xx and 5xx errors** as problem subtype
5. Enter RefString in **Tracking Reference** field
6. Click **Run Diagnostics**
7. Wait up to 15 minutes for results

### Alternative Methods
- Include RefString when submitting support ticket
- Enable **Access Logs** for RefString data in Azure portal
- Reference: Monitor metrics and logs in Azure Front Door (access log parameters)

## Key Fields in Access Logs
- RefString correlates with specific request processing
- Helps identify error type and POP-specific issues
