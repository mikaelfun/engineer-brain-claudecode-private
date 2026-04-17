---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/App Gateway Packet Capture via ASC and Retrieval (Renewed)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FApp%20Gateway%20Packet%20Capture%20via%20ASC%20and%20Retrieval%20%28Renewed%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway Packet Capture via ASC and Retrieval (Renewed)

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

## Starting a Packet Capture

| Field | Description |
|-------|-------------|
| All or Specific Target Instances | `all` or comma-separated names (e.g., `appgw_0,appgw_4,appgw_6`) |
| Operation Name | `Start Packet Capture` |
| Packet Capture Time Limit (seconds) | Keep minimal — affects disk usage and upload time |
| Protocol | `TCP` (default); `Any` for UDP/DNS |
| Filters | Use IP/port filters to minimize capture size ([syntax](https://learn.microsoft.com/rest/api/network-watcher/packet-captures/create?tabs=HTTP#packetcapturefilter)) |

> ⚠️ **Known Bug 153524:** AppGW packet capture filters not applying — capture unfiltered and filter post-collection if filters don't work.

## Retrieving the Capture — Jarvis Action Method (Renewed)

### Step 1: File JIT IcM
Via ASC form **TA JIT Request (ID: U3fb24)** → acknowledge in IcM → mitigate after retrieval.

### Step 2: Request JIT Access (from SAW)
Go to [JIT Access Portal](https://jitaccess.security.core.windows.net/):
- WorkItem Source: ICM
- WorkItem ID: \<IcM number>
- Operations Category: External Customer Raised Incident
- Justification: "Application Gateway packet capture retrieval"
- **Resource Type: ACIS**
- **Instance: Production**
- **Scope: NetworkAnalytics**
- **AccessLevel: CustomerServiceViewer**

**JIT approvers:**
- AME\TM-NET-EEETA
- GME\TM-AZCTS
- GME\TM-AZCTS-DP

### Step 3: Retrieve via Jarvis Action

1. Navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/)
2. Use Get Appgw Jarvis Action: `https://jarvis-west.dc.ad.msft.net/9958B9D1?genevatraceguid=d5af1f33-3279-447a-933e-1e24d56e9240`
3. Provide AppGw Resource ID and Region
4. Download the pcap file from the NetworkAnalytics blob storage

---

## Notes
- Retrieve capture **after** the time limit has elapsed, or use **Force Stop Packet Capture** to abort early
- From the result URL: first highlighted part = storage account name; second = blob name
- Use Wireshark or similar tool to analyze the pcap
