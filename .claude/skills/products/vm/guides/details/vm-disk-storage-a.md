# VM Vm Disk Storage A — 综合排查指南

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
| An active SAS token exists on the disk (granted vi | 1 条相关 | Call EndGetAccess on the disk or wait for the SAS to expire ... |
| Automatic key rotation is not supported for DES wi | 1 条相关 | Set rotationToLatestKeyVersionEnabled to false on the DES. M... |
| When creating managed disks for Trusted Launch or  | 1 条相关 | Specify the osType (Windows or Linux) in the managed disk cr... |
| An active SAS token exists on the disk (generated  | 1 条相关 | Wait for the SAS token to expire, or explicitly revoke SAS a... |
| Azure Portal 暂不显示 DiskControllerType，需通过后端查询获取 | 1 条相关 | 方法一（Kusto）：查询 moseisley.kusto.windows.net AzureCM.LogContain... |
| Ephemeral OS disk 和 Ultra DD resize（Portal 中）是 NVM | 1 条相关 | Ephemeral OS disk 不支持 NVMe-enabled VM：当 OS disk 配置为 ephemera... |
| API version used is below the minimum required (20 | 1 条相关 | Upgrade to Azure compute REST API version 2022-03-22 or late... |
| VM 未配置系统分配的托管标识（System-assigned managed identity）， | 1 条相关 | 1. 为 VM 启用系统分配的托管标识；2. 在 VM 的 Extensions + applications 下启用 ... |
| Input blob does not exist in the specified storage | 1 条相关 | 1) Verify input blobs exist in the specified container with ... |
| Multiple concurrent Genomics workflows writing to  | 1 条相关 | Resubmit the failed workflow with a unique output base name ... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot change dataAccessAuthorizationMode on disk while there is an active SAS. Error: PropertyChang... | An active SAS token exists on the disk (granted via Get-AzDiskAccess, az disk gr... | Call EndGetAccess on the disk or wait for the SAS to expire before retrying the ... | 🔵 7.0 | ADO Wiki |
| 2 | Auto-key rotation for CVM DiskEncryptionSet fails: 'Auto-key rotation for DiskEncryptionSet with Enc... | Automatic key rotation is not supported for DES with EncryptionType 'Confidentia... | Set rotationToLatestKeyVersionEnabled to false on the DES. Manual key rotation m... | 🔵 7.0 | ADO Wiki |
| 3 | CVM disk creation fails: 'OS type must be specified for Trusted VM and Confidential VM disks' | When creating managed disks for Trusted Launch or Confidential VMs, the osType p... | Specify the osType (Windows or Linux) in the managed disk creation template/API ... | 🔵 7.0 | ADO Wiki |
| 4 | Changing dataAccessAuthorizationMode on managed disk fails with error: Property dataAccessAuthorizat... | An active SAS token exists on the disk (generated via Get-AzDiskAccess, az disk ... | Wait for the SAS token to expire, or explicitly revoke SAS access using EndGetAc... | 🔵 7.0 | ADO Wiki |
| 5 | 需要确认 VM 使用的 DiskControllerType（SCSI 或 NVMe），但 Azure Portal 尚未显示该属性 | Azure Portal 暂不显示 DiskControllerType，需通过后端查询获取 | 方法一（Kusto）：查询 moseisley.kusto.windows.net AzureCM.LogContainerSnapshot，extend ex... | 🔵 7.0 | ADO Wiki |
| 6 | 客户在 NVMe-enabled VM 上配置 Ephemeral OS Disk 失败，或在 Portal 中无法对 NVMe VM 执行 Ultra DD resize | Ephemeral OS disk 和 Ultra DD resize（Portal 中）是 NVMe-enabled VM 的已知不支持功能 | Ephemeral OS disk 不支持 NVMe-enabled VM：当 OS disk 配置为 ephemeral 时，data disk 仍会使用 N... | 🔵 7.0 | ADO Wiki |
| 7 | Error 'Minimum api-version {version} is required to restore an Ultra or PremiumV2 disk from restore ... | API version used is below the minimum required (2022-03-22) for restore operatio... | Upgrade to Azure compute REST API version 2022-03-22 or later when restoring Ult... | 🔵 7.0 | ADO Wiki |
| 8 | Defender for Cloud 显示 'Windows/Linux virtual machines should enable Azure Disk Encryption or Encrypt... | VM 未配置系统分配的托管标识（System-assigned managed identity），或未在 Extensions + applications ... | 1. 为 VM 启用系统分配的托管标识；2. 在 VM 的 Extensions + applications 下启用 Azure Policy（Azure A... | 🔵 7.0 | ADO Wiki |
| 9 | Genomics workflow fails with "Blob <blob> doesn't exist", "Source blob does not exist: <blob>", or "... | Input blob does not exist in the specified storage container; incorrect storage ... | 1) Verify input blobs exist in the specified container with the correct case-sen... | 🔵 7.0 | ADO Wiki |
| 10 | Genomics workflow fails with 'Error uploading <blob>: <storage status message> This most likely happ... | Multiple concurrent Genomics workflows writing to the same output container usin... | Resubmit the failed workflow with a unique output base name to avoid conflicts w... | 🔵 7.0 | ADO Wiki |
| 11 | Genomics workflow fails with 'Error uploading <blob>: <storage status message for BlockListTooLong o... | Genomics workflow output file exceeds Azure Blob Storage's maximum block list or... | Reduce the size of the output by splitting the sequencing workload into smaller ... | 🔵 7.0 | ADO Wiki |
| 12 | Genomics workflow fails with 'Unable to reach the storage account <account>. Make sure the name is c... | Incorrect storage account name was specified in the workflow submission command | Copy the exact storage account name directly from the Access keys page of the st... | 🔵 7.0 | ADO Wiki |
| 13 | Genomics workflow fails with 'Error reading an input file'; workflow log (standardoutput.log) shows ... | Input genomics file (FASTQ, BAM, or SAM) is corrupted or invalid | 1) Retrieve log archive from output container (file named *.<workflow-ID>.logs.z... | 🔵 7.0 | ADO Wiki |
| 14 | Azure Compute Gallery image version update fails with error: 'The replication region and replica cou... | When Shallow Replication is enabled for an image version, replication settings (... | Configure all desired replication regions and replica counts BEFORE enabling the... | 🔵 7.0 | ADO Wiki |
| 15 | Elastic SAN volume created from Managed Disk snapshot via PowerShell shows as not initialized. Issue... | PowerShell command missing -CreationDataCreateSource DiskSnapshot switch. Withou... | Add -CreationDataCreateSource DiskSnapshot parameter when creating Elastic SAN v... | 🔵 7.0 | ADO Wiki |
| 16 | Azure File Share mount fails when accessing from on-premises or a different Azure region. Client can... | Client OS only supports SMB 2.1 (e.g., Windows Server 2008 R2, Windows 7, or Lin... | Upgrade client OS to one supporting SMB 3.0 with encryption: Windows Server 2012... | 🔵 7.0 | ADO Wiki |
| 17 | Azure File Share mount fails on Linux with DNS lookup failure for Azure Files endpoint. | Technologies like Mesosphere manipulate DNS configuration, causing DNS lookup of... | Mount directly via IP address, or add DNS name and IP mapping into /etc/hosts to... | 🔵 7.0 | ADO Wiki |
| 18 | Access Denied error when trying to mount Azure File Share using storage account key (NTLMv2 authenti... | Storage account SMB security settings restrict authentication methods (e.g., onl... | Check and adjust SMB security settings: PowerShell Update-AzStorageFileServicePr... | 🔵 7.0 | ADO Wiki |
| 19 | Azure Files mount fails with private endpoint configured; DNS resolves storage account to public IP ... | Private DNS zone (privatelink.file.core.windows.net) not associated with the pri... | 1) Verify private DNS zone (privatelink.file.core.windows.net) is associated wit... | 🔵 7.0 | ADO Wiki |
| 20 | Azure Diagnostic Extension fails with error 'Failed to generate a unique diagnostics storage account... | The storage account used for boot diagnostics has Storage Account Firewall enabl... | Navigate to the boot diagnostics storage account > Firewall and Virtual Networks... | 🔵 7.0 | ADO Wiki |
| 21 | Azure Files AAD Kerberos clients connecting through VPN fail to retrieve Kerberos token. klist retur... | VPN misconfiguration preventing Windows clients from reaching AAD Kerberos servi... | 1) Verify client meets prerequisites (Win10/Server 2022 with required patches). ... | 🔵 7.0 | ADO Wiki |
| 22 | Azure Files AAD Kerberos mount prompts for credentials repeatedly. klist returns error 0x80090342 SE... | RC4 encryption is not enabled on the customer domain, causing Kerberos ticket re... | Enable RC4 encryption on the domain. See related TSG: 1396 - The target account ... | 🔵 7.0 | ADO Wiki |
| 23 | Azure Files AAD Kerberos mount prompts for credentials with error: The SAM database on the Windows S... | Storage account AD object is missing or disabled in Active Directory. | 1) Run Get-AzStorageAccountADObject to verify object exists. 2) If missing, rejo... | 🔵 7.0 | ADO Wiki |
| 24 | Old extension files accumulate in /var/lib/waagent on Linux VM, consuming disk space. WALA agent doe... | Older versions of the Windows Azure Linux Agent (WALA) did not perform cleanup o... | Update the WALA agent to version 2.2.44 or later. This version includes automati... | 🔵 7.0 | ADO Wiki |
| 25 | Join-AzStorageAccount cmdlet fails with 'Get-ADDomain: Unable to contact the server. This may be bec... | Active Directory Web Services (ADWS) is not running on domain controller, or por... | 1) Test port 9389: Test-NetConnection <DomainName> -port 9389. 2) Check ADWS in ... | 🔵 7.0 | ADO Wiki |
| 26 | Custom Script Extension (CSE) fails on Windows with error: The remote server returned an error: (404... | The storage account name configured in the CSE command is incorrect, or the blob... | Verify the storage account name is correct in the CSE command. Check that the bl... | 🔵 7.0 | ADO Wiki |
| 27 | Access Denied when trying to update NTFS permissions on Azure File Share via identity-based authenti... | Customer is using cached AD credentials instead of Storage Account Access Key wh... | 1) Drop existing mount. 2) Clear cached credentials via Windows Credential Manag... | 🔵 7.0 | ADO Wiki |
| 28 | System error 5 'Access is denied' when accessing Azure File Share with identity-based auth due to mi... | User missing either share-level RBAC permissions (SMB Reader/Contributor/Elevate... | 1) Verify RBAC via ASC Resource Explorer at storage account/file share level. 2)... | 🔵 7.0 | ADO Wiki |
| 29 | Old extension files accumulate on Linux VM under /var/lib/waagent, consuming disk space | Windows Azure Linux Agent (WALA) versions prior to 2.2.44 do not properly clean ... | Update WALA agent to version 2.2.44 or later. In this version, cleanup is handle... | 🔵 7.0 | ADO Wiki |
| 30 | C:\WindowsAzure\Logs directory filling up with RuntimeEvents_xxxxxx.etl.old and WaAppAgent_xxxxxx.et... | Known bug in older versions of Windows VM Agent (before version 2.7.41491.969) c... | Upgrade Windows VM Agent to latest version (2.7.41491.1030+ recommended) from ht... | 🔵 7.0 | ADO Wiki |

