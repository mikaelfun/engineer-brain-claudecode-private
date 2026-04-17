# Pcap to Kusto Conversion Guide

> Source: MCVKB/Net/10.14 | ID: networking-onenote-038 | Quality: guide-draft

## Purpose
Convert network packet capture (.pcap/.pcapng) files into Kusto tables for KQL-based analysis, enabling powerful filtering and correlation across large captures.

## Prerequisites
- Free Azure Data Explorer cluster: https://dataexplorer.azure.com/freecluster
- PowerShell script from GitHub: https://github.com/qliu95114/demystify/tree/main/network/pcap2kusto
- Azure Storage Account with SAS token (Container level, read/write/list permissions)

## Steps

1. **Create free ADX cluster** at https://dataexplorer.azure.com/freecluster and note the Cluster URI
2. **Add cluster to Kusto Explorer** (optional, for desktop querying)
3. **Run conversion script**:
   ```powershell
   .\pcap2kusto.ps1 `
     -tracefolder c:\temp `
     -tracefile <filename>.pcapng `
     -csvfolder C:\temp `
     -kustoendpoint "<cluster-uri>/McnetDatabase;AAD Federated Security=True" `
     -kustotable <table-name> `
     -sastoken "<storage-sas-url>" `
     -newtable
   ```
4. **Query in KQL**:
   ```kql
   <table-name>
   | take 100
   | extend aa = tolong(replace_string(frametime, '.', '')) / 1000
   | extend TT = unixtime_microseconds_todatetime(aa)
   | extend SourceCA = split(Source, ',')[countof(Source, ',')]
   | extend DestCA = split(Destination, ',')[countof(Destination, ',')]
   | extend ipidinnner = split(ipid, ',')[countof(ipid, ',')]
   | extend ipTTLInner = split(ipTTL, ',')[countof(ipTTL, ',')]
   | project TT, DeltaDisplayed, SourceCA, DestCA, ipidinnner, Protocol, tcpseq, tcpack, Length, Info, tcpsrcport, tcpdstport, udpdstport, udpsrcport, ipTTLInner, tcpFlags
   ```

## References
- tshark samples: https://github.com/qliu95114/demystify/blob/main/network/tshark_samples.md
