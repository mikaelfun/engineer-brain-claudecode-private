---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Agent Crashing_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FGA%2FAgent%20Crashing_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Agent Crashing - Investigation Guide

This TSG covers how to investigate a crash of the Windows Guest Agent or an extension.

## Scenarios

In the case of Windows Guest Agent or an extension crashing *(ie. failing ungracefully without an explicit error)*, it might be useful to collect a dump of the process to understand why the exception is thrown and what were the circumstances that led to it.

### How to identify a crash of Guest Agent or Extension?

- When the process hosting the Guest Agent (WaAppAgent.exe / WindowsAzureGuestAgent.exe) or the extension (JsonAdDomainExtension.exe....) suddenly disappears - and doesn't log anything
- When you look into the Application Event Log and see something like:

```
Faulting application name: WaAppAgent.exe, version: 2.7.41491.949, time stamp: 0x5d93c2b8
Faulting module name: msvcrt.dll, version: 7.0.7601.17744, time stamp: 0x4eeb033f
Exception code: 0x40000015
Fault offset: 0x000000000002a84e
Faulting process id: 0x1acc
Faulting application path: C:\WindowsAzure\Packages\WaAppAgent.exe
Faulting module path: C:\Windows\system32\msvcrt.dll
```

- When an exception is logged with a call stack in the Agent/Extension logs, like:

```
[ERROR] InstallPlugins() failed with exception: System.AggregateException: One or more errors occurred.
---> System.BadImageFormatException: An attempt was made to load a program with an incorrect format.
(Exception from HRESULT: 0x8007000B)
```

or

```
[ERROR] RdCrypt Initiailization failed. Error Code: -2147023143.
[ERROR] Failed to get TransportCertificate. Error: System.AccessViolationException
```

## TSG 1 - Collect a dump when the process crashes

### Download & install procdump

Procdump can be downloaded from https://docs.microsoft.com/en-us/sysinternals/downloads/procdump

### Execute procdump

Setup procdump to be the Just-in-Time debugger (AeDebug) on the VM:

1. Create a folder **C:\dumps** on the VM
2. From elevated CMD:
   ```
   procdump.exe -accepteula -ma -i c:\dumps
   ```
3. Once dumps collected, uninstall procdump:
   ```
   procdump.exe -u
   ```

### Case sample - Steps for Guest Agent installation issue

1. `md c:\dumps`
2. Download the [VM Agent MSI](https://go.microsoft.com/fwlink/?LinkID=394789) to c:\dumps
3. Download [Procmon](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon) and extract to c:\dumps
4. Download [Procdump](https://docs.microsoft.com/en-us/sysinternals/downloads/procdump) and extract to c:\dumps
5. Set procdump as JIT debugger: `procdump.exe -accepteula -ma -i c:\dumps`
6. Start a Procmon trace
7. Install the MSI: `msiexec.exe /i c:\dumps\WindowsAzureVmAgent.msi /quiet /L*v c:\dumps\msiexec.log`
8. Try to start VM agent services: `sc start rdagent` and `sc start WindowsAzureGuestAgent`
9. Stop Procmon trace and save as PML
10. Zip PML, msiexec.log, any *.dmp files, and service output

## TSG 2 - Live debug an interactive process

### Download & install windbg

Download from https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/debugger-download-tools

### Start debugging session

1. Start windbg, F6 or File > Attach to a process
2. Select the faulting process
3. Press OK, then type "g" to run
4. Setup public symbols: `.sympath SRV*https://msdl.microsoft.com/download/symbols`
5. Reload: `.reload /f`
6. On exception, use "kp" for call stack, "r" for registers
7. Collect dump: `.dump /ma c:\temp\processdump.dmp`

## TSG 3 - Live debug non-interactive / early-crashing process

For processes crashing too quickly to attach:
- Use ImageFileExecutionOptions to auto-attach debugger on process start
- May require 2 debuggers (server CDB + client Windbg)

## TSG 4 - Capturing TTD of the process

TTD (Time Travel Debugging) records every instruction for replay analysis.

1. Find PID: `tasklist | findstr WaAppAgent.exe`
2. Capture: `tttracer.exe -attach <PID> -out C:\Temp\WaAppAgent`

Learn more: https://learn.microsoft.com/en-us/windows-hardware/drivers/debuggercmds/time-travel-debugging-ttd-exe-command-line-util

## Analyze the dump

1. Setup symbols: `.sympath SRV*c:\Symbols*http://symweb`
2. For .NET code, use extensions: psscor2, psscor4, sos or mex
3. Commands: `!pe` (display exception), `!clrstack` (managed stack)

## Next steps

If dump analysis is inconclusive, escalate:
- Open a CRI to [EEE GA/PA](https://aka.ms/CRI-GAPA)
- Guest Agent crashes → EEE GA/PA and associated PG
- Extension crashes (e.g. IaaSBCDR.exe) → respective CSS team
- .NET framework issues → CSS Dev & Languages team
