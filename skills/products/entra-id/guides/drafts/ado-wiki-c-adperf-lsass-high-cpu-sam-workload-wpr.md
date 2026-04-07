---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Data Analysis and Walkthroughs/SAM Workload (using WPR)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A+ADPERF%3A+Lsass+High+CPU%2FData+Analysis+and+Walkthroughs%2FSAM+Workload+(using+WPR)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Walkthrough of data analysis for SAM workload (using WPR)

**Summary**: This walkthrough guides you through investigating and analyzing data to diagnose high CPU usage caused by excessive SAM queries in LSASS. Uses WPR (Windows Performance Recorder) instead of legacy Xperf/Process Dumps approach.

## Symptoms

One Windows Server 2022 Standard Active Directory domain controller in a specific site experiences high CPU usage.

## AD Performance Diagnostic SDP / AD Data Collector Set

Check the Active Directory Data Collector Set report. Identify that LSASS consumed high CPU (e.g., 29.9%) and the load was coming from SAM workload.

## WPR Analysis

1. Load `WPR.etl` into Windows Performance Analyzer (WPA) and open CPU Usage (Sampled) graph
2. Confirm workload: `SamrEnumerateUsersInDomain` weighted most in CPU usage
3. The load is from RPC client (**OSF_SCALL** = server side of incoming RPC request)
4. Check `Active Directory.etl` using `ADPerf-AD.etl.wpaProfile` parsers (KB 5025960) to see top callers IP addresses

## Client Side Troubleshooting

1. Pick top caller IP and collect ADPERF script from that client machine (Scenario: `7: Source of DC Workload`)
2. Check `SDW.etl` using `ADPerf-LdapSamCli.wpaProfile` parsers (KB 5034035)
3. Identify the calling process PID from tasklist

## WMI Event Tracing

WMI ETL trace in `SamWMI.etl` reveals the query:
```
CWbemNamespace::ExecQueryAsync - BSTR Query = SELECT * FROM Win32_UserAccount Where LocalAccount = false
dwClientProcessID = 6072
```

Use `tasklist` to find process for that PID. Go back to WPR trace and check for that PID under System Activities > Processes to see what script/application is running.

## Cause

Load came from WMI calls triggered from running a PowerShell script (e.g., RunSAMWMI.ps1, RunSamr_nonThread.ps1).

## Resolution

After stopping the script execution, the CPU load decreased.

## Key Diagnostic Tools Summary

| Tool | Purpose |
|------|---------|
| AD Data Collector Set | Initial identification of SAM workload |
| WPR/WPA | CPU sampling to confirm SAM workload, identify caller IPs |
| ADPerf-AD.etl.wpaProfile | Parse AD ETL for top callers |
| ADPerf-LdapSamCli.wpaProfile | Client-side SDW.etl analysis |
| WMI ETL (SamWMI.etl) | Identify exact WMI query and calling process |
| tasklist | Map PID to process name |
