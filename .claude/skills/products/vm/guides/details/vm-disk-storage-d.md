# VM Vm Disk Storage D — 综合排查指南

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
| Admin Consent not granted on Entra application for | 1 条相关 | 1) Grant Admin Consent on the Entra app registration. 2) Ena... |
| Application Tag for cloud-only SIDs preview not en | 1 条相关 | Enable the cloud-only SIDs preview tag in the Entra applicat... |
| The metadata database for Azure File Sync objects  | 1 条相关 | 1. Check Per-Item Errors in ASC for the Sync Service. 2. Res... |
| VSS sync scheduled task runs daily and cancels the | 1 条相关 | Disable the VSS sync scheduled task until initial upload is ... |
| Server endpoint has not logged sync activity in pa | 1 条相关 | Check current sync activity per docs. If max concurrent sess... |
| Server does not meet prerequisites: requires v19 a | 1 条相关 | Verify the server meets all prerequisites (v19+ agent, syste... |
| Service-managed identity does not have access to t | 1 条相关 | Run Set-AzStorageSyncCloudEndpointPermission cmdlet to fix p... |
| Server-managed identity or service-managed identit | 1 条相关 | Run Set-AzStorageSyncServerEndpointPermission (for server MI... |
| Allow Azure services on the trusted services list  | 1 条相关 | Enable the trusted services exception on the storage account... |
| Azure file share has reached its 5TB size limit an | 1 条相关 | Ask customer to expand file share size to Large File Share v... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Missing Kerberos Service Ticket when mounting Azure Files SMB with Entra-Only Kerberos; klist shows ... | Admin Consent not granted on Entra application for Azure Files SMB authenticatio... | 1) Grant Admin Consent on the Entra app registration. 2) Enable client setting t... | 🔵 7.0 | ADO Wiki |
| 2 | Cannot use cloud-only Entra groups for file-level permissions on Azure Files SMB share | Application Tag for cloud-only SIDs preview not enabled in Entra app manifest | Enable the cloud-only SIDs preview tag in the Entra application manifest file. R... | 🔵 7.0 | ADO Wiki |
| 3 | Azure File Sync error ECS_E_SYNC_METADATA_KNOWLEDGE_LIMIT_REACHED (HRESULT 0x80c8021c / -2134375908)... | The metadata database for Azure File Sync objects is full. Once this database fi... | 1. Check Per-Item Errors in ASC for the Sync Service. 2. Resolve per-item errors... | 🔵 7.0 | ADO Wiki |
| 4 | Azure File Sync initial upload experiences long delays. Error: ECS_E_SYNC_CANCELLED_BY_VSS (-2134375... | VSS sync scheduled task runs daily and cancels the ongoing initial upload sync s... | Disable the VSS sync scheduled task until initial upload is completed. Re-enable... | 🔵 7.0 | ADO Wiki |
| 5 | Azure File Sync server endpoint health status shows 'No Activity' in portal, while Registered Server... | Server endpoint has not logged sync activity in past two hours. Possible causes:... | Check current sync activity per docs. If max concurrent sessions reached, wait f... | 🔵 7.0 | ADO Wiki |
| 6 | Set-AzStorageSyncServiceIdentity cmdlet does not configure server to use system-assigned managed ide... | Server does not meet prerequisites: requires v19 agent, system-assigned managed ... | Verify the server meets all prerequisites (v19+ agent, system-assigned MI enable... | 🔵 7.0 | ADO Wiki |
| 7 | Azure File Sync session fails with error 0x80c8305f (ECS_E_EXTERNAL_STORAGE_ACCOUNT_AUTHORIZATION_FA... | Service-managed identity does not have access to the storage account | Run Set-AzStorageSyncCloudEndpointPermission cmdlet to fix permissions for the s... | 🔵 7.0 | ADO Wiki |
| 8 | Azure File Sync files fail to sync with error 0x80c86063 (ECS_E_AZURE_AUTHORIZATION_PERMISSION_MISMA... | Server-managed identity or service-managed identity does not have access to the ... | Run Set-AzStorageSyncServerEndpointPermission (for server MI) or Set-AzStorageSy... | 🔵 7.0 | ADO Wiki |
| 9 | Test-NetworkConnectivity cmdlet fails with 0x80131500 (COR_E_EXCEPTION) when using managed identitie... | Allow Azure services on the trusted services list to access this storage account... | Enable the trusted services exception on the storage account firewall settings | 🔵 7.0 | ADO Wiki |
| 10 | Azure File Sync upload fails with error ECS_E_NOT_ENOUGH_REMOTE_STORAGE - file share at 5TB limit | Azure file share has reached its 5TB size limit and cannot accept more data from... | Ask customer to expand file share size to Large File Share via Azure portal | 🔵 7.0 | ADO Wiki |
| 11 | Azure File Sync agent installation fails or server registration fails after agent install with certi... | Older agent version conflict or expired/invalid server certificate prevents regi... | Uninstall old agent first, install latest. For cert errors: Import-Module Storag... | 🔵 7.0 | ADO Wiki |
| 12 | AFSUpdater hangs indefinitely during Azure File Sync agent update, no installer logs generated, agen... | Known bug in Storage Sync Agent versions < 16.2.0 where LogMan process blocks th... | Workaround: Open Task Manager, kill LogMan process repeatedly until installation... | 🔵 7.0 | ADO Wiki |
| 13 | Azure File Sync server registration fails - AfsSrvRegistration log shows error, possibly network or ... | Network connectivity issues or invalid/expired server certificate preventing reg... | Run Debug-StorageSyncServer -Diagnose and Debug-StorageSyncServer -TestNetworkCo... | 🔵 7.0 | ADO Wiki |
| 14 | Azure File Sync server registration displays: This server is already registered | Server was previously registered with a different Storage Sync Service and the r... | Run Import-Module StorageSync.Management.ServerCmdlets.dll then Reset-StorageSyn... | 🔵 7.0 | ADO Wiki |
| 15 | Azure File Sync tiered multimedia files show partial content download when recalled - file not fully... | Expected behavior (by design). Azure File Sync only recalls the requested data r... | No action needed - by design for multimedia files. AFS efficiently recalls only ... | 🔵 7.0 | ADO Wiki |
| 16 | AFS server endpoint cannot recall files from cloud endpoint with error 0x80072f8f (-2147012721), net... | Firewall proxy or gateway blocks access to PKI/OCSP URLs required for SSL certif... | Ensure server can access PKI URLs: microsoft.com/pki/mscorp/cps, crl.microsoft.c... | 🔵 7.0 | ADO Wiki |
| 17 | Azure File Sync download fails with -2134375877 (ECS_E_SYNC_METADATA_KNOWLEDGE_SOFT_LIMIT_REACHED) a... | Data was copied from a server with Data Deduplication enabled creating dedup rep... | Install Data Deduplication role on the server endpoint: Install-WindowsFeature -... | 🔵 7.0 | ADO Wiki |
| 18 | After ASR test failover, target VM fails to boot with grub2 files missing: /grub2/i386-pc/normal.mod... | OS disk was swapped while VM replication was enabled without reconfiguring repli... | Cleanup test failover, disable replication, re-enable replication (reconfigure),... | 🔵 7.0 | ADO Wiki |
| 19 | VM shows error 0xC0000605 "A component of the operating system has expired" and cannot boot | VM was built from a preview/trial OS image (not RTM release), trial period has e... | No fix. Customer must delete VM (keep disks), mount OS disk to another VM to cop... | 🔵 7.0 | ADO Wiki |
| 20 | Windows VM stuck during boot with "Error C01A001D applying update operations" during Windows Update ... | OS disk is full, system cannot write files during KB installation causing primit... | Offline: Attach OS disk to rescue VM, free disk space (delete temp files, old up... | 🔵 7.0 | ADO Wiki |
| 21 | Black screen after entering RDP credentials; user profile does not finish loading; VM has network co... | Winlogon cannot complete logon and policy processing; a process or thread is dea... | Collect a memory dump while the VM is in the failing state and analyze it to ide... | 🔵 7.0 | ADO Wiki |
| 22 | Black screen on both VM console screenshot and RDP session; Desktop Window Manager (dwm.exe) crashes... | OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to... | Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cle... | 🔵 7.0 | ADO Wiki |
| 23 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr... | Brute force RDP attack over the internet causing CPU/memory performance spike, e... | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM ... | 🔵 7.0 | ADO Wiki |
| 24 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window... | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han... | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in... | 🔵 7.0 | ADO Wiki |
| 25 | Azure VM screenshot shows 'Please wait for the Local Session Manager' - OS hangs waiting for Local S... | Local Session Manager service is stuck during startup. Root cause depends on mem... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🔵 7.0 | ADO Wiki |
| 26 | Azure VM screenshot shows 'Please wait for the TrustedInstaller' - OS hangs waiting for TrustedInsta... | TrustedInstaller (Windows Modules Installer) service is stuck during boot, typic... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🔵 7.0 | ADO Wiki |
| 27 | Azure VM screenshot shows Windows Boot Manager menu waiting for user input to select boot partition ... | VM BCD configuration has displaybootmenu enabled with a boot delay, causing VM t... | Disable BCD displaybootmenu flag. For CRP machines: set displaybootmenu to 'no' ... | 🔵 7.0 | ADO Wiki |
| 28 | Azure VM enters reboot loop or goes to Stopped state after installing Windows cumulative updates (e.... | When VM is shutdown from Azure portal, Windows Updates get applied during shutdo... | Offline troubleshooting required: attach OS disk to repair VM, uninstall the pro... | 🔵 7.0 | ADO Wiki |
| 29 | Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB rescue prompt ('Minim... | During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cyli... | 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=se... | 🔵 7.0 | ADO Wiki |
| 30 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R... | Windows shutdown process performing system maintenance (binary updates, role/fea... | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN... | 🔵 7.0 | ADO Wiki |

