# Memory Dump Collection & Serial Console Configuration

> Source: Microsoft Learn (2 pages combined)
> Quality: guide-draft | Needs review before promotion

## Collect OS Memory Dump File

### Steps
1. Take snapshot of OS disk as backup
2. Attach OS disk to recovery VM
3. RDP to recovery VM
4. If encrypted, decrypt first (see encrypted disk guide)
5. Navigate to `<drive>:\Windows` on attached disk
6. Locate `Memory.dmp` file
7. Submit support ticket with dump file attached

### References
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/collect-os-memory-dump-file

## Enable Serial Console and Memory Dump Collection

Use when performing offline repair of a VM that needs crash dump configuration.

### Enable Serial Console (BCDEdit)

From elevated command prompt on repair VM, targeting the attached OS disk:

```cmd
bcdedit /store <volume-letter>:\boot\bcd /ems {<boot-loader-id>} ON
bcdedit /store <volume-letter>:\boot\bcd /emssettings EMSPORT:1 EMSBAUDRATE:115200
```

### Enable Memory Dump via Registry (Offline)

**Prerequisite:** Ensure OS disk has free space > RAM size. If not, redirect dump to data disk by replacing `%SystemRoot%` with data disk drive letter (e.g., `F:`).

```cmd
rem Load registry hive from broken OS disk
reg load HKLM\broken-system <volume-letter>:\windows\system32\config\SYSTEM

rem Enable on ControlSet001
reg add "HKLM\broken-system\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
reg add "HKLM\broken-system\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
reg add "HKLM\broken-system\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

rem Enable on ControlSet002
reg add "HKLM\broken-system\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
reg add "HKLM\broken-system\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
reg add "HKLM\broken-system\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

rem Unload
reg unload HKLM\broken-system
```

### Key Registry Values
| Value | Type | Data | Purpose |
|-------|------|------|---------|
| CrashDumpEnabled | REG_DWORD | 1 | Enable crash dumps |
| DumpFile | REG_EXPAND_SZ | %SystemRoot%\MEMORY.DMP | Dump file location |
| NMICrashDump | REG_DWORD | 1 | Enable NMI-triggered crash dump |

### References
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-serial-console-memory-dump-collection
