# AVD FSLogix Scenario-Based TSG (OneNote)

Source: UEX Tech Sharing + Internal Case Studies

## Log Collection Quick Reference

- FSLogix support tool: https://aka.ms/fslogix_support_tool
- Event logs: `Microsoft-FSLogix-Apps/Operational`
- Profile logs: Filter "LoadProfile" for affected user
- Registry config: Check `frxReg.reg.txt` or `ProfileList.reg.txt`
- Redirections: Check `OriginalRedirections.xml`
- Antivirus check: `fltmcOutput.txt` - altitude range 320000-329998 = AV driver
- Cloud Cache logs: CloudCacheService logs, CloudCacheProvider logs
- Auth collection: `aka.ms/authscript` (winlogon ETL, netmon, kerberos)

## Scenario 1: Profile Failed to Attach

### Decision Tree
```
FSLogix profile failed to load
  → Confirm environment (OS, patch, persistent/non-persistent, FSLogix version)
  → Check FSLogix configuration (registry)
  → Collect logs: Does logon use local profile?
  → Confirm NTFS + Share permissions on storage
  → Check GPO
  → Check disk/file share free space
  → Check antivirus software
  → Check event logs + ProcMon
```

### Common Root Causes (from cases)

| # | Root Cause | Fix | Case Ref |
|---|-----------|-----|----------|
| 1 | `DeleteLocalProfileWhenVHDShouldApply` unset + missing Azure File share permission | Enable reg, fix permissions | 2211040030000207 |
| 2 | Profile container storage (unmanaged premium SSD) reached blob provisioned size limit | Expand storage, set alerts | 2211140030002514 |
| 3 | FSLogix agent not properly installed, users on local profiles | Reinstall latest FSLogix agent | 2210110040001205 |
| 4 | Storage File Data SMB Share Contributor role missing | Add role assignment | 2210180040002557 |
| 5 | VHDLocations registry pointing to invalid storage path | Correct the registry value | 2210200030000398 |
| 6 | User lacks permission on SMB file share (FindFile failed) | Grant correct permissions | 2209090010001125 |
| 7 | "Only allow local user profiles" GPO + AccessNetworkAsComputerObject bug | Disable GPO, upgrade FSLogix | 2209200050000762 |
| 8 | Azure file share storage size limit reached | Add storage space | 2209280030000881 |
| 9 | Profile disk in use by another session (Citrix logoff loop) | Enable AV exclusions, fix Citrix logoff | 2209290040000762 |
| 10 | RegistrySizeLimit registry key set too low (224MB vs 4GB default) | Delete RegistrySizeLimit key | 2211280040007247 |
| 11 | Users lost permission after AAD/storage auth change | Re-grant permissions, engage AD/Storage teams | 2301270030000038 |

## Scenario 2: Slow Logon

### Decision Tree by Stuck Stage
```
"Welcome" page
  → FSLogix loaded fast? → engage Windows AD engineer
  → Check winlogon ETL

"Wait for User Profile Service / Group Policy Client"
  → Test with local profile
  → Engage Windows AD engineer (ProfSvc)

"Please wait for FSLogix Apps Services"
  → Check FSLogix profile load time from profile logs
  → Check CloudCache provider/service logs for disk register
  → Collect ProcMon + FSLogix ETL + TTT/dump

"Preparing your desktop / windows"
  → Is explorer.exe running?
  → Try disabling AppReadiness service
  → Collect ProcMon

Black screen
  → explorer.exe running? → Engage Windows Perf team
  → explorer.exe not running? → Try manual start, collect ProcMon
```

### Common Root Causes (from cases)

| # | Root Cause | Fix | Case Ref |
|---|-----------|-----|----------|
| 1 | Cloud Cache CCD provider in different geo region (150ms latency, SendBlocks failed) | Move CCD providers to same region, apply AV exclusions | 2210260050000004 |
| 2 | On-prem firewall causing SMB packet loss (StorageIoTimeout) | Fix firewall rules | 2209010030000154 |
| 3 | Session hosts in different location from Azure Storage Account | Co-locate session hosts and storage | 2209130030000209 |
| 4 | CCD HealthyProvidersRequiredForRegister=0 when storage unavailable | Fix CCD configuration | 2209160030000165 |
| 5 | DC failing to retrieve disallowed certificate list (Citrix cert auth) | Fix DC certificate retrieval | 2202100050000091 |
| 6 | 3rd party driver (cwNep.sys) blocking logoff (30min FSLogix wait) | Remove/update 3rd party driver | 2212210030000210 |
| 7 | rdpinit.exe waiting for StateRepository service | Debug StateRepository service | 2212140040001741 |

## Scenario 3: VHDX Disk Size Issues

- FSLogix uses dynamic VHDX by default - grows but doesn't auto-shrink
- Shrink options:
  - `frx migrate-vhd -src=<source> -dest=<dest>` (creates new disk)
  - PowerShell: https://github.com/FSLogix/Invoke-FslShrinkDisk
  - VHD Disk Compaction: https://learn.microsoft.com/en-us/fslogix/reference-vhd-disk-compaction
- For fixed size: set `IsDynamic` to 0
- To increase: update `SizeInMBs` value

### Common Root Causes

| # | Root Cause | Fix | Case Ref |
|---|-----------|-----|----------|
| 1 | `DeleteLocalProfileWhenVHDShouldApply` deletes admin local profile | Add admin to FSLogix Exclude List | 2211180060001044 |
| 2 | NetApp storage under-provisioned for total user profile size | Increase file share space | 2210280060001161 |
| 3 | Power BI app corruption due to insufficient profile disk space | Increase VHDX SizeInMBs | 2212020030000422 |

### Common FSLogix Profile Log Errors

| Error | Meaning |
|-------|---------|
| `0x00000002 / 80070002` | Profile VHDX not found or path issue |
| Access Denied on SMB path | Missing NTFS/Share permissions |
| SendBlocks failed | CCD sync latency / network issue |
| StorageIoTimeout | SMB timeout due to network/firewall |
| Open handle on VHDX | Previous session not fully logged off |
