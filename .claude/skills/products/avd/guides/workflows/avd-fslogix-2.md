# AVD FSLogix 配置文件 (Part 2) — 排查工作流

**来源草稿**: ado-wiki-a-fslogix-create-azure-files-share.md, onenote-avd-fslogix-gpo.md, onenote-avd-fslogix-scenario-tsg.md, onenote-fslogix-profile-roaming-faq.md
**Kusto 引用**: (无)
**场景数**: 16
**生成日期**: 2026-04-07

---

## Scenario 1: |Contributors|
> 来源: ado-wiki-a-fslogix-create-azure-files-share.md | 适用: \u901a\u7528 \u2705

### 排查步骤
|--|
| [Robert Klemencz](mailto:Robert.Klemencz@microsoft.com) |
---
1. Login to the Azure portal: [https://portal.azure.com](https://portal.azure.com/)
2. Search for **storage account** and select the **Storage accounts** entry under **Services**.
3. On the **Storage Center** page, click on the newly created storage account name.
4. On your storage account's page, navigate to **Data storage > File shares** and click **File share**.
The New file share wizard will open.
5. On the **Basics** page:
   - Enter a **Name** for your file share.
   - This name is entirely up to you, but for easier reference in our lab, it is recommended to use something pointing to the purpose of the share (e.g.: avdlabfslogix)
   - Leave **Access tier** on **Transaction optimized**.
   - When ready, click **Next: Backup >**.
   - On the **Backup** page:
   - **Uncheck** the checkbox for **Enable backup**.
   - For the purpose of this lab, we don't need backups.
   - When ready, click **Next: Review >**.
   - On the **Review + create** page, verify if everything is correct and when ready, click **Create**.
---
content checked: 20251217

## Scenario 2: AVD FSLogix GPO Configuration
> 来源: onenote-avd-fslogix-gpo.md | 适用: Mooncake \u2705

### 排查步骤
> Source: OneNote - Mooncake POD Support Notebook
> Status: draft

## Scenario 3: Overview
> 来源: onenote-avd-fslogix-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
FSLogix Group Policy templates enable centralized management of FSLogix profile container settings via GPO.

## Scenario 4: Setup Reference
> 来源: onenote-avd-fslogix-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Doc: https://docs.microsoft.com/en-us/fslogix/use-group-policy-templates-ht

## Scenario 5: Key Steps
> 来源: onenote-avd-fslogix-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Download and install FSLogix GPO templates (ADMX/ADML)
2. Configure profile container settings via Group Policy Editor
3. Set advanced settings as needed (VHD locations, size limits, etc.)

## Scenario 6: Notes
> 来源: onenote-avd-fslogix-gpo.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Detailed screenshots available in source OneNote page
   - See also: FSLogix registry reference guide for individual registry key details

## Scenario 7: Log Collection Quick Reference
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - FSLogix support tool: https://aka.ms/fslogix_support_tool
   - Event logs: `Microsoft-FSLogix-Apps/Operational`
   - Profile logs: Filter "LoadProfile" for affected user
   - Registry config: Check `frxReg.reg.txt` or `ProfileList.reg.txt`
   - Redirections: Check `OriginalRedirections.xml`
   - Antivirus check: `fltmcOutput.txt` - altitude range 320000-329998 = AV driver
   - Cloud Cache logs: CloudCacheService logs, CloudCacheProvider logs
   - Auth collection: `aka.ms/authscript` (winlogon ETL, netmon, kerberos)

## Scenario 8: Decision Tree
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 9: Common Root Causes (from cases)
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 10: Decision Tree by Stuck Stage
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
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

## Scenario 11: Scenario 3: VHDX Disk Size Issues
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - FSLogix uses dynamic VHDX by default - grows but doesn't auto-shrink
   - Shrink options:
   - `frx migrate-vhd -src=<source> -dest=<dest>` (creates new disk)
   - PowerShell: https://github.com/FSLogix/Invoke-FslShrinkDisk
   - VHD Disk Compaction: https://learn.microsoft.com/en-us/fslogix/reference-vhd-disk-compaction
   - For fixed size: set `IsDynamic` to 0
   - To increase: update `SizeInMBs` value

## Scenario 12: Common Root Causes
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| # | Root Cause | Fix | Case Ref |
|---|-----------|-----|----------|
| 1 | `DeleteLocalProfileWhenVHDShouldApply` deletes admin local profile | Add admin to FSLogix Exclude List | 2211180060001044 |
| 2 | NetApp storage under-provisioned for total user profile size | Increase file share space | 2210280060001161 |
| 3 | Power BI app corruption due to insufficient profile disk space | Increase VHDX SizeInMBs | 2212020030000422 |

## Scenario 13: Common FSLogix Profile Log Errors
> 来源: onenote-avd-fslogix-scenario-tsg.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error | Meaning |
|-------|---------|
| `0x00000002 / 80070002` | Profile VHDX not found or path issue |
| Access Denied on SMB path | Missing NTFS/Share permissions |
| SendBlocks failed | CCD sync latency / network issue |
| StorageIoTimeout | SMB timeout due to network/firewall |
| Open handle on VHDX | Previous session not fully logged off |

## Scenario 14: Q1: Multiple host pools sharing the same file share — one folder or two per user?
> 来源: onenote-fslogix-profile-roaming-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Answer:** Same user produces **one** profile folder in the file share, regardless of how many host pools reference it. However, this configuration (multiple host pools sharing one file share) is **not recommended** by Microsoft.
Reference: [FSLogix profile containers with Azure Files architecture](https://docs.microsoft.com/en-us/azure/architecture/example-scenario/wvd/windows-virtual-desktop-fslogix)

## Scenario 15: Q2: Must all VMs in a host pool use the same image?
> 来源: onenote-fslogix-profile-roaming-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Answer:** There is no hard restriction — adding a session host with a different image will not produce an error. However, Microsoft documentation states:
> "Each host pool VM must be built of the same type and size VM based on the same master image."
**Risk:** Profile roaming across different OS versions (e.g., Windows 10 vs Windows Server 2019) may cause data loss or inconsistencies. For example, files created on Windows 10 may not appear when the profile is loaded on Windows Server 2019.

## Scenario 16: Key Takeaways
> 来源: onenote-fslogix-profile-roaming-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - FSLogix profile = one folder per user per file share, regardless of host pool count
   - Mixing images in a host pool is technically possible but unsupported and risky
   - Always use consistent OS images within a host pool for reliable profile roaming
