# Set Machine PowerShell Execution Policy via Intune Win32 App

## Overview
Deploy separate Win32 apps for x86 and x64 architectures to set machine-wide PowerShell Execution Policy.

## Key Points
- x64 version: Use SysNative path for powershell.exe
- x86 version: Detection script must run as 32-bit
- Duplicate install command for uninstall (if uninstall not needed)

## Detection Script (identical for both apps)
```powershell
Start-Sleep -s 10
$ExecPol = Get-ExecutionPolicy -Scope LocalMachine
if ($ExecPol -eq "AllSigned") {
    $ExecPol
    exit 0
} else {
    exit 1
}
```

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG
