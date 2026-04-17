# Collecting Host Monitoring Agent Logs

## Overview
When host metrics show dotted line (missing data), PG requires monitoring agent logs from the host node. Logs are only kept ~24 hours on nodes, so collect promptly.

## Method 1: Download via Jarvis
1. Browse to Jarvis: `https://jarvis-west.dc.ad.msft.net/881A73F6`
2. Filter by host node IP (obtainable from ASC)
3. Download files `MaMetricsExtensionEtw*.tsf` from `C:\Resources\MonitoringStore\Tables\`
4. Enable diagnostics setting on a Windows VM
5. Copy `C:\Packages\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics\<version>\monitor\x64\` from Windows VM
6. Run `table2csv.exe MaMetricsExtensionEtw.tsf` to convert to CSV
7. Share CSV with PG in ICM

## Method 2: Direct Host Node Access
1. Apply for escort session (see Console through escort session guide)
2. Navigate to `C:\Resources\MonitoringStore\Tables\` on host node
3. Copy `MaMetricsExtensionEtw*.tsf` to temp location
4. Convert on node: `D:\Packages\<AgentPackage>\MonitoringAgent\table2csv.exe <TempPath>\MaMetricsExtensionEtw.tsf`
5. Download the resulting CSV and share with PG

## Source
- OneNote: MCVKB/VM+SCIM/7.6
