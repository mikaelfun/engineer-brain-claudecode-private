---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/ModSecurity Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FModSecurity%20Introduction"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ModSecurity Introduction for Application Gateway WAF

## What is ModSecurity?

ModSecurity is an open-source Web Application Firewall (WAF) developed by Trustwave's SpiderLabs, originally for Apache and later extended to IIS and NGINX. Application Gateway WAF uses ModSecurity with OWASP Core Rule Set (CRS 2.2.9 and CRS 3.0).

ModSecurity detects threats by scanning incoming/outgoing HTTP communications. Based on rule configuration, the engine can: pass, drop, redirect, return a given status code, execute a user script, and more.

## Detection vs Prevention Mode

- **Detection Mode** (`SecRuleEngine DetectionOnly`): Inspects every request but does NOT block even if malicious — logs and reports only. This is the default WAF mode.
- **Prevention Mode** (`SecRuleEngine On`): Blocks detected attacks with HTTP 403.

Use detection mode to analyze request patterns before switching to prevention.

## Custom Rules

Add custom rules in the ModSecurity config file:
```
SecRule ARGS "hack" phase:1,log,deny,status:403,id:1
```

## Removing/Disabling Rules

To disable a specific rule (e.g., rule 960017 — "Host header is numeric IP"):
```
SecRemoveRuleByID 960017
```

This approach can also be used to remove the commonly-triggered rules 949110 and 980130.

To whitelist a range:
```
SecRuleRemoveById 960000-960010
```

## Windows Event Log Format

**Blocked requests** (Prevention mode) → level **Error** in Windows Application Logs

**Detected requests** (Detection mode) → level **Warning** in Windows Application Logs

Example blocked XSS:
```
[client 0.0.0.0] ModSecurity: Access denied with code 403 (phase 2). Pattern match "\\bdocument\\b..." 
at ARGS_NAMES. [id "958001"] [msg "Cross-site Scripting (XSS) Attack"] [severity "CRITICAL"]
```

## OWASP CRS Rule Sets Used

- CRS 2.2.9 (legacy)
- CRS 3.0 (current)

Rules are located in: `C:\Program Files\ModSecurity IIS\owasp_crs\base_rules\`
