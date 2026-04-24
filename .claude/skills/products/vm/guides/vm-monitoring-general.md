# VM 监控通用问题 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 15 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Compute Gallery image version replication fails with ReplicationJobsTimedOut error when source | Replication times out when gallery image version contains large disks (>100GB).  | 1) Check if disks really need to be that large. 2) Keep source and destination r | 🔵 7.5 | AW |
| 2 | Need to verify if SSE+CMK (Customer Managed Key) encryption is enabled on an Azure managed disk |  | PowerShell: $disk = Get-AzDisk -ResourceGroupName $RG -DiskName $DiskName; $disk | 🔵 7.5 | AW |
| 3 | System error 5 'Access is denied' when mounting Azure File Share due to SMB cipher order mismatch (W | Windows 11/Server 2022 default SMB cipher order (e.g. AES-128-CCM first) conflic | Change cipher order on client: Set-SmbClientConfiguration -EncryptionCiphers 'AE | 🔵 7.5 | AW |
| 4 | ACSS monitoring extension fails with HealthAndStatusConnectivityIssueToCrlEndpoint error - unable to | Connectivity issue between the ASCS VM and required CRL (Certificate Revocation  | Engage Azure Networking on collaboration. Verify customer has configured network | 🔵 7.5 | AW |
| 5 | Need to determine if a VM uses Dual Pass or Single Pass Azure Disk Encryption (ADE) |  | Check ADE extension version in VM Extensions blade: Windows - version 1.x = Dual | 🔵 7.5 | AW |
| 6 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup | GRUB superuser password protection is enabled (set before VHD upload to Azure or | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr | 🔵 7.5 | AW |
| 7 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an | The OS boot process could not locate an active system partition - the system par | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att | 🔵 7.5 | AW |
| 8 | Azure Files Kerberos authentication fails; storage account SPN (cifs/storageaccount.file.core.window | Storage account was not properly domain-joined to ADDS via Join-AzStorageAccount | 1) Verify SPN exists: setspn -q cifs/<storageaccount>.file.core.windows.net. If  | 🔵 7.5 | AW |
| 9 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying  | VMware Image Customization Initialization module is enabled on the VM (similar t | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu | 🔵 7.5 | AW |
| 10 | ACSS Monitoring Extension installation fails and VIS Health/Status errors out after VIS deletion and | The Monitoring Extension was not manually uninstalled from SCS VMs after the pre | Before re-registering a VIS with ACSS after deletion: 1) Navigate to SCS VM(s) 2 | 🔵 6.5 | AW |
| 11 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g.,  | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates | 🔵 6.5 | AW |
| 12 | Elastic SAN disk unexpectedly unmounts during Windows Failover Cluster restart. iSCSI initiator fail | iSCSI initiator session timeout (LinkDownTime) defaults to 15 seconds, which is  | Increase iSCSI initiator session timeout (LinkDownTime) to 30 seconds. See: http | 🔵 6.5 | AW |
| 13 | Azure Files and Folders (MARS agent) backup job completes with warning: certain files could not be b | File locked in use by another process during backup: C:\WindowsAzure\Logs\Plugin | If warning is about the VM diagnostics log folder (C:\WindowsAzure\Logs\Plugins\ | 🔵 6.5 | ON |
| 14 | Error when browsing Azure file share in portal: You do not have permission to use the access key to  | Storage account key-based access is disabled at the account level in the configu | Enable key-based access at the storage account level in Configuration settings v | 🔵 6.5 | AW |
| 15 | Data disks show "The disk is write-protected. Remove the write-protection or use another disk" when  | GPO or tattooed GPO setting FDVDenyWriteAccess=1 at HKLM\SYSTEM\CurrentControlSe | Remove registry: reg delete "HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FV | 🔵 5.0 | AW |

## 快速排查路径

1. **Azure Compute Gallery image version replication fails with ReplicationJobsTimedO**
   - 根因: Replication times out when gallery image version contains large disks (>100GB). Large disk sizes cause replication jobs 
   - 方案: 1) Check if disks really need to be that large. 2) Keep source and destination regions close. 3) Set replicaCount to 1 initially. 4) If one region fai
   - `[🔵 7.5 | AW]`

2. **Need to verify if SSE+CMK (Customer Managed Key) encryption is enabled on an Azu**
   - 方案: PowerShell: $disk = Get-AzDisk -ResourceGroupName $RG -DiskName $DiskName; $disk.Encryption.Type. Result "EncryptionAtRestWithCustomerKey" confirms SS
   - `[🔵 7.5 | AW]`

3. **System error 5 'Access is denied' when mounting Azure File Share due to SMB ciph**
   - 根因: Windows 11/Server 2022 default SMB cipher order (e.g. AES-128-CCM first) conflicts with storage account Maximum Security
   - 方案: Change cipher order on client: Set-SmbClientConfiguration -EncryptionCiphers 'AES_256_GCM, AES_256_CCM, AES_128_GCM, AES_128_CCM'. Check current: get-
   - `[🔵 7.5 | AW]`

4. **ACSS monitoring extension fails with HealthAndStatusConnectivityIssueToCrlEndpoi**
   - 根因: Connectivity issue between the ASCS VM and required CRL (Certificate Revocation List) endpoints. The monitoring extensio
   - 方案: Engage Azure Networking on collaboration. Verify customer has configured network prerequisites per public doc (Prepare Network for Infrastructure Depl
   - `[🔵 7.5 | AW]`

5. **Need to determine if a VM uses Dual Pass or Single Pass Azure Disk Encryption (A**
   - 方案: Check ADE extension version in VM Extensions blade: Windows - version 1.x = Dual Pass, version 2.x = Single Pass. Linux - version 0.x = Dual Pass, ver
   - `[🔵 7.5 | AW]`

