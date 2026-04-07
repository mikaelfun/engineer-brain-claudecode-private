---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Tools/ADPerf: Diagnostic Collection Tools/Manual Collection: XPERF Resources"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Tools%2FADPerf%3A%20Diagnostic%20Collection%20Tools%2FManual%20Collection%3A%20XPERF%20Resources"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ADPERF: Tools: Xperf resources

Troubleshooting high CPU utilization in LSASS on a Domain Controller using Server Performance Advisor (SPA), Message Analyzer (MA/PEF), and Windows Performance Toolkit (WPT/Xperf).

### Reference links

- WPR/Xperf capture (high CPU, disk I/O, file, registry, networking, private bytes, virtual bytes, paged pool, non-paged pool, application slowness): https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/becoming-an-xperf-xpert-part-7-slow-profile-load-and-our-very/ba-p/256901
- Troubleshooting SQL Server high CPU usage using Xperf (still applicable): https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/troubleshooting-sql-server-high-cpu-usage-using-xperf/ba-p/370404

### Commands and Procedures

```bash
# Collect LSASS dump when CPU > 80%
procdump -n 3 -c 80 -s 60 -ma lsass
```

```bash
# Start Xperf trace with AD-related ETW providers
xperf -on base+latency+dispatcher+NetworkTrace+Registry+FileIO -stackWalk CSwitch+ReadyThread+ThreadCreate+Profile -BufferSize 128 -start UserTrace -on "E5BA83F6-07D0-46B1-8BC7-7E669A1D31DC+Microsoft-Windows-Security-Kerberos+63B530F8-29C9-4880-A5B4-B8179096E7B8+2F07E2EE-15DB-40F1-90EF-9D7BA282188A" -BufferSize 1024 -MinBuffers 64 -MaxBuffers 128 -MaxFile 1024
```

```bash
# Collect network connection state
netstat -anob > %computername%_netstat-anob.txt
```

```bash
# Start AD Diagnostics collector
logman start "system\Active Directory Diagnostics" -ets
```

```bash
# Stop Xperf trace and merge
xperf -stop -stop UserTrace -d HighCPU.etl
```
