---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/IDPS (IDS + IPS) Feature - Azure Firewall"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages/Azure%20Firewall/Features%20%26%20Functions/IDPS%20(IDS%20%2B%20IPS)%20Feature%20-%20Azure%20Firewall"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Overview

IDPS: https://docs.microsoft.com/en-us/azure/firewall/premium-features#idps
- Inspects traffic for malicious signatures at Layer 4 and Layer 7
- HTTPS inspection requires TLS inspection enabled
- Supports inbound and internal (East-West) traffic; internal traffic defaults to RFC1918

# Signatures
- Azure Firewall subscribes to a signature feed
- Search signatures using the "Signature" TAB under IDPS
- Customize rules to ALERT/ALERT+DENY/DISABLED

# IDS vs IPS (INTERNAL INFO ONLY)

## IDPS Alert Mode
- AZFW copies packet and sends to IDPS engine
- Original packet goes through regular filtering (no additional processing)
- No real latency impact; slight latency only when logging alerts

## IDPS Alert+Deny Mode
- No copy created; packet goes through engine inline for allow/deny decision
- Same packet may traverse IDPS multiple times (FTP with TLS: IDPS -> TLS -> IDPS -> decision)
- Significant performance degradation (~90% drop)

# Performance Impacts
- Alert-only: Minimal impact, close to IDPS-off performance
- Alert+Deny: Every packet through IDPS engine; ~90% performance drop
- Benchmarks: https://learn.microsoft.com/en-us/azure/firewall/firewall-performance

# IDPS Bypass List
- Will not send packets to IDPS engine for defined parameters
- WARNING: As of 4/28/2023, IDPS bypass is coverage bypass only, NOT full traffic bypass
- Packets still pass through IDPS engine (performance bottleneck remains)

# Private Ranges
- Override what is deemed inbound vs outbound for signature application
- Case 1: on-prem -> AZFW -> VNet: By default inbound (signatures 1,2,3). With private range defined for on-prem, treated as outbound (signatures 4,5,6)
- Case 2: DNAT Internet -> AZFW -> VNet: Always inbound

# Known Issues

## New signatures blocking legitimate traffic
Check firewall logs for signature matches. Options:
1. Disable specific signature if confirmed false positive
2. Create bypass list entry to allow traffic

# How to Test IDPS

## Using CURL
curl http://www.google.com -A "BlackSun" (or "Haxermen" if BlackSun doesn't trigger)

## Using NMAP
https://nmap.org/ - Intrusion detection scanning tool
