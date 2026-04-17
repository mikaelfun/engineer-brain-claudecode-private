---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Troubleshooting/Application Gateway WAF in Prevention Mode Blocks Traffic"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20in%20Prevention%20Mode%20Blocks%20Traffic"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway WAF in Prevention Mode Blocks Traffic

[[_TOC_]]

## Scenario

After configuring an Application Gateway with Web Application Firewall turned on, a customer notices specific traffic being blocked.

## Support Topics Covered by This Workflow

- Routing Azure Application Gateway\Web Application Firewall (WAF)\
- Routing Azure Application Gateway\Web Application Firewall (WAF)\Analyze allowed/blocked traffic
- Routing Azure Application Gateway\Web Application Firewall (WAF)\Configuration and setup
- Routing Azure Application Gateway\Web Application Firewall (WAF)\Performance

## Internal Scoping & Data Collection (10-15 minutes)

1. Review the customer Verbatim
2. Collect Customer Subscription information from case communications or check ASC
3. In ASC, look at the Application Gateway Section and collect:
   - Confirm WAF is enabled and in prevention mode (check WAF Config in ASC)
   - Application Gateway Deployment ID (from ASC Brooklyn Properties)
   - RuleSetType and RuleSetVersion (from WAF Config in ASC)
   - ApplicationGatewayFirewallLog in MDM (link in ASC) — change time frame to issue window

## Customer Scoping & Data Collection

1. Validate with the customer:
   - Subscription ID
   - Resource name
   - Business Impact
   - How often does this issue occur?
   - Can the issue be reproduced?
   - When did the issue begin (recently or since initial setup)?

## Known Solutions

### Customer is attempting to access URL via IP address

If a customer attempts to access the URL via an IP address, Application Gateway WAF will block all requests (numeric IP in host header triggers rule OWASP_960017).

- **SR Root Cause Coding**: Application Gateway > WAF > How to > Didn't want to read documentation

### Total # of special characters exceeded in ARGs or Cookies

[Sample query in MDM](https://portal.microsoftgeneva.com/54C0EDFD)

- **SR Root Cause Coding**: Application Gateway > WAF > Limits

### HTTP PUT blocked

HTTP methods other than GET, HEAD, and POST are blocked in Prevention Mode. The PUT request is restricted by the conf file:
https://github.com/SpiderLabs/owasp-modsecurity-crs/blob/v2.2.6/base_rules/modsecurity_crs_30_http_policy.conf

- **SR Root Cause Coding**: Application Gateway > WAF > Configuration and Setup

### Azure Traffic Manager status is degraded

Traffic Manager probes are missing the Accept Header. This traffic is dropped in prevention mode.

- **SR Root Cause Coding**: Application Gateway > WAF > Limit

### Web Sockets being blocked

Web sockets (HTTP packets missing the accept or user agent headers) are blocked in Prevention Mode.

- **SR Root Cause Coding**: Application Gateway > WAF > Configuration and Setup

### Advanced rule configuration — Disable Specific Rules

Using the ApplicationGatewayFirewallLog, customer can determine exactly what rule they are being blocked on. The customer can disable this rule in the portal or via PowerShell.

```powershell
Install-Module -Name Az -Repository PSGallery -Force
Connect-AzAccount
Set-AzContext -Name 'MyContextName' -Subscription 'MySubscriptionName' -Tenant '00000000-0000-0000-0000-000000000000'
$appgw = Get-AzApplicationGateway -Name "GATEWAY_NAME" -ResourceGroupName "RESOURCE_GROUP_NAME"
$disabledRuleGroups = $appgw.WebApplicationFirewallConfiguration.DisabledRuleGroups
## find the ruleGroup you want to disable and access that one:
$disabledRuleGroups[INDEX].Rules = $null  # disables entire ruleGroup
$UpdatedAppGw = Set-AzApplicationGateway -ApplicationGateway $appgw
```

- **SR Root Cause Coding**: Application Gateway > WAF > Analyze allowed/blocked traffic

### Mandatory Rules that cannot be disabled (949110, 980130)

These rules use **anomaly scoring** — each contributing rule adds a score:
- Critical → +5, Error → +4, Warning → +3, Notice → +2
- When total score ≥ 5 → rule 949110 fires ("Inbound Anomaly Score Exceeded")

**Solution**: Instead of disabling 949110 (impossible), find and disable the **contributing rules** from `ApplicationGatewayFirewallLog`. For example, rule 913100 (security scanner detection) is Critical (+5) — disabling 913100 prevents 949110 from firing.

Rule 913100 definition:
https://github.com/fastly/waf_testbed/blob/master/templates/default/REQUEST-913-SCANNER-DETECTION.conf.erb

- **SR Root Cause Coding**: Application Gateway > WAF > Limit

## Unknown Solution — Data Collection & Analysis

### ApplicationGatewayFirewallLogs

Have the customer reproduce the issue and provide a timestamp. Review `ApplicationGatewayFirewallLogs` in MDM via ASC. Review the **properties** column — it will show `ruleId` and the reason for the block.

Based on results, customer can:
1. Disable the particular rule causing the issue (via portal or PowerShell)
2. Modify their application to comply with ModSecurity/OWASP rule set

- **SR Root Cause Coding**: Application Gateway > WAF > Analyze allowed/blocked traffic
