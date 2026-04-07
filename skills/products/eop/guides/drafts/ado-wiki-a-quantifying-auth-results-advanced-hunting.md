---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Email Authentication/Quantifying authentication results with Advanced Hunting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FEmail%20Authentication%2FQuantifying%20authentication%20results%20with%20Advanced%20Hunting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Quantifying Authentication Results with Advanced Hunting

Support often receives cases where a customer states that auth (SPF/DKIM/DMARC) fails/times out "all the time" or "too often". Use the below Advanced Hunting scripts to quantify the extent of undesired auth results.

**Important:** Change the first 2 "let" lines (update '30d' and 'contoso.com') and the `|summarize count() by SPF` line (update 'SPF' to any/all of SPF, DKIM, DMARC) before running.

## Auth Stats Query

```kql
// Script to return auth stats for a period of x days
// IMPORTANT: edit _DaysBack, _SenderMailFromDomain, and the auth mechanism
let _DaysBack=30d;
let _SenderMailFromDomain='contoso.com';
let AuthCount=materialize(EmailEvents
| where Timestamp >=ago(_DaysBack) and EmailDirection == 'Inbound' and SenderMailFromDomain == _SenderMailFromDomain
| extend AuthDetails = parse_json(AuthenticationDetails)
| extend SPF = tostring(AuthDetails.SPF), DKIM = tostring(AuthDetails.DKIM), DMARC = tostring(AuthDetails.DMARC), CompAuth = tostring(AuthDetails.CompAuth));
AuthCount
|summarize count() by SPF  // choose from any/all of SPF, DKIM, DMARC
| extend Percentage = round( (100.0 / toscalar(AuthCount | count)) * count_, 2)
```

## SPF IP Analysis Query

For deeper analysis of SPF fails, list the IPs with highest fail counts:

```kql
// Script to return sending IP stats for SPF fails
let _DaysBack=30d;
let _SenderMailFromDomain='contoso.com';
let AuthCount=materialize(EmailEvents
| where Timestamp >=ago(_DaysBack) and EmailDirection == 'Inbound' and SenderMailFromDomain == _SenderMailFromDomain
| extend AuthDetails = parse_json(AuthenticationDetails)
| extend SPF = tostring(AuthDetails.SPF), DKIM = tostring(AuthDetails.DKIM), DMARC = tostring(AuthDetails.DMARC), CompAuth = tostring(AuthDetails.CompAuth)
| where SPF == "fail");  // replace "fail" with "temperror", "permerror", "softfail" as needed
AuthCount
| summarize count() by SenderIPv4, SenderIPv6
| extend Percentage = round( (100.0 / toscalar(AuthCount | count)) * count_, 2)
| order by count_
| top 15 by count_
```

## Interpreting Results

- If DMARC fails almost all the time: check if sender IPs are in SPF record and if DKIM is configured
- If temperror rate is very low (<1%): intermittent DNS timeouts are expected behavior
- If SPF fails are high: use the IP script to identify which IPs are failing, then check with SPF Policy Tester
- Where SPF=fail and DKIM=pass: add DMARC to the script to verify if DMARC passes via DKIM alignment

## Tools

- [SPF Policy Tester (Vamsoft)](https://vamsoft.com/support/tools/spf-policy-tester) — check if IPs are in SPF record
