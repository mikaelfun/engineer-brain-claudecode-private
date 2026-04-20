---
title: Troubleshoot Windows VM by Attaching OS Disk to Repair VM (Azure Portal)
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-recovery-disks-portal-windows
product: vm
21vApplicable: true
date: 2026-04-18
---

# Troubleshoot Windows VM by Attaching OS Disk to Repair VM (Azure Portal)

## When to Use
When a Windows VM encounters startup or disk errors and needs offline troubleshooting of the OS disk.

## Method Selection Decision Tree

### Is the OS disk managed or unmanaged?
- **Unmanaged** -> Use unmanaged disk offline repair procedure
- **Managed** -> Continue below

### Is the disk encrypted with ADE?
- **Not encrypted** -> Use az vm repair commands (preferred/automated)
- **ADE single-pass (with or without KEK)** -> Use az vm repair commands (preferred/automated)
- **ADE other encryption** -> Use manual unlock procedure for encrypted disks

## Manual Portal Procedure (Managed, Not Encrypted)

### Step 1: Take Snapshot of OS Disk
1. Navigate to VM in Azure portal
2. Select **Disks** blade -> select OS disk
3. On OS disk **Overview** blade -> select **Create snapshot**
4. Create with default settings

### Step 2: Create Disk from Snapshot
1. Navigate to completed snapshot resource
2. Select **Create Disk** on Overview blade
3. Assign descriptive name (e.g., "MyVMOsDiskCopy")
4. Select region and Availability Zone (record these - repair VM must match)
5. Complete wizard with defaults

### Step 3: Create Repair VM
1. Create new Windows Server VM in same region and AZ as the new disk
2. Connect to repair VM, verify it works
3. Attach the new disk as data disk: **VM > Disks > Attach existing disks**

### Step 4: Repair the OS Disk
- Perform maintenance and troubleshooting on the attached disk
- Fix errors preventing boot

### Step 5: Swap OS Disk
1. On repair VM: **Disks** blade -> detach the data disk -> **Save**
2. On source (failed) VM: **Disks** blade -> **Swap OS disk**
3. Select repaired disk, enter VM name to confirm
4. Wait 10-15 minutes if disk not visible after detach

## 21V (Mooncake) Notes
- Portal URL: portal.azure.cn (not portal.azure.com)
- az vm repair commands available in Mooncake
- Same general procedure applies

## Key Points
- Always take snapshot before modifying OS disk
- Repair VM must be in same region and AZ as the disk
- Preferred method: az vm repair commands (automated)
- Manual method via portal as fallback
