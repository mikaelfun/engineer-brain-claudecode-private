---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS Performance"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20Performance"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:** This article provides an overview and troubleshooting tips for AD LDS performance issues, including data gathering and diagnostic steps.

# Overview
Active Directory Lightweight Directory Services (AD LDS) instances run in a separate process called _dsamain.exe_, which is responsible for Lightweight Directory Access Protocol (LDAP) and authentication services. AD LDS performance issues usually manifest in cases where _dsamain.exe_ consumes high CPU or memory usage, unlike Active Directory (AD) that runs in _LSASS.EXE_. 

When multiple AD LDS instances are running on a single server, multiple _dsamain.exe_ processes can be found in Task Manager.

# Scoping

1. Is AD LDS able to authenticate user objects or user proxy objects?
2. Does AD LDS respond to normal queries?

If both of the above scoping questions are yes, refer to the AD performance troubleshooter.

# Data to Gather for AD LDS Performance Issues

Refer to the AD performance troubleshooter for information on what data should be gathered.

# Troubleshooting Tips

**UPDATE 20/09/2024** — Latest version of the AD Perf Data Collection Script is now collecting AD LDS performance logs:
- AD Diagnostic Logs of all the LDS instances on the server.
- Dumps of all the dsamain.exe process on the server.
- Network trace.
- Windows Performance Recorder (WPR).
- Event log of all LDS instances.
- gpresult.html, GroupPolicy.evtx, ipconfig.txt, lsasrv.dll, LsaTrace.etl, lsp.log, Netlogon.log, netstat.txt, nettrace.etl, samsrv.dll, SAMSRV.etl, System.evtx, tasklist.txt and more...

More information on how to download and use the script: [ADPERF: TOOLS: AD Perf Data Collection Script](https://internal.evergreen.microsoft.com/en-us/topic/d4959f71-e2bd-061e-4acd-a0b48c52d766)

1. **AD Diagnostic Logs**

2. Use `procdump` to collect multiple _dsamain.exe_ dumps:
   ```shell
   procdump.exe -ma dsamain.exe
   ```

3. Network trace:
   ```shell
   Netsh trace start capture=yes maxsize=1024 persistent=yes overwrite=yes traceFile=C:\nettrace.etl
   ```

4. Windows Performance Recorder (WPR) for OS 2016 or higher:
   ```shell
   WPR.exe -Start GeneralProfile -Start CPU
   ```

5. AD LDS field engineering log:
   ```
   HKLM\SYSTEM\CurrentControlSet\Services\%instanceName%\Diagnostics\
   ```

# Summary

1. AD diagnostics Perfmon log output.
2. _dsamain.exe_ dumps.
3. Double side network trace.
