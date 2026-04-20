---
title: "Azure Front Door Performance Troubleshooting Guide"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/front-door/troubleshoot-performance-issues"
product: networking
21vApplicable: true
createdAt: "2026-04-18"
---

# Azure Front Door Performance Troubleshooting Guide

Performance issues with Azure Front Door can originate from: the AFD service itself, the origin, the requesting client, or the network path between hops.

## Pre-check

Before deep-diving, check:
- [Azure Front Door platform status](https://azure.status.microsoft/status)
- ISP issues in the network path
- Client connectivity and data retrieval ability

## Scenario 1: Origin is Slow

**Indicators**: First request via AFD is slow; content not cached at POP.

**Diagnosis**:
1. Check response `x-cache` header:
   - `TCP_MISS` = request forwarded to origin (first request or cache expired)
   - `CONFIG_NOCACHE` = caching not enabled in route config
   - `TCP_HIT` = served from cache
2. Request the same URL repeatedly until `x-cache: TCP_HIT`
3. If performance improves on cache hit, origin speed is the bottleneck

**Resolution**: Fix origin performance or enable/tune AFD caching in route configuration.

```bash
# Check x-cache header
curl -I https://www.contoso.com/styles.css
# Look for: x-cache: TCP_MISS or TCP_HIT
```

## Scenario 2: Single Client/Location is Slow

**Indicators**: Specific client/location slow, others fine. Often ISP, VPN, or corporate network routing issue.

**Diagnosis**:
1. Run pathping (500 packets) to check network route:
   ```
   pathping /q 250 <Full URL>
   ```
2. Look for unexpected geographic routing (e.g., EU traffic routed through US)
3. Check for excessive hop count
4. Test from a different client in same region to isolate

**Resolution**: If extra hops or remote routing found, issue is between client and AFD POP (ISP/VPN problem, not AFD). Contact connectivity/VPN provider.

## Scenario 3: Entire Website Loads Slowly

**Indicators**: Whole page slow, not just a single file. Performance tools show poor metrics.

**Key Insight**: AFD only benefits files served through the AFD hostname. If a page loads sub-resources (images, JS, CSS) from non-AFD domains, those files bypass AFD and get no POP proximity benefit.

**Diagnosis**:
1. Open browser DevTools (F12) > Network tab
2. Check the Request URL of each resource
3. Identify which files use AFD hostname vs. external domains
4. Compare performance of AFD-served vs. non-AFD-served files

**Resolution**:
- Ensure all critical resources are served through the AFD custom domain
- Redesign webpage to route resources through AFD if needed
- For cached files, verify `x-cache: TCP_HIT` response header

## Decision Tree

```
Performance Issue
  |
  +-- Single file slow?
  |     +-- x-cache: TCP_MISS? --> Scenario 1 (origin)
  |     +-- x-cache: TCP_HIT but slow? --> Scenario 2 (client path)
  |
  +-- Whole page slow?
        +-- Resources from non-AFD domains? --> Scenario 3 (page design)
        +-- All through AFD? --> Check per-file x-cache headers
```
