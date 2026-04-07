# VM Restore Point Troubleshooting Guide

**Source**: https://learn.microsoft.com/azure/virtual-machines/restore-point-troubleshooting

## Systematic Troubleshooting Steps

### Step 1: Check VM Health
- VM provisioning state must be **Running** (not Stopped/Deallocated/Updating)
- No pending OS updates or reboots

### Step 2: Check VM Guest Agent
- **Windows**: services.msc → Windows Azure VM Guest Agent → Running + latest version
- **Linux**: `ps -e` → walinuxagent running + latest version

### Step 3: Check Extensions
- All extensions must be in **provisioning succeeded** state
- COM+ System Application and MSDTC must be running

### Step 4: Check Snapshot Extension
- VMSnapshot extension must not be in failed state
- Antivirus may block IaaSBcdrExtension.exe → exclude paths
- Network access required (ports 80, 443, 32526; IP 168.63.129.16)
- DHCP must be enabled inside guest VM

## Common Error Codes

| Error Code | Root Cause | Fix |
|------------|-----------|-----|
| DiskRestorePointUsedByCustomer | Active SAS on disk restore points | EndGetAccess first |
| OperationNotAllowed (disk not allocated) | Unhealthy disk attached | Exclude via excludeDisks |
| VMRestorePointClientError (shared disk) | Shared disks not supported | Exclude shared disks |
| DiskRestorePointClientError (KeyVault) | KeyVault deleted | Re-create KeyVault |
| VMRestorePointClientError (VSS) | VSS writers bad state | Restart VSS + VM |
| VMRestorePointClientError (snapshot limit) | >500 snapshots | Delete old restore points |
| VMRestorePointClientError (COM+) | COM+ service error | Restart COMSysApp + VM |
| VMAgentStatusCommunicationError | Agent stopped/outdated | Reinstall/restart agent |
| VMRestorePointInternalError | Multiple possible causes | Follow 5-step checklist |
