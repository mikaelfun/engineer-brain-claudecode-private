---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: WAF Per Rule Exclusions"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20WAF%20Per%20Rule%20Exclusions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# WAF Per Rule Exclusions

## Overview

Per rule exclusions with CRS 3.2 on regional WAF with Application Gateway allow you to override WAF engine behavior by specifying certain request attributes to omit from rule evaluation.

Features:
- Attribute exclusion definitions by name or value of header, cookies, and arguments
- Exclusions can be applied to a rule, set of rules, rule group, or globally for the entire ruleset
- Adds feature parity between Global WAF (WAF on Azure Front Door) and Regional WAF (WAF on Application Gateway)

Available via Azure Resource Manager, PowerShell, CLI, and SDK.

## Limitations

- Portal support was delayed (originally ~05.16.2022). Encourage customers to configure via CLI/PS until Portal support is available.

## Troubleshooting

No change in how troubleshooting is completed for WAF.

## Public Documentation

- [Azure Monitor metrics on regional WAF](https://docs.microsoft.com/azure/web-application-firewall/ag/application-gateway-waf-metrics)
- [What is Azure WAF on Application Gateway?](https://docs.microsoft.com/en-us/azure/web-application-firewall/ag/ag-overview)
