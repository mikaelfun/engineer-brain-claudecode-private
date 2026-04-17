---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: DRS 2.2 for Application Gateway WAF"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20DRS%202.2%20for%20Application%20Gateway%20WAF"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# DRS 2.2 for Application Gateway WAF

## Overview

DRS 2.2 rules offer better protection than earlier versions of the DRS. It includes more rules developed by the Microsoft Threat Intelligence team and updates to signatures to reduce false positives. It also supports transformations beyond just URL decoding.

DRS 2.2 includes 18 rule groups. Each group contains multiple rules, and you can customize behavior for individual rules, rule groups, or entire rule set. DRS 2.2 is baselined off the Open Web Application Security Project (OWASP) Core Rule Set (CRS) 3.3.4 and includes additional proprietary protections rules developed by Microsoft Threat Intelligence team.

## DRS 2.2 Ruleset

For an updated list of DRS 2.2 Ruleset in Regional Web Application Firewall see: [2.2 rule sets](https://learn.microsoft.com/azure/web-application-firewall/ag/application-gateway-crs-rulegroups-rules?tabs=drs22#drs22)

## Troubleshooting

### How to Identify

ASC will show `Managed Rule Set Version` as `2.2` under Web Application Firewall policy properties.

DRS 2.2 Ruleset are troubleshot similar to other WAF rules. For additional guidance see: [Application Gateway WAF Troubleshooting Guide](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/133410/Application-Gateway-WAF-Troubleshooting-Guide)
