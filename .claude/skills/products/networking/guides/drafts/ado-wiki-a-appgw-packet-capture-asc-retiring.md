---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/App Gateway Packet Capture via ASC (Retiring Dec 2025)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FApp%20Gateway%20Packet%20Capture%20via%20ASC%20%28Retiring%20Dec%202025%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway Packet Capture via ASC (For v2 SKU) — RETIRING DEC 2025

> ⚠️ **NOTE: Capture retrieval is only working from AME tenancy (as of November 5th, 2024). This tool is retiring Dec 2025 — use the renewed version instead.**

[[_TOC_]]

## Requirements

**Starting a capture:**
- ASC Access
- Desired IP and port information

**Retrieving a capture:**
- ASC Access
- A physical SAW
- AME or GME credentials (TAs only for AME)
- Membership in appropriate AME/GME security groups

## Overview

Tool location: ASC Resource Explorer → Application Gateway resource → **Diagnostics** tab → "Application Gateway Packet Capture (For v2 SKU)"

Packet Capture is a two-step operation:
1. **Start Packet Capture** — triggers capture on instance(s)
2. **Get Packet Capture Result** — retrieves pcap file links after time limit elapses

## Form Fields

| Field | Description |
|-------|-------------|
| All or Specific Target Instances | `all` or comma-separated instance names (e.g., `appgw_0,appgw_4`) |
| Operation Name | `Start Packet Capture` / `Get Packet Capture Result` / `Force Stop Packet Capture` |
| Packet Capture Time Limit (seconds) | Keep minimal; larger = more disk space/upload time |
| Protocol | `TCP` (default, covers HTTP/S); `Any` includes UDP/DNS |
| Filters | IP/port filters ([syntax](https://learn.microsoft.com/rest/api/network-watcher/packet-captures/create?tabs=HTTP#packetcapturefilter)) |

> ⚠️ **Known Bug:** Packet capture filters may not apply (Bug 153524). Capture unfiltered and filter post-collection if needed.

## Retrieving the Capture

Due to security requirements, direct download is disabled. From the result URL:
1. Note the **storage account name** (first highlighted part)
2. Note the **blob name** (second highlighted part)

### JIT Process

1. File a JIT IcM via ASC form **TA JIT Request (ID: U3fb24)**
2. Go to [JIT Access Portal](https://jitaccess.security.core.windows.net/) from SAW
3. Submit Request:
   - WorkItem Source: ICM
   - Operations Category: External Customer Raised Incident
   - Justification: "Application Gateway packet capture retrieval"
   - Access needed: **Reader** on subscription + **Storage Blob Data Reader** on storage account

4. Mitigate/resolve the JIT IcM after retrieval
