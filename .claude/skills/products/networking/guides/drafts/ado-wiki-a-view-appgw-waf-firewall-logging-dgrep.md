---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Troubleshooting/HowTo: View AppGateway WAF Firewall Logging with DGrep"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FHowTo%3A%20View%20AppGateway%20WAF%20Firewall%20Logging%20with%20DGrep"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Summary

This article shows you how you can track what traffic is detected/prevented by AppGateway WAF.

## Common Misconceptions

The following link is to the primary WAF Wiki. There is a section for Common Misconceptions that should be reviewed.
<https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki?wikiVersion=GBmaster&pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FWeb%20Application%20Firewall%20(AppGW%20%252D%20WAF)&pageId=134293>

## HowTo: View AppGateway WAF Firewall Logging with DGrep

Use the following DGrep query:  
<https://portal.microsoftgeneva.com/A0B6A795>  

Server query:  
Endpoint: Diagnostics PROD  
Namespace: AppGWT  
Events to search: ApplicationGatewayFirewallLog  
Filtering conditions:  
resourceId contains \<SubscriptionID\>  

Client query:  
orderby PreciseTimeStamp asc  
//where properties.contains("167.220.148.31")  

## Analyzing one Row/Entry in AppGateway Firewall Logging

Each row in the WAF firewall log contains:
- `instanceId` — the AppGateway instance
- `clientIp` / `clientPort` — source of the request
- `requestUri` — the request URI
- `ruleId` — the OWASP rule that triggered
- `message` — description of the rule
- `action` — "Detected" or "Blocked"
- `details.file` — the CRS conf file containing the rule
- `details.line` — the line number within that file

## How To Track Down Specific Rules

AppGateway WAF uses ModSecurity Core Rule Set (CRS) v2.2.6.

SpiderLabs Github repository for v2.2.6:  
<https://github.com/SpiderLabs/owasp-modsecurity-crs/tree/v2.2.6/base_rules>

Steps:
1. Find the `file` field in the FirewallLog entry (e.g. `modsecurity_crs_21_protocol_anomalies.conf`)
2. Open the corresponding conf file from the GitHub repo
3. Navigate to the line number referenced in `details.line`
4. Read the `SecRule` definition to understand what triggered WAF

### Example: OWASP_960009 — Missing User-Agent Header

Rule at `modsecurity_crs_21_protocol_anomalies.conf` line 66 checks for missing or empty `User-Agent` header.

### Example: OWASP_950001 — SQL Injection Attack

Rule at `modsecurity_crs_41_sql_injection_attacks.conf` line 125 uses a large regex to detect SQL injection patterns in request cookies, args, and XML.

Data file with keywords:  
<https://github.com/SpiderLabs/owasp-modsecurity-crs/blob/v2.2.6/base_rules/modsecurity_41_sql_injection_attacks.data>
