---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Data Collection/Data Collection for Lsass High CPU (Manual)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A+ADPERF%3A+Lsass+High+CPU%2FData+Collection%2FData+Collection+for+Lsass+High+CPU+(Manual)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ADPERF: LSASS High CPU Data Collection Guide (Manual)

## Option 1 - ADPERF Data Collection Script

Use KB 4344106: ADPERF: TOOLS: Domain Controller AD Perf Data Collection Script

## Option 2 - Manual Data Collection

If the ADPERF Data Collection Script is not possible, collect all logs SIMULTANEOUSLY:

### Setup Tools

- Network Monitor 3.4 (NetMon): https://www.microsoft.com/en-gb/download/details.aspx?id=4865
- ProcDump: https://technet.microsoft.com/en-us/sysinternals/dd996900.aspx
- WPT (XPERF) (optional): Download relevant version of Windows Performance Toolkit
  - For 2016: Windows 10 Update Version ADK
  - For 2012R2: Win 8.1 Update version SDK
  - Deselect everything except Windows Performance Toolkit

### Common Issues

KB 4470171: NT Kernel Logger is already in use - how to identify

### Start Logs (2008 R2 or later)

```batch
procdump -n 1 -c 50 -s 60 -ma lsass
logman start "system\Active Directory Diagnostics" -ets
nmcap /network * /capture /startwhen /timeafter 1 /stopwhen /timeafter 2 min /File LSASS_HighCPU1.cap
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics" /v "15 Field Engineering" /t REG_DWORD /d 5 /f
xperf -on base+latency+dispatcher+NetworkTrace+Registry+FileIO -stackWalk CSwitch+ReadyThread+ThreadCreate+Profile -BufferSize 128 -start UserTrace -on "E5BA83F6-07D0-46B1-8BC7-7E669A1D31DC+Microsoft-Windows-Security-Kerberos+63B530F8-29C9-4880-A5B4-B8179096E7B8+2F07E2EE-15DB-40F1-90EF-9D7BA282188A" -BufferSize 1024 -MinBuffers 64 -MaxBuffers 128 -MaxFile 1024
```

### Stop Logs

```batch
xperf -stop -stop UserTrace -d HighCPU.etl
logman stop "system\Active Directory Diagnostics" -ets
reg add "HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Diagnostics" /v "15 Field Engineering" /t REG_DWORD /d 0 /f
```

### Expected Data

- HighCPU.etl
- AD Data Collector Set result (Default: C:\Perflogs\ADDS\###)
- Lsass.exe dumps
- LSASS_HighCPU.cap
- Directory Service event logs

### Important Notes

- KB 2999683: AD Data Collector Set ETL files may be deleted if log size limit exceeded (default 1 GB)
- All logs/traces should run SIMULTANEOUSLY
- Collect Directory Service, Application, System, and Security event logs
- Remote collection: `logman -s servername start system\Active Directory Diagnostics -ets`

### Troubleshooting Sessions

ADPERF Troubleshooting Sessions: http://aka.ms/adperfninja
Lesson 1 & 2: Overview, Scoping and Data Collection
