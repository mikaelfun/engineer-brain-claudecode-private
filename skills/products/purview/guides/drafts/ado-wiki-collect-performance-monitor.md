---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/How to capture logs & traces/How to collect Performance Monitor"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FHow%20to%20capture%20logs%20%26%20traces%2FHow%20to%20collect%20Performance%20Monitor"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect Performance Monitor Logs

## When to Use
Out-Of-Memory errors or need to track resource usage in Windows server (e.g., SHIR machine).

## Steps
1. Start command prompt as Administrator
2. Create collector (max 500MB, 1-second interval):
```cmd
Logman.exe create counter Perf-1Second -f bincirc -max 500 -c "\LogicalDisk(*)\*" "\Memory\*" "\Network Interface(*)\*" "\Paging File(*)\*" "\PhysicalDisk(*)\*" "\Server\*" "\System\*" "\Process(*)\*" "\Processor(*)\*" "\Processor Information(*)\*" "\Cache\*" -si 00:00:01 -o C:\PerfMonLogs\Perf-1Second.blg
```
3. Start collection: `Logman start Perf-1Second`
4. Reproduce the issue
5. Stop collection: `Logman stop Perf-1Second`
6. Collect the .blg file from C:\PerfMonLogs\
