# AVD AVD FSLogix 配置文件 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-fslogix-create-azure-files-share.md, onenote-avd-fslogix-gpo.md, onenote-avd-fslogix-scenario-tsg.md, onenote-fslogix-profile-roaming-faq.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Multiple AVD users fail to load FSLogix profile, get temp pr... | Golden image had RegistrySizeLimit registry key set to a ver... | Delete the RegistrySizeLimit registry key so Windows uses th... |
| AVD FSLogix Cloud Cache slow logon (10+ minutes) with black ... | On-premises firewall device causing SMB packet loss between ... | Collect SMB ETL traces to identify packet loss. Fix firewall... |
| AVD user logoff takes 30+ minutes showing Waiting for FSLogi... | Third-party driver (cwNep.sys) hanging during logoff, blocki... | Identify and remove/update the 3rd party driver. Collect Pro... |
| FSLogix profile disk (VHDX) corruption error - user cannot l... | VHDX file on storage (Azure Files/NetApp) is corrupted, prev... | 1) Download the corrupted VHDX to local machine. 2) Mount th... |
| Storage account AD domain join appears to succeed via Join-A... | Common parameter mistakes in Join-AzStorageAccount: 1) Encry... | Re-run Join-AzStorageAccount with correct parameters: Encryp... |
| AVD slow logon when new user profile is created on customize... | First-time user profile creation triggers PerUserSetup logon... | Collect shell trace (SBSL SDP) to identify time-consuming lo... |
| User cannot login to AVD session host. Session connects show... | FSLogix profile container UsrClass.dat failed to load during... | 1. Check FSLogix logs for error 00000002/80070002. 2. Check ... |
| FSLogix users in AVD can access other users profile folders ... | Incorrect NTFS permissions on the Azure File share. The shar... | Follow the official documentation for FSLogix profile contai... |

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
| 1 | Multiple AVD users fail to load FSLogix profile, get temp profile with error: We... | Golden image had RegistrySizeLimit registry key set to a very low value (224 MB)... | Delete the RegistrySizeLimit registry key so Windows uses the default 4GB alloca... | 🟢 8.0 | OneNote |
| 2 | AVD FSLogix Cloud Cache slow logon (10+ minutes) with black screen. CloudCachePr... | On-premises firewall device causing SMB packet loss between SMB client and SMB s... | Collect SMB ETL traces to identify packet loss. Fix firewall rules for SMB traff... | 🟢 8.0 | OneNote |
| 3 | AVD user logoff takes 30+ minutes showing Waiting for FSLogix Apps Service messa... | Third-party driver (cwNep.sys) hanging during logoff, blocking FSLogix profile d... | Identify and remove/update the 3rd party driver. Collect ProcMon + FSLogix profi... | 🟢 8.0 | OneNote |
| 4 | FSLogix profile disk (VHDX) corruption error - user cannot load profile, FSLogix... | VHDX file on storage (Azure Files/NetApp) is corrupted, preventing FSLogix from ... | 1) Download the corrupted VHDX to local machine. 2) Mount the VHD locally. 3) Ru... | 🟢 8.0 | OneNote |
| 5 | Storage account AD domain join appears to succeed via Join-AzStorageAccount scri... | Common parameter mistakes in Join-AzStorageAccount: 1) EncryptionType uses wrong... | Re-run Join-AzStorageAccount with correct parameters: EncryptionType='AES256' (r... | 🟢 8.0 | OneNote |
| 6 | AVD slow logon when new user profile is created on customized image. PerUserSetu... | First-time user profile creation triggers PerUserSetup logon task which is propo... | Collect shell trace (SBSL SDP) to identify time-consuming logon tasks. PerUserSe... | 🔵 7.5 | OneNote |
| 7 | User cannot login to AVD session host. Session connects showing Windows is prepa... | FSLogix profile container UsrClass.dat failed to load during user logon. The hiv... | 1. Check FSLogix logs for error 00000002/80070002. 2. Check Procmon for FSLogix ... | 🔵 7.0 | OneNote |
| 8 | FSLogix users in AVD can access other users profile folders in Azure File share.... | Incorrect NTFS permissions on the Azure File share. The share-level and NTFS per... | Follow the official documentation for FSLogix profile container file share setup... | 🔵 6.5 | OneNote |
| 9 | AVD user application settings and desktop files disappear on every login. FSLogi... | FSLogix registry key DeleteLocalProfileWhenVHDShouldApply is set to 1, which del... | 1) Set registry key DeleteLocalProfileWhenVHDShouldApply to 0. 2) Verify DNS res... | 🔵 6.0 | OneNote |
| 10 | AVD user application settings and desktop files disappear on every login. FSLogi... | FSLogix registry key DeleteLocalProfileWhenVHDShouldApply is set to 1, which del... | 1) Set registry key DeleteLocalProfileWhenVHDShouldApply to 0. 2) Verify DNS res... | 🔵 6.0 | OneNote |
| 11 | FSLogix profile fails to attach with error 'The user profile failed to attach. P... | GPO 'Prohibit User from manually redirecting Profile Folders' (User Configuratio... | 1. Disable GPO 'Prohibit User from manually redirecting Profile Folders'. 2. Rem... | 🔵 6.0 | OneNote |
| 12 | AVD user gets corrupt FSLogix profile (CORRUPT_xxx_Profile_username.VHDX) and ct... | NTUSER.DAT is missing inside the FSLogix profile VHD container. Without NTUSER.D... | 1. Mount the VHDX via Disk Management (Action > Attach VHD) on a session host wi... | 🔵 6.0 | OneNote |
| 13 | AVD user gets corrupt FSLogix profile (CORRUPT_xxx_Profile_username.VHDX) and ct... | NTUSER.DAT is missing inside the FSLogix profile VHD container. Without NTUSER.D... | 1. Mount the VHDX via Disk Management (Action > Attach VHD) on a session host wi... | 🔵 6.0 | OneNote |
