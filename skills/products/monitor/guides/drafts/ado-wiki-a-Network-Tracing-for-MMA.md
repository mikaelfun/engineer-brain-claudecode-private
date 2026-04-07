---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Network Tracing for MMA and Upgrade Readiness"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FNetwork%20Tracing%20for%20MMA%20and%20Upgrade%20Readiness"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Network Tracing for MMA and Upgrade Readiness

Applies to: Microsoft Monitoring Agent version 10.20.18001 & Above

## Three Methods for Network Trace Capture

### Method 1: Netsh (Built-in, No Installation Required)

**Start capture:**
```cmd
netsh trace start scenario=netconnection capture=yes overwrite=yes report=yes tracefile=omsconnection.etl
```

**Stop capture:**
```cmd
netsh trace stop
```

**Output files:** `omsconnection.etl` + `omsconnection.cab` (CAB contains ETL + additional debug data)

**Decode ETL:**
1. Download Microsoft Message Analyzer: https://www.microsoft.com/download/details.aspx?id=44226
2. Open ETL file, wait for parsing ("Ready" in status bar)
3. Filter for Ethernet traffic: type `Ethernet` in filter window → Apply
4. Select all events (Ctrl+A) → File → Save As → "Selected Messages" → Export as Network Monitor Capture file
5. Open exported file in Network Monitor or Wireshark

### Method 2: Microsoft Network Monitor 3.1 OneClick

1. Download from: https://www.microsoft.com/download/details.aspx?id=6537
2. Choose `OneClick_Autorun.exe`
3. Run, accept license, follow on-screen directions
4. View trace with Netmon or Wireshark

### Method 3: Wireshark

1. Download from: https://www.wireshark.org/download.html
2. Install with npcap (included in installer). USBpcap not needed.
3. Capture → Options → select correct network interface
   - Use `ipconfig /all` to identify correct adapter if many interfaces listed
4. Start capture → reproduce issue → Stop
5. Save As → Microsoft Network Monitor 2.x format (readable by both Netmon and Wireshark)

## Detecting SSL Inspection

### Quick Analysis with Wireshark

1. Open trace in Wireshark
2. Filter: `tls` (lowercase)
3. Look for **Client Hello** from client system — if HTTPS/SSL inspection is active, the destination will be an internal network address, not an Internet address
4. Check **Server Hello** — if coming from an internal IP, SSL inspection is confirmed

### Certificate Verification

Filter: `tls.handshake.certificate contains "microsoft"`

Expand packet details and inspect certificate chain:

- **Normal (no inspection)**: Certificate issuer is Microsoft (e.g., `Microsoft IT TLS CA`)
- **SSL inspection detected**: Issuer is proxy/firewall vendor (e.g., `CA Intermediaria Itau Proxy`)

**Impact**: SSL inspection on Microsoft monitoring endpoints prevents MMA and Windows Telemetry from uploading data to Log Analytics workspace.

**Resolution**: Configure proxy/firewall to bypass SSL inspection for:
- `*.ods.opinsights.azure.com`
- `*.oms.opinsights.azure.com`
- `*.blob.core.windows.net`
- `*.azure-automation.net`
- `*.events.data.microsoft.com`
