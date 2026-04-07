# Dump Configuration Guide - Azure VM

## Overview
Comprehensive guide for configuring and collecting memory dumps on Azure VMs.

## Dump Types

### Full Dump
- Contains user-mode and kernel dump
- Platforms: VMWare (vmss2core), Hyper-V (vm2dmp)

### Kernel Dump
- When: System crash, high CPU in kernel
- How: CrashControl registry, LiveKD

### User/Process Dump
- Process crash (Event 1000): WER
- Process hang: Task Manager, ProcDump, Process Explorer

## Registry Configuration (CrashDumpEnabled)
| Value | Type |
|-------|------|
| 0x0 | None |
| 0x1 | Complete memory dump |
| 0x2 | Kernel memory dump |
| 0x3 | Small memory dump (64 KB) |
| 0x7 | Automatic memory dump |

## PowerShell Full Configuration
```powershell
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\CrashControl" -Name "CrashDumpEnabled" -Value 1
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\CrashControl" -Name "DumpFile" -Value "C:\MEMORY.DMP"
$RAM_toMB = ((Get-WmiObject -Class win32_computersystem).TotalPhysicalMemory/1Mb + 300).ToString().Split(".")[0]
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Session Manager\Memory Management" -Name "PagingFiles" -Value "C:\pagefile.sys $RAM_toMB $RAM_toMB"
# Also enable CrashOnCtrlScroll + NMICrashDump
Restart-Computer -Force
```

## WER for Process Crash Dumps
```cmd
SC Config WerSvc Start= Auto
net start wersvc
Reg Add "HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps" /f
Reg add "...\LocalDumps" /V DumpFolder /t REG_SZ /D "C:\CrashDumps" /f
Reg add "...\LocalDumps" /V DumpType /t REG_DWORD /D 2 /f
Reg add "...\LocalDumps" /V DumpCount /t REG_DWORD /D 10 /f
```

## ProcDump
```cmd
procdump -ma <PID>
```

## VMware Snapshot to Dump
```cmd
vmss2core.exe -W vm.vmss vm.vmem     # Win7/2008
vmss2core.exe -W8 vm.vmss vm.vmem    # Win8+/2012+
```

## Hyper-V Checkpoint to Dump
```cmd
vm2dmp -bin file.bin -vsv file.bin -dmp file.dmp
```

## Source
- OneNote: Mooncake POD Support Notebook/5.5.1-Dump configuration
- Ref: https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/memory-dump-file-options
