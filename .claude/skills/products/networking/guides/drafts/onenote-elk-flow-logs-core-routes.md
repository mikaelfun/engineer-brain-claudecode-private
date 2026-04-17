# ELK Flow Logs on Mooncake Core Routes

> Source: MCVKB/Net/10.19 | ID: networking-onenote-043 | Quality: guide-draft

## Purpose
Query network flow logs (everflow data) on Mooncake core routes via ELK server for cross-cloud connectivity analysis, GFW blocking verification, and DDoS traffic pattern investigation.

## Typical Scenarios
- IPsec VPN not established between public Azure and China Azure
- Cannot connect PaaS service endpoints on Mooncake from public Azure/global Internet
- China Azure resources cannot access third-party endpoints on global Internet
- DDoS traffic pattern analysis (Mooncake has no DDoS dashboard)
- Network connectivity from China mainland to Mooncake

## ELK Access

### Access Method
- **Recommended**: CME direct access (no escort needed)
- **Alternative**: Escort JIT session (see onenote-vnet-get-escort-jit.md)
- Note: VMSS-based jumpboxes may not have ELK URL bypassed; request jumpbox named `*AZUTLA05/06`

### Login Info
- ELK URL: `10.43.15.234:5601`
- Shared account: `ms-guest` / `02eqzuZY`

## Usage

### 1. Navigate to Visualize
Select predefined templates by region and ISP:
- BJB (Beijing) templates with ISP names
- SHA (Shanghai) templates with ISP names
- Match template to traceroute result ISP

### 2. Default Setup
Templates include everflow source IP and WAN interface index. Add custom filters:
- Source IP address
- Destination IP address
- Time range selection

### 3. Advanced Analysis
Add split rows for port information to get 5-tuple flow details.

## Important Tips
- ELK stores everflow data for **past 6 months** (storage limited)
- **Narrow down timestamps** to avoid overloading
- **Do NOT launch multiple filter tasks simultaneously** - system will crash
- Compare outbound vs inbound flow to determine blocking direction

## Analysis Pattern
1. Check outbound flow (Azure -> ISP): packets leaving datacenter to ISP
2. Check inbound flow (ISP -> Azure): return packets
3. If outbound present but no inbound → ISP/GFW blocking in return path
4. If no outbound → blocking at Azure edge or ISP outbound
