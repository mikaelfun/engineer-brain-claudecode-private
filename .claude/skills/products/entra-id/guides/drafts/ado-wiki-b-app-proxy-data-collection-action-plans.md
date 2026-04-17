---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Action Plan Templates for Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Action%20Plan%20Templates%20for%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Action Plan Templates for Data Collection

## Data Collector Script (MEPNCv33)

The Data Collector Script collects all data required for troubleshooting on the connector server:

- Registry keys (SCHANNEL, WinHTTP)
- Application Proxy service trace, Connector trace
- Network Capture, network configuration (IPCONFIG /ALL etc.)
- Extended Traces (WinHttp, Schannel, DCLoc, Kerberos/Ntlm)
- Eventlogs (System, Security, Application, App Proxy related, CAPI)
- Certificates, Group policy result, Patch level

### Script switches:
| Switch | Description |
|--------|-------------|
| `-ServiceTraceOn` | Collect service trace (restarts service!) |
| `-Perfmon` | Log performance counters (CPU, memory, App Proxy) |
| `-JustOn` | Start service trace only, no data collection |
| `-JustOff` | Stop service trace only, no data collection |
| `-FullSecLog` | Collect whole security log |
| `-GSA` | Collect data for Global Secure Access - Private Access |
| `-BPA` | Best practice analyzer for the connector |
| `-Privacy` | Display privacy information |

### Important notes:
- If NOT a local issue limited to a specific connector, run the script **simultaneously on all active connectors** within the connector group
- Additionally collect a **Fiddler trace** or browser HAR on the client machine
- Ensure at least **8 GB free disk space** for tracing
- Do not kill or force stop the script

### Steps:
1. Create folder (e.g., C:\tracing), extract MEPNCv33.zip
2. Unblock all extracted files (File Explorer > Properties > Unblock)
3. First run `-BPA` to check and fix issues
4. Open elevated PowerShell (NOT ISE), navigate to folder, run `.\MEPNCv33.ps1`
5. Use absolute path (e.g., "C:\tracing" not ".\tracing")
6. Hit any key to start/stop capture
7. Reproduce the issue quickly
8. Upload compressed data to workspace

## Fiddler

1. Flush browser cache (IE > Tools > Internet Options > Delete Temp Files)
2. Restart IE, start Fiddler
3. Enable HTTPS decrypt: Tools > Fiddler Options > HTTPS > Decrypt HTTPS traffic
4. Reproduce issue
5. Stop capture (F12), save as .saz file

## Browser Developer Tools / HAR

Follow: https://docs.microsoft.com/azure/azure-portal/capture-browser-trace

## Edge/Chrome Net-Export

1. Navigate to `edge://net-export/` or `chrome://net-export/`
2. Select "Include raw bytes"
3. Click "Start Logging to Disk"
4. Reproduce issue in another tab
5. Stop logging, save JSON file

## NETSH TRACE (Network + WinHTTP)

```cmd
netsh trace start scenario=InternetClient_dbg capture=yes
ipconfig /flushdns
:: Reproduce issue
netsh trace stop
```

## Flush Kerberos Cache on Connector

```powershell
Get-WmiObject Win32_LogonSession | Where-Object {$_.AuthenticationPackage -ne 'NTLM'} | ForEach-Object {klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
```

## Loopback Adapter Tracing (Wireshark)

1. Install latest Wireshark
2. Capture on "Adapter for loopback traffic capture"
3. Reproduce issue, stop and save

## AppProxyTrace (also works for WAP 2012R2/2016)

```cmd
AppProxyTrace.cmd -start -noise
:: Reproduce issue
AppProxyTrace.cmd -stop
```
Log at: `%windir%\debug\AppProxylog.bin`. Convert with Insight Client.

## Eventlog Tracing (Connector)

```cmd
wevtutil set-log "Microsoft-AadApplicationProxy-Connector/Session" /enabled:false /quiet
wevtutil set-log "Microsoft-AadApplicationProxy-Connector/Session" /ms:40000000
wevtutil set-log "Microsoft-AadApplicationProxy-Connector/Session" /enabled:true /l:5 /quiet
:: Reproduce issue
wevtutil set-log "Microsoft-AadApplicationProxy-Connector/Session" /enabled:false /quiet
wevtutil export-log "Microsoft-AadApplicationProxy-Connector/Session" C:\%COMPUTERNAME%-Connector.evtx /ow:true
```

## Eventlog Tracing (Updater)

```cmd
wevtutil set-log "Microsoft-AadApplicationProxy-Updater/Session" /enabled:false /quiet
wevtutil set-log "Microsoft-AadApplicationProxy-Updater/Session" /ms:40000000
wevtutil set-log "Microsoft-AadApplicationProxy-Updater/Session" /enabled:true /l:5 /quiet
:: Reproduce issue
wevtutil set-log "Microsoft-AadApplicationProxy-Updater/Session" /enabled:false /quiet
wevtutil export-log "Microsoft-AadApplicationProxy-Updater/Session" C:\%COMPUTERNAME%-Updater.evtx /ow:true
```

## Crash Dump Collection

Registry key: `HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps\MicrosoftEntraPrivateNetworkConnectorService.exe`
- `DumpFolder` (REG_EXPAND_SZ): C:\DUMP
- `DumpCount` (REG_DWORD): 10
- `DumpType` (REG_DWORD): 2

## High CPU - Procdump

```cmd
procdump.exe -accepteula -ma <PID> -c 90 -n 3 -s 7 > Monitoring-log.txt
```
Creates 3 dumps at 7s intervals when CPU > 90%.

## High CPU - PerfView

```cmd
perfview collect /accepteula /nogui /InMemoryCircularBuffer /ThreadTime "/StopOnPerfCounter=Process:% Process Time:ApplicationProxyConnectorService>95"
```
