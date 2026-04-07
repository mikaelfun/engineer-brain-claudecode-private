# AVD AVD FSLogix 配置文件 (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-fslogix-create-azure-files-share.md, onenote-avd-fslogix-gpo.md, onenote-avd-fslogix-scenario-tsg.md, onenote-fslogix-profile-roaming-faq.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| FSLogix does not correctly set OneDrive permissions when One... | Bug in FSLogix versions prior to v2210 where impersonation f... | Update FSLogix to version 2210 or later which correctly impe... |
| Session hosts intermittently lose access to FSLogix profiles... | MCAPS policies periodically enforce disabling Public network... | Re-adjust Public network access on storage account: set to '... |
| FSLogix profile roaming does not work with Azure AD-joined V... | Azure Files does not support Azure AD as a Kerberos realm. F... | Use AADJ VMs only for: (1) personal desktops with local user... |
| AVD user cannot login to session host. Session connects then... | Known FSLogix bug where profile hive unload fails, leaving r... | Upgrade to FSLogix v2201 hotfix 2 (2.9.8228.50276). Quick wo... |
| FSLogix RW differencing disks do not properly expand when Si... | Bug in FSLogix versions prior to v2210 where RW differencing... | Update FSLogix to version 2210 or later which includes the f... |
| FSLogix profile lock retry count and intervals do not work c... | Bug in FSLogix versions prior to v2210 where profile lock re... | Update FSLogix to version 2210 or later which fixes profile ... |
| User disconnects during FSLogix sign-out phase while disk co... | When user disconnects during sign-out, the compaction proces... | This is expected behavior; educate users to wait for sign-ou... |
| Using Windows Server 2019 with FSLogix or WVD with FSlogix y... | SearchIndexer failed to unload per user index cleanly, causi... | Install private fix for RS5/19H1/VB. Enable test signing, in... |

### Phase 2: Detailed Investigation

#### ado-wiki-a-fslogix-create-azure-files-share.md
> Source: [ado-wiki-a-fslogix-create-azure-files-share.md](guides/drafts/ado-wiki-a-fslogix-create-azure-files-share.md)

| [Robert Klemencz](mailto:Robert.Klemencz@microsoft.com) |

#### AVD FSLogix GPO Configuration
> Source: [onenote-avd-fslogix-gpo.md](guides/drafts/onenote-avd-fslogix-gpo.md)

> Source: OneNote - Mooncake POD Support Notebook

#### AVD FSLogix Scenario-Based TSG (OneNote)
> Source: [onenote-avd-fslogix-scenario-tsg.md](guides/drafts/onenote-avd-fslogix-scenario-tsg.md)

Source: UEX Tech Sharing + Internal Case Studies

#### FSLogix Profile Roaming FAQ
> Source: [onenote-fslogix-profile-roaming-faq.md](guides/drafts/onenote-fslogix-profile-roaming-faq.md)

> Source: OneNote Case Study 2110050060002398

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | FSLogix does not correctly set OneDrive permissions when OneDrive data is stored... | Bug in FSLogix versions prior to v2210 where impersonation for OneDrive permissi... | Update FSLogix to version 2210 or later which correctly impersonates OneDrive fo... | 🟢 8.0 | ADO Wiki |
| 2 | Session hosts intermittently lose access to FSLogix profiles on Azure Files shar... | MCAPS policies periodically enforce disabling Public network access on storage a... | Re-adjust Public network access on storage account: set to 'Enable from selected... | 🟢 8.0 | ADO Wiki |
| 3 | FSLogix profile roaming does not work with Azure AD-joined VMs in pooled host po... | Azure Files does not support Azure AD as a Kerberos realm. FSLogix requires Kerb... | Use AADJ VMs only for: (1) personal desktops with local user profiles, (2) poole... | 🟢 8.0 | OneNote |
| 4 | AVD user cannot login to session host. Session connects then shows Windows is pr... | Known FSLogix bug where profile hive unload fails, leaving refcount stuck in reg... | Upgrade to FSLogix v2201 hotfix 2 (2.9.8228.50276). Quick workaround: 1. Login w... | 🟢 8.0 | OneNote |
| 5 | FSLogix RW differencing disks do not properly expand when SizeInMBs registry set... | Bug in FSLogix versions prior to v2210 where RW differencing disk expansion logi... | Update FSLogix to version 2210 or later which includes the fix for proper RW dif... | 🔵 7.5 | ADO Wiki |
| 6 | FSLogix profile lock retry count and intervals do not work correctly when Cloud ... | Bug in FSLogix versions prior to v2210 where profile lock retry logic was not pr... | Update FSLogix to version 2210 or later which fixes profile lock retry count and... | 🔵 7.5 | ADO Wiki |
| 7 | User disconnects during FSLogix sign-out phase while disk compaction is running,... | When user disconnects during sign-out, the compaction process continues on the d... | This is expected behavior; educate users to wait for sign-out to complete. For C... | 🔵 7.5 | ADO Wiki |
| 8 | Using Windows Server 2019 with FSLogix or WVD with FSlogix you may encounter Sea... | SearchIndexer failed to unload per user index cleanly, causing chain impact like... | Install private fix for RS5/19H1/VB. Enable test signing, install KB, restart. | 🔵 6.5 | KB |
| 9 | We are seeing slowness in launching remote apps specifically after the customer ... | We see the delay is  here. Multiple setups running on runonce.exe&nbsp;   This s... | Apply this policy on the session host side and ask the user to connect to see if... | 🔵 6.5 | KB |
| 10 | Multiple applications crash (0x80000003) in AVD pooled session using FSLogix pro... | No space available for FSLogix profile size. | Increase FSLogix profile container size. Update FSLogix version if outdated. | 🔵 6.5 | KB |
| 11 | FSLogix profile container VHD/VHDX files grow continuously but never shrink, con... | VHD dynamic expanding disks do not reclaim freed blocks when files are deleted w... | Use Invoke-FslShrinkDisk PowerShell script (https://github.com/FSLogix/Invoke-Fs... | 🔵 6.5 | OneNote |
| 12 | OS-level changes lost after stopping/deallocating/reimaging VM with ephemeral OS... | Ephemeral OS disks are stateless; stop/deallocate operations wipe OS state by de... | Avoid stop/deallocate operations; design stateless workloads; persist user profi... | 🔵 6.0 | MS Learn |
| 13 | AVD user sees black screen for ~5 minutes after login. FSLogix error: FindFile f... | User lacks permissions to access Azure File Share for FSLogix profile. Missing S... | 1) Assign Storage File Data SMB Share Contributor on Azure File Share. 2) Assign... | 🔵 6.0 | OneNote |
| 14 | AVD users redirected to new session host instead of reconnecting to disconnected... | Known race condition in AVD backend: feed refresh during 2-min connection window... | PG fix deployed mid-May 2021. Workaround: wait 2+ minutes after opening WVD clie... | 🔵 6.0 | OneNote |
| 15 | AVD connection fails. FSLogix error code 112: There is not enough space on the d... | FSLogix profile VHD(x) nearly full. FSLogix cannot mount profile when VHD has le... | Expand FSLogix VHD(x) disk. Verify VHD size via storage path. | 🔵 6.0 | OneNote |
