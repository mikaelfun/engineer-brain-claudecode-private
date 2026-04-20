---
title: How to Start Azure Windows VM with Last Known Good Configuration
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/start-vm-last-known-good
product: vm
21vApplicable: true
date: 2026-04-18
---

# How to Start Azure Windows VM with Last Known Good Configuration

## When to Use
When a Windows VM stops booting correctly after installing new software or changing Windows settings.

## Prerequisites
- Access to Azure portal
- A second troubleshooting VM available

## Procedure

### Step 1: Attach the OS disk to a troubleshooter VM
1. Delete the VM (select **Keep the disks** option)
2. Attach the OS disk as data disk to another VM (troubleshooting VM)
3. Connect to troubleshooting VM, open **Computer Management > Disk Management**, ensure disk is online with drive letters assigned

### Step 2: Modify the Registry Hive
1. Navigate to \windows\system32\config on attached OS disk, copy all files as backup
2. Open Registry Editor (regedit.exe)
3. Select **HKEY_USERS**, then **File > Load Hive**
4. Load \windows\system32\config\SYSTEM, name it "ProblemSystem"
5. Expand to HKEY_USERS/ProblemSystem/Select

**For Windows Server 2012 R2 and older:**
| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 3 |

**For Windows 10, Server 2016+:**
| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 2 |

> **Note**: If VM was previously restarted with Last Known Good, add 1 to all values.

6. Select HKEY_USERS\ProblemSystem, then **File > Unload Hive**
7. Detach repaired OS disk, create new VM from it (wait ~10 minutes for Azure to release disk)

## Key Points
- Backup registry files before modification
- Values differ between Server 2012 R2 and Server 2016+
- If previous LKGC was used, increment all values by 1
