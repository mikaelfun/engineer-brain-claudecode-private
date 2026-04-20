---
title: Install Azure VM Agent in Offline Mode
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/install-vm-agent-offline
product: vm
21vApplicable: true
---

# Install Azure VM Agent in Offline Mode

## When to Use
- VM Agent is not installed AND cannot RDP to the VM
- If you can RDP, just download and install manually instead

## Procedure

### Step 1: Attach OS Disk to Repair VM
1. Snapshot the affected VM's OS disk
2. Create disk from snapshot
3. Attach as data disk to a troubleshoot VM
4. Verify disk is online and drive letters assigned

### Step 2: Install VM Agent via Registry
1. RDP to troubleshoot VM
2. Browse to attached disk `\windows\system32\config` → backup all files
3. Open Registry Editor (regedit.exe)
4. Select HKEY_LOCAL_MACHINE → File → Load Hive
5. Browse to `\windows\system32\config\SYSTEM` on attached disk
6. Name the hive: BROKENSYSTEM

### Step 3: Export and Import Agent Registry Keys
1. From troubleshoot VM, export:
   - `HKLM\SYSTEM\ControlSet001\Services\WindowsAzureGuestAgent`
   - `HKLM\SYSTEM\ControlSet001\Services\RdAgent`
2. Edit .reg files: change SYSTEM → BROKENSYSTEM
3. Import edited .reg files (double-click)
4. Verify subkeys imported under BROKENSYSTEM hive

### Step 4: Copy Agent Files
1. Create `WindowsAzure` folder in root of attached OS disk
2. Copy `GuestAgent_X.X.XXXX.XXX` folder from `C:\WindowsAzure` on troubleshoot VM
3. If unsure which version, copy all GuestAgent folders

### Step 5: Reassemble
1. Unload BROKENSYSTEM hive (File → Unload Hive)
2. Detach OS disk
3. Swap OS disk back to affected VM
4. Verify RdAgent is running and logs generated
