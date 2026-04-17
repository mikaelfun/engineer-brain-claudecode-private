# Start Azure Windows VM with Last Known Good Configuration

**Source**: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/start-vm-last-known-good)

## When to Use

When Azure Windows VM stops booting correctly after installing new software or changing Windows settings, and you need to roll back to a previous working configuration.

## Procedure

### Step 1: Attach OS Disk to Repair VM

1. Delete the VM (select **Keep the disks**)
2. Attach the OS disk as a data disk to a troubleshooting VM
3. Open **Computer Management** > **Disk Management**, ensure disk is online with drive letters assigned

### Step 2: Modify Registry Hive

1. Navigate to `\windows\system32\config` on attached disk — **backup all files first**
2. Open Registry Editor (regedit.exe)
3. Click `HKEY_USERS` → **File > Load Hive**
4. Navigate to `\windows\system32\config\SYSTEM`, name the hive (e.g., `ProblemSystem`)
5. Expand to `HKEY_USERS/ProblemSystem/Select` and modify values:

**Windows Server 2012 R2 and older:**

| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 3 |

**Windows 10 / Server 2016 and newer:**

| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 2 |

> **Note**: If VM was previously restarted on Last Known Good, add 1 to all values (e.g., Current=3, Default=3, Failed=2, LastKnownGood=3 or 4).

6. Select `HKEY_USERS\ProblemSystem` → **File > Unload Hive**
7. Detach repaired OS disk → create new VM from it (wait ~10 minutes for Azure to release disk)

## Key Points

- This modifies which ControlSet Windows uses at boot
- Always backup registry files before modification
- Different registry values for pre-2016 vs 2016+ Windows versions
- 21V applicable: Yes
