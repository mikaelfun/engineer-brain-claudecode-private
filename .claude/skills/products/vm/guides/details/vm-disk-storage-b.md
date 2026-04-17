# VM Vm Disk Storage B — 综合排查指南

**条目数**: 30 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-adds-hybrid-storage-aadj-haadj.md](../../guides/drafts/ado-wiki-f-adds-hybrid-storage-aadj-haadj.md), [ado-wiki-f-debug-azstorage-account-auth.md](../../guides/drafts/ado-wiki-f-debug-azstorage-account-auth.md), [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-f-adds-hybrid-storage-aadj-haadj.md](../../guides/drafts/ado-wiki-f-adds-hybrid-storage-aadj-haadj.md) 排查流程
2. 参照 [ado-wiki-f-debug-azstorage-account-auth.md](../../guides/drafts/ado-wiki-f-debug-azstorage-account-auth.md) 排查流程
3. 参照 [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Outdated Linux Guest Agent version (2.3.1.1) with  | 1 条相关 | Manually update Linux GA: 1) waagent --version, 2) Enable Au... |
| Bug in older Windows VM Agent versions causing ETL | 1 条相关 | Upgrade Windows VM Agent to latest version (fix introduced i... |
| Expired Dynamics AX trial license causing the syst | 1 条相关 | Transfer the entire case to the Dynamics AX queue. Update ca... |
| The recommendation requires 3 separate steps to be | 1 条相关 | Verify customer has completed all 3 steps: enable encryption... |
| Source VM OS disk does not have AcceleratedNetwork | 1 条相关 | Enable accelerated networking on source disk: az disk update... |
| Windows iSCSI initiator unmounts disk when I/O tim | 1 条相关 | Check Windows Event Viewer for Event 157. Initiator typicall... |
| Azure Disk Encryption (ADE) does not support Dynam | 1 条相关 | Customer must first detach or set offline the dynamic volume... |
| The system-assigned managed identity used by DES f | 1 条相关 | CLI: 1) az disk-encryption-set identity remove --system-assi... |
| Encryption settings in Azure platform (DiskEncrypt | 1 条相关 | Compare manage-bde -protectors -get <drive>: output (Externa... |
| The .bek file extension in the command path causes | 1 条相关 | Drop the .bek file extension from the recovery key file path... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | waagent.log flooded with Failed to report status: NoneType object is not iterable. Agent version stu... | Outdated Linux Guest Agent version (2.3.1.1) with bug in status reporting (_proc... | Manually update Linux GA: 1) waagent --version, 2) Enable AutoUpdate in /etc/waa... | 🔵 7.0 | ADO Wiki |
| 2 | C:\WindowsAzure\Logs directory fills up with RuntimeEvents_xxxxxx.etl.old and WaAppAgent_xxxxxx.etl.... | Bug in older Windows VM Agent versions causing ETL log files not to be cleaned u... | Upgrade Windows VM Agent to latest version (fix introduced in 2.7.41491.969, imp... | 🔵 7.0 | ADO Wiki |
| 3 | Azure IaaS VM reboots every hour; user can log in after reboot; Guest OS Event logs show Dynamics, I... | Expired Dynamics AX trial license causing the system to automatically reboot eve... | Transfer the entire case to the Dynamics AX queue. Update case Product to Dynami... | 🔵 7.0 | ADO Wiki |
| 4 | Azure Advisor security recommendation "Virtual machines should enable Azure Disk Encryption or Encry... | The recommendation requires 3 separate steps to be fully resolved, not just enab... | Verify customer has completed all 3 steps: enable encryption + enable Guest Conf... | 🔵 7.0 | ADO Wiki |
| 5 | Gallery Image Version fails with Conflict: IsAcceleratedNetworkSupported property mismatch between s... | Source VM OS disk does not have AcceleratedNetwork capability enabled, but Image... | Enable accelerated networking on source disk: az disk update -n <diskName> --res... | 🔵 7.0 | ADO Wiki |
| 6 | Elastic SAN I/O timeouts after successful iSCSI login; disk disappears from Windows VM | Windows iSCSI initiator unmounts disk when I/O times out. Windows Event 157 is l... | Check Windows Event Viewer for Event 157. Initiator typically retries login auto... | 🔵 7.0 | ADO Wiki |
| 7 | ADE encryption operation succeeds from Azure portal but disk appears as non-encrypted in ASC and une... | Azure Disk Encryption (ADE) does not support Dynamic Volumes. This is a document... | Customer must first detach or set offline the dynamic volume, then encrypt the V... | 🔵 7.0 | ADO Wiki |
| 8 | Disk Encryption Set (DES) unable to update to new key version or perform operations - key vault acce... | The system-assigned managed identity used by DES for authenticating with Key Vau... | CLI: 1) az disk-encryption-set identity remove --system-assigned 2) az disk-encr... | 🔵 7.0 | ADO Wiki |
| 9 | Encrypted disk cannot be unlocked on rescue VM; BEK key in manage-bde protectors output does not mat... | Encryption settings in Azure platform (DiskEncryptionKey/KeyEncryptionKey on man... | Compare manage-bde -protectors -get <drive>: output (External Key File Name) wit... | 🔵 7.0 | ADO Wiki |
| 10 | manage-bde -unlock fails with ERROR: An error occurred while attempting to read the key from disk wh... | The .bek file extension in the command path causes manage-bde to fail reading th... | Drop the .bek file extension from the recovery key file path when running manage... | 🔵 7.0 | ADO Wiki |
| 11 | Azure Disk Encryption fails with connection forcibly closed by remote host. waagent.log shows UriNot... | Proxy service or stateful packet inspection (firewall/IPS) on the VM is blocking... | Test encryption from a VM on a different network (not behind the corporate proxy... | 🔵 7.0 | ADO Wiki |
| 12 | Data disks are silently skipped during ADE encryption. Bitlocker log shows: Skipping Volume Backed b... | Regression bug in ADE extension version 2.2.0.37 causes storage pool virtual dis... | Remove the 2.2.0.37 extension (Remove-AzVMDiskEncryptionExtension), then re-add ... | 🔵 7.0 | ADO Wiki |
| 13 | ADE decrypt or encrypt operation fails with error: Decrypt/Encrypt failed with 2147942421 (Device ap... | The disk/mount point is not in ready state. Typically the encryption or decrypti... | Check manage-bde -status for paused volumes. Resume paused encryption (manage-bd... | 🔵 7.0 | ADO Wiki |
| 14 | Defender for Cloud shows non-compliance alerts (Windows/Linux VMs should enable ADE or EncryptionAtH... | VM missing system-assigned managed identity or AzurePolicyforWindows/AzurePolicy... | Enable system-assigned identity on VM (Identity > ON), install Azure Machine Con... | 🔵 7.0 | ADO Wiki |
| 15 | Disabling ADE via CLI fails with InvalidParameter typeHandlerVersion even with correct command synta... | ADE was previously enabled using a custom/non-standard VM extension name (e.g. A... | List VM extensions (az vm extension list) to find non-standard ADE extension nam... | 🔵 7.0 | ADO Wiki |
| 16 | ADE encryption fails with 'A semi colon character was expected' or 'Whitespace is not allowed at thi... | Disk volume labels contain special characters (semicolon, ampersand &, excessive... | Identify volumes with special characters in labels from BitLocker extension logs... | 🔵 7.0 | ADO Wiki |
| 17 | ADE-encrypted VM requests BitLocker Recovery Key or USB drive with key at boot, VM cannot locate BEK... | VM cannot locate the BitLocker Recovery Key (BEK) file during boot operation, BE... | Use rescue VM approach: attach encrypted OS disk to rescue VM, retrieve BEK from... | 🔵 7.0 | ADO Wiki |
| 18 | RHEL 9 VM enters emergency mode after enabling ADE, boot filesystem /boot mount failure with empty b... | grub2-mkconfig on RHEL9 with grub2-tools >= 2.06-69 requires --update-bls-cmdlin... | Attach disk to rescue VM, chroot into the filesystem. Run: grub2-mkconfig --upda... | 🔵 7.0 | ADO Wiki |
| 19 | ADE encryption fails with error: secret does not have DiskEncryptionKeyEncryptionAlgorithm tags. Key... | When an Azure subscription is moved from tenant A to tenant B, existing Key Vaul... | 1) Update Key Vault tenant ID: Set-AzureRmResource to change TenantId to new ten... | 🔵 6.0 | ADO Wiki |
| 20 | ADE encryption on Linux VM fails with 'No space left on device' during OS volume encryption. Guest A... | Linux VM does not have enough RAM for ADE OS disk encryption. Linux VMs require ... | Resize the VM to have RAM that is at least 2x the size of the root partition. Fo... | 🔵 7.0 | ADO Wiki |
| 21 | ADE extension fails with ProtectKeyWithExternalKey failed with 2147942512 during BitLocker encryptio... | One of the volumes to be encrypted by BitLocker is full or does not have enough ... | Add more space or extend the volume to provide the free space needed by BitLocke... | 🔵 7.0 | ADO Wiki |
| 22 | ADE OS disk encryption fails with "Cannot open WinRM service on computer '.'. System.ComponentModel.... | A Group Policy changed the default Windows Remote Management (WS-Management) ser... | Collect gpresult /h gpreport.html and check Computer Details > Settings > Polici... | 🔵 6.0 | ADO Wiki |
| 23 | Disk Encryption Set with Confidential disk encryption + CMK fails to grant KeyVault permissions with... | Confidential VM Orchestrator service principal (AppId bf7b6499-ff71-4aa2-97a4-f3... | Register the service principal using Microsoft Graph SDK: Connect-Graph -Tenant ... | 🔵 6.0 | ADO Wiki |
| 24 | Azure Files SMB: Security recommended action about potentially unintended elevation of privileges fo... | Custom RBAC role definitions using wildcard (*) for Actions or DataActions on Az... | Update RBAC role assignments to replace wildcard (*) with explicit Storage Files... | 🔵 6.0 | ADO Wiki |
| 25 | Need to determine if a VM uses Dual Pass or Single Pass Azure Disk Encryption (ADE) |  | Check ADE extension version in VM Extensions blade: Windows - version 1.x = Dual... | 🔵 7.0 | ADO Wiki |
| 26 | Azure Files Kerberos authentication fails; storage account SPN (cifs/storageaccount.file.core.window... | Storage account was not properly domain-joined to ADDS via Join-AzStorageAccount... | 1) Verify SPN exists: setspn -q cifs/<storageaccount>.file.core.windows.net. If ... | 🔵 7.0 | ADO Wiki |
| 27 | Azure Files klist get cifs/<sa>.file.core.windows.net fails with error 0xc000018b/-1073741429: The S... | Client machine computer account trust with the domain controller is broken, or t... | 1) Verify client is domain-joined: dsregcmd /status. 2) Check storage SPN: setsp... | 🔵 7.0 | ADO Wiki |
| 28 | Azure Files klist get cifs/<sa>.file.core.windows.net fails with error 0x80090342/-2146892990: The e... | Mismatch between encryption types supported by the client, the storage account A... | 1) Run Get-AzStorageKerberosTicketStatus (AzFilesHybrid module) to check health ... | 🔵 7.0 | ADO Wiki |
| 29 | Azure SMB file share mounted on Linux VM suddenly fails with unknown error 524; kernel log shows CIF... | Azure storage stamp migration caused the mounted file share to become inaccessib... | Verify storage stamp migration using the LosingMountafterStampMigration TSG (wik... | 🔵 7.0 | ADO Wiki |
| 30 | Azure SMB file share mounted on Linux VM fails with unknown error 524 and CIFS STATUS_LOGON_FAILURE;... | Stale connection to storage account - newer connection attempts reuse an already... | Add nosharesock option to FSTAB entry: //sa.file.core.windows.net/share /mnt/dir... | 🔵 7.0 | ADO Wiki |

