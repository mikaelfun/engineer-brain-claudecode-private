---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Azure Web Application Firewall Sensitive Data Protection for Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Azure%20Web%20Application%20Firewall%20Sensitive%20Data%20Protection%20for%20Application%20Gateway"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Web Application Firewall Sensitive Data Protection for Application Gateway

## Overview

Log scrubbing is a rules engine that allows you to build custom rules to identify specific portions of a request that are sensitive, so you can scrub that information from your logs. The sensitive data is replaced with `*******`.

## How to Enable

Configure specific parts of incoming request logs to scrub. If no rules are specified, data is saved into logs as plain text. Some data types (for example: IP address) automatically scrubs the data type without an operator and selector value.

Configure from Portal under WAF Policy settings.

## How to Identify (ASC)

See **Log Scrubbing Rules** under **applicationGatewayWebApplicationFirewallPolicies** resource.

## Fields That Can Be Scrubbed

The following fields can be scrubbed from the logs:

- IP address
- Request header name
- Request cookie name
- Request args name
- Post arg name
- JSON arg name

## Working Example

When parameters for **IPAddress** and **RequestCookieName = Cookie_1** are configured:
- In WAF Log: `clientIp` shows as `******`
- In WebApplicationFirewallLogs: matched data shows as `******` for the configured cookie

## Additional Resources

[What is Azure Web Application Firewall Sensitive Data Protection](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/waf-sensitive-data-protection)
