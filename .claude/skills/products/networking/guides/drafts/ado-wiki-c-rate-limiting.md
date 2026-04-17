---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Rate Limiting rules for Application Gateway WAF Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Rate%20Limiting%20rules%20for%20Application%20Gateway%20WAF%20Policies"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Rate Limiting rules for Application Gateway WAF Policies

> Public Preview

## Overview

Rate limiting enables you to detect and block abnormally high levels of traffic destined for your application. By using rate limiting with Application Gateway WAFv2, you can mitigate many types of denial-of-service attacks, protect against misconfigured clients sending large volumes of requests, or control traffic rates from specific geographies.

## How it works

Configured rate limit thresholds are counted and tracked independently for each endpoint the WAF Policy is attached to. A single WAF policy attached to five different listeners will maintain independent counters and threshold enforcement for each listener.

## How to configure

Rate limiting is configured using custom WAF rules.

- **Rate limit duration**: Counting duration. Allowed values: 1 and 5 minutes.
- **Rate Limit Threshold**: Maximum requests within the defined duration. Allowed: 1-5000 requests.
- **Group rate limit traffic by** (GroupByUserSession):
  - **ClientAddr** (default): Each rate limit threshold applies independently to every unique source IP
  - **GeoLocation**: Traffic grouped by geography based on Geo Match of Client IP
  - **None**: All traffic grouped together. Recommended with specific match conditions (e.g., login page, suspicious User-Agents)

## How to identify (ASC)

ASC shows Rate Limiting rules under **Custom Rules** with Rule Type as `RateLimitRule`.

## Additional resources

- [Custom rules for WAF v2 on Azure Application Gateway](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/custom-waf-rules-overview)

## Known bugs

Work Item #52474
