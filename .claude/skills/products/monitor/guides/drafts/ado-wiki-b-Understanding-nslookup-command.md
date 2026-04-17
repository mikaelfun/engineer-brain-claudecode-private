---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Networking/Network Connectivity/Understanding the nslookup command"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Networking/Network%20Connectivity/Understanding%20the%20nslookup%20command"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding the nslookup command for Application Insights

## Overview

The output of the "nslookup" command can be a little daunting at first. However, if we break things down, we'll be able to understand every section and approach support investigations more confidently.

## Understanding nslookup output

### IP addresses

We see two distinct IP addresses in nslookup output:
- **DNS Server address** (e.g., 192.168.50.1): The IP address of the DNS server that delivered the response.
- **Resolved address** (e.g., 52.179.73.34): The IP address of the domain name that was resolved — our answer.

### Aliases (CNAME chain)

The different aliases represent a chain of multiple CNAMEs that ultimately resolve to the public IP address (Type A record). This chain exists in part due to AMPLS.

The chain works as follows: whenever a VM attempts to resolve one of the regional ingestion endpoints in Application Insights, it will hop across each of these CNAMEs until it finally gets the IP address from the `*.cloudapp.azure.com` domain name.

### AMPLS impact on DNS resolution

Consider a scenario where AMPLS (Azure Monitor Private Link Scope) is in effect:
- The resolution process starts the same way, going through the CNAME chain
- However, because of the private DNS zones that exist for AMPLS, we take a shortcut
- `*.privatelink.monitor.azure.com` delivers the IP address instead of `*.cloudapp.azure.com`
- This allows web apps to send telemetry to Application Insights using **private IP addresses** through Private Link

**Diagnostic approach:**
- Without AMPLS: resolution goes through `*.cloudapp.azure.com` → public IP
- With AMPLS: `*.privatelink.monitor.azure.com` → private IP
- Use [mxtoolbox.com/SuperTool](https://mxtoolbox.com/SuperTool.aspx) for external DNS chain validation

## Public Documentation
- [What is a DNS CNAME record?](https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/)

---
_Created by: nzamoralopez, Dec 12th, 2023; Last Modified: Nov 27th, 2024_
