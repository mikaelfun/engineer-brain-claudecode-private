---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture a Network Trace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20a%20Network%20Trace"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Capture a Network Trace

## Overview
Various ways to capture network packet traces for IP, TCP, DNS, SSL/TLS and Auth protocol investigations.

## HAR Trace
**Platform:** Any OS, any browser
**Scenario:** Capture unencrypted HTTP traffic from browser

- Only captures browser HTTP traffic, not raw TCP packets
- Reference: https://aka.ms/browsertrace

## Fiddler Classic
**Platform:** Windows
**Scenario:** Unencrypted HTTP traffic from any WinInet requests

- Install from [telerik.com/fiddler](https://www.telerik.com/fiddler/fiddler-classic)
- For HTTPS: **Tools** → **Options** → **HTTPS** → check **Decrypt HTTPS traffic**
- Export: **File** → **Save** → **All Sessions**
- HTTP only, no raw TCP packets

## pktmon
**Platform:** Windows Server 2019+
**Scenario:** Built into OS, no installation needed

```cmd
pktmon filter add -i <IP ADDRESS>
pktmon start --etw
# ... reproduce issue ...
pktmon stop
```

Useful commands:
- `pktmon pcapng PktMon.etl` — convert to .pcapng for Wireshark
- `pktmon filter list` — view current IP filters
- `pktmon filter remove` — remove all filters
- `pktmon status` — current running status

## netsh
**Platform:** Windows 2016+

### Quick Capture
```cmd
netsh trace start capture=yes tracefile=c:\network_trace_%computername%.etl
# ... reproduce issue ...
netsh trace stop
```

Add `capturetype=both` if Hyper-V installed.

### Circular Buffer Trace (long-running)
```cmd
netsh trace start capture=yes maxsize=300 filemode=circular overwrite=yes IPv4.Address=10.10.10.10 tracefile=c:\network_trace_%computername%.etl
# ... wait for repro ...
netsh trace stop
```

Multiple IPs: `IPv4.Address=(157.59.136.1,157.59.136.11)`

## Netmon
**Platform:** Windows
**Download:** https://www.microsoft.com/download/details.aspx?id=4865

1. Run as Administrator → Select Networks → New Capture → Start
2. Reproduce problem
3. Stop → File → Save As (.cap format)

## Wireshark
**Platform:** Windows, MacOS, Linux
**Download:** https://www.wireshark.org/download.html

1. Run as Administrator → Select network interface → Capture → Start
2. Reproduce problem
3. Capture → Stop → File → Save As (.pcapng or .cap)

## tcpdump
**Platform:** Linux, MacOS

### Installation
- Ubuntu: `apt update && apt install tcpdump -y`
- Alpine: `apk update && apk add tcpdump`
- Linux App Service: set `WEBSITES_ENABLE_APP_SERVICE_STORAGE = true`

### Quick Capture
```bash
tcpdump -s0 -nvi any -w $HOSTNAME.`date +%F.%H.%M.%S.`TEST.pcap
# ... reproduce issue ...
# Ctrl+C to stop
```

### Filtered Capture (by IP)
```bash
tcpdump -s0 -i any src #.#.#.# -w trace.pcap
tcpdump -s0 -i any dst #.#.#.# -w trace.pcap
```

### Capture HTTP GET/POST
```bash
# GET requests
tcpdump -s 0 -A 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420'
# POST requests
tcpdump -s 0 -A 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x504f5354'
```

## Tips per Azure Service

### Azure App Service
- **Diagnose and solve problems** → **Diagnostic Tools** → **Collect Network Trace**
- For Kudu traces, download via VFS API: `https://xxx.scm.azurewebsites.net/api/vfs/site/wwwroot/trace.pcap`

### PaaS Cloud Services, IaaS VMs, VMSS
- Treat as standalone servers, RDP/SSH and use appropriate tools

### API Management
- CSS support team has tools to capture from APIM VMs; collaborate with PaaS Dev team

### Azure AKS
- Reference: [Capture TCP packets from a pod on AKS](https://learn.microsoft.com/troubleshoot/azure/azure-kubernetes/packet-capture-pod-level)

## Public Documentation
- [Wireshark](https://www.wireshark.org/)
- [Microsoft Network Monitor 3.4](https://www.microsoft.com/download/details.aspx?id=4865)
- [pktmon syntax](https://learn.microsoft.com/windows-server/networking/technologies/pktmon/pktmon-syntax)
- [netsh contexts](https://learn.microsoft.com/windows-server/networking/technologies/netsh/netsh-contexts)
