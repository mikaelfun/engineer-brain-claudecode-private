---
title: "Network Packet Capture (PCAP) to Kusto Analysis Workflow"
source: onenote
sourceRef: "MCVKB/wiki_migration/======Net======/10.14[NET] How to convert and upload the Pcap to k.md"
product: networking
date: 2026-04-18
tags: [pcap, kusto, tshark, network trace, ADX, packet capture]
21vApplicable: true
---

# Network Packet Capture (PCAP) to Kusto Analysis Workflow

## Overview
Convert network packet captures (pcap/pcapng) to Kusto tables for KQL-based analysis. Useful for large captures where Wireshark filtering is slow.

## Prerequisites
- Free Azure Data Explorer (ADX) cluster: https://dataexplorer.azure.com/freecluster
- Azure Storage Account with SAS token (Container level, read/write/list permissions)
- PowerShell
- pcap2kusto.ps1 script from: https://github.com/qliu95114/demystify/tree/main/network/pcap2kusto

## Steps

1. **Create free Kusto cluster**
   - Go to https://dataexplorer.azure.com/freecluster
   - Note the Cluster URI

2. **Add cluster to Kusto Explorer**
   - Connect using the Cluster URI

3. **Prepare SAS token**
   - Create Azure Storage Account Container with SAS token
   - Permissions needed: read, write, list

4. **Convert and upload**
   ```powershell
   .\pcap2kusto.ps1 `
     -tracefolder c:\temp `
     -tracefile capture.pcapng `
     -csvfolder C:\temp `
     -kustoendpoint "https://<cluster>.kusto.windows.net/<database>;AAD Federated Security=True" `
     -kustotable pcaptest `
     -sastoken "<SAS_URL>" `
     -newtable
   ```

## Sample KQL Queries

```kql
pcaptest
| take 100
| extend aa = tolong(replace_string(frametime, '.', '')) / 1000
| extend TT = unixtime_microseconds_todatetime(aa)
| extend SourceCA = split(Source, ',')[countof(Source, ',')]
| extend DestCA = split(Destination, ',')[countof(Destination, ',')]
| extend ipidinner = split(ipid, ',')[countof(ipid, ',')]
| extend ipTTLInner = split(ipTTL, ',')[countof(ipTTL, ',')]
| project TT, DeltaDisplayed, SourceCA, DestCA, ipidinner, Protocol,
          tcpseq, tcpack, Length, Info, tcpsrcport, tcpdstport,
          udpdstport, udpsrcport, ipTTLInner, tcpFlags
```

### Key field notes
- For encapsulated traffic, use split to get inner IP/IPID/TTL only
- `frametime` needs conversion from string to microsecond-precision datetime
- `DeltaDisplayed` shows inter-packet timing

## Reference
- tshark samples: https://github.com/qliu95114/demystify/blob/main/network/tshark_samples.md
