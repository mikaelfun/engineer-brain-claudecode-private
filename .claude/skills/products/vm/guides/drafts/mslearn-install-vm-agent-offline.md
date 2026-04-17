# Install Azure VM Agent in Offline Mode

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/install-vm-agent-offline

## When to Use

- VM Agent is not installed on the VM
- Cannot RDP to the VM
- If RDP is available, download and install manually instead

## Procedure

### Step 1: Attach OS Disk to Rescue VM

1. Snapshot the affected VM's OS disk
2. Create a disk from snapshot
3. Attach as data disk to a troubleshoot/rescue VM
4. Verify disk is online in Disk Management and drive letters assigned

### Step 2: Install VM Agent via Registry

1. RDP to rescue VM
2. Browse to attached disk → `\windows\system32\config` → backup all files
3. Open Registry Editor → Load Hive from `\windows\system32\config\SYSTEM` → name it `BROKENSYSTEM`
4. If old agent exists on attached disk:
   - Rename `\windowsazure` to `\windowsazure.old`
   - Export existing agent registry keys as backup
5. From rescue VM, export these registry subkeys:
   - `HKLM\SYSTEM\ControlSet001\Services\WindowsAzureGuestAgent`
   - `HKLM\SYSTEM\ControlSet001\Services\RdAgent`
6. Edit exported `.reg` files: replace `SYSTEM` with `BROKENSYSTEM`
7. Import edited `.reg` files into `BROKENSYSTEM` hive
8. Copy `C:\WindowsAzure\GuestAgent_X.X.XXXX.XXX` folder (latest version) from rescue VM to attached disk's `\WindowsAzure\` folder
9. Unload `BROKENSYSTEM` hive
10. Detach OS disk and swap back to affected VM

### Step 3: Verify

- Access VM → RdAgent should be running
- Check logs are being generated

## Notes

- This procedure is for Windows VMs only
- For Resource Manager VMs, no additional steps needed after swap
- 21V Applicable: Yes
