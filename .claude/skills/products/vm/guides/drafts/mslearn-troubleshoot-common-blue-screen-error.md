---
title: Azure VM Blue Screen (BSOD) - Dump File Collection Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-common-blue-screen-error
product: vm
date: 2026-04-18
---

# Azure VM Blue Screen (BSOD) - Dump File Collection Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-common-blue-screen-error

## Common Causes
- Driver problem
- Corrupted system file or memory
- Application accessing forbidden memory sector

## Step 1: Locate Dump File
1. Take snapshot of affected VM OS disk (backup)
2. Attach OS disk to a recovery VM
3. RDP to recovery VM
4. If encrypted, decrypt the OS disk first
5. Navigate to Windows folder on attached disk (e.g. F:\Windows)
6. Locate Memory.dmp file
7. Submit support ticket with dump file attached

## Step 2: Enable Dump Log and Serial Console (if no dump found)
1. Open elevated CMD on recovery VM
2. Enable serial console via BCDEdit:
   - bcdedit /store <vol>:ootcd /ems {<boot-loader-id>} ON
   - bcdedit /store <vol>:ootcd /emssettings EMSPORT:1 EMSBAUDRATE:115200
3. Ensure free space on OS disk > RAM size (or redirect dump to data disk)
4. Load broken registry hive: reg load HKLM\<broken-system> <vol>:\windows\system32\config\SYSTEM
5. Enable CrashDump on ControlSet001 and ControlSet002:
   - CrashDumpEnabled = 1 (REG_DWORD)
   - DumpFile = %SystemRoot%\MEMORY.DMP (REG_EXPAND_SZ)
   - NMICrashDump = 1 (REG_DWORD)
6. Unload hive: reg unload HKLM\<broken-system>

## Step 3: Reproduce Issue
1. Detach and reattach OS disk to affected VM
2. Start VM to reproduce BSOD and generate dump
3. Repeat Step 1 to locate and submit dump file

## Tips
- Always try restoring from recent backup first
- If OS disk encrypted, decrypt before accessing dump
- If not enough disk space, redirect dump to attached data disk
