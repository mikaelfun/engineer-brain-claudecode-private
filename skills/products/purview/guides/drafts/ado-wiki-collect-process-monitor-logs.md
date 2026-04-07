---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/How to capture logs & traces/How to collect Process Monitor Logs"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FHow%20to%20capture%20logs%20%26%20traces%2FHow%20to%20collect%20Process%20Monitor%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect Process Monitor Logs (SHIR)

## When to Use
System.IO.FileLoadException in SHIR logs, e.g.:
> System.IO.FileLoadException: Could not load file or assembly 'Newtonsoft.Json, Version=11.0.0.0' ... The located assembly's manifest definition does not match the assembly reference. (Exception from HRESULT: 0x80131040)

## Steps
1. Download Process Monitor (https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), unzip on SHIR machine
2. Start Process Monitor (events captured automatically)
3. Reproduce by re-running the scan on SHIR
4. Once scan fails, save the log file (default PML format)
5. Share the log file for analysis
