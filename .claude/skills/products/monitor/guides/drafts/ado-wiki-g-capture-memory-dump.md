---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture a Memory Dump"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20a%20Memory%20Dump"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Capture a Memory Dump

## Overview
Various methods to collect a memory dump of a process for investigating crashes, hangs, slow performance, high CPU, or memory leaks.

## App Service or Function Apps

### Diagnose and Solve
- Requires specific App Service tier
- **Diagnose and solve problems** → **Diagnostic Tools** → **Collect Memory Dump**
- Pick specific VM instance → **Collect MemoryDump** → saves to storage account
- Also available: Java Memory Dump, Java Thread Dump, profiler traces

### Kudu Process Explorer
- **Advanced Tools** → Kudu → **Process Explorer**
- Right-click `w3wp.exe` (NOT the "scm" instance) → **Download Memory Dump** → **Full Dump**

### SysInternals procdump
- Identify PID from Kudu Process Explorer
- Debug console → CMD:
  ```
  cd LogFiles
  md dumps
  cd dumps
  d:\devtools\sysinternals\procdump -accepteula -ma ####
  ```
  (devtools may alternate between c:\ and d:\ drive)

### dotnet-dump (Linux App Services / AKS)
- SSH into Linux App Service
- `ps aux | grep dotnet` to identify the process
- ```
  cd /home/LogFiles
  dotnet-dump collect -p [process-id] --type Full --diag
  ```
- Types: Full (all memory), Heap (modules+threads+stacks+exceptions+handles+memory), Mini (modules+threads+exceptions+stacks)

## IaaS, VMSS, PaaS Cloud Service, On-premises (Windows)

### Task Manager
1. Open Task Manager → **Details** tab
2. Identify target process (dotnet.exe or w3wp.exe)
   - Use Username or Command Line column to distinguish multiple w3wp.exe instances
   - For 32-bit app pools: use 32-bit Task Manager at `c:\windows\syswow64\Taskmgr.exe`
3. Right-click → **Create dump file**
4. Dump written to `%TEMP%` directory (e.g., `C:\Users\username\AppData\Local\Temp\w3wp.dmp`)

## Memory Leaks

### Managed memory leaks (.NET)
1. Capture baseline dump shortly after process restart (low memory state)
2. Let application leak memory (may take minutes to days; look for leaks of several GBs)
3. Capture another dump of the **same PID** when memory is high (before OOM exceptions)
4. Compare allocated objects between dumps
5. Engage TA or EEE for root cause analysis

### Unmanaged memory leaks (C/C++)
1. Restart application to start from low memory state
2. Configure DebugDiag **Memory and Handle Leak** collection rule → attach to process
3. Wait for substantial memory leak (100s of GB)
4. In DebugDiag → **Processes** tab → right-click exe → **Create Full Userdump**
5. Run DebugDiag auto-diagnostics against the leaktrack dump
6. Engage TA or EEE for review

## Public Documentation
- [Sysinternals Utilities Index](https://learn.microsoft.com/sysinternals/downloads/)
- [Azure App Service diagnostics overview](https://learn.microsoft.com/azure/app-service/overview-diagnostics)
- [Capture a user-mode memory dump](https://learn.microsoft.com/troubleshoot/azure/app-service/web-apps-performance-faqs#how-do-i-capture-a-user-mode-memory-dump-of-my-web-app)
