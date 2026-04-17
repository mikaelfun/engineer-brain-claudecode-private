---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Debug with CDB and Windbg_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/GA/Debug%20with%20CDB%20and%20Windbg_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Summary

This TSG shows how to debug Windows Guest Agent or Extensions with the help of CDB.exe and Windbg.exe.

Sometimes, it can be tricky to attach to a Windows Service crashing right after startup. Windbg requires to "Attach to a process" and if you're not quick enough, then the process already exited when you click OK.

It can also be tricky if the child process (eg. extension process) is running as non-interactive.

The idea here is to show how to use Image File Execution Options to start the CDB debugger (command-line) with the child process, and then use Windbg to pilot the CDB debugger through a client/server session. Windbg is interactive and much more user-friendly than CDB.

## Prerequisites

1. Ensure you exhausted all other possible ways & troubleshooting. Confirm you followed the [Agents & Extensions workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022) correctly. Confirm with TA/PTA or EEE.
2. Get agreement from customer to disturb production. Attaching to a process is invasive and might need a maintenance window.
3. Install the Debugging Tools for Windows from https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk.

## HowTo

### Step 1: Configure Image File Execution Options

Run gflags.exe (should be in `C:\Program Files (x86)\Windows Kits\10\Debuggers\x64>`):

- Set the Image to the process name - don't forget the .EXE extension
- Set the Debugger as: `"c:\program files (x86)\windows kits\10\debuggers\x64\cdb.exe" -server npipe:pipe=DebugSession`

### Step 2: Verify Registry Setting

Check in registry that the setting has been applied:

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options
```

### Step 3: Start Client Windbg Session

The next time the process is started, it will run under control of CDB debugger (visible in Task Manager as CDB.exe alongside the debugged process).

Get the hostname and run:

```
"c:\program files (x86)\windows kits\10\debuggers\x64\windbg.exe" -remote npipe:server=<HOSTNAME>,pipe=DebugSession
```

### Step 4: Configure Event Filters

In Windbg: Debug menu → Event Filters → enable **C++ EH Exception** and **CLR Exception**.

### Useful Commands

- `g` — go (first command, as debugger is waiting)
- `qqd` — detach the server debugger cdb.exe without impacting process execution
- `.load C:\Windows\Microsoft.NET\Framework64\v4.0.30319\sos.dll` — load SOS
- `.chain` — verify SOS is loaded
- `.dump /ma C:\WindowsAzure\Logs\dump1.dmp` — take a dump
