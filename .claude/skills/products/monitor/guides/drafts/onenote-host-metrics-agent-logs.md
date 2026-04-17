---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======10. Monitor=======/10.8 [Host Metrics] How to get monitoring agent lo.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Host Metrics — How to Get Monitoring Agent Logs on Host Node

## Method 1: Download from Jarvis

1. Browse to Jarvis: https://jarvis-west.dc.ad.msft.net/881A73F6
2. Find the host node by filtering host node IP (obtainable from ASC)
3. Go to folder `C:\Resources\MonitoringStore\Tables\` and download files named `MaMetricsExtensionEtw*.tsf`

### Converting TSF to CSV

4. Enable **diagnostics setting** on a Windows VM
5. Copy the folder `C:\Packages\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics\<version>\monitor\x64\` from the Windows VM to your working machine
6. Execute: `<PATH>\table2csv.exe MaMetricsExtensionEtw.tsf`
7. A CSV file will be created in the same path as the TSF — share with PG in IcM

## Method 2: Log onto Host Node Directly

1. Apply for an escort session (see Console through escort session guide)
2. Go to `C:\Resources\MonitoringStore\Tables\` on the host node
3. Copy `MaMetricsExtensionEtw*.tsf` to a temp location
4. Convert directly on node: `D:\Packages\<AgentPackage>\MonitoringAgent\table2csv.exe <TempPath>\MaMetricsExtensionEtw.tsf`
5. Download the resulting CSV to your working machine and share with PG
