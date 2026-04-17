# Disk Azure Disk Encryption (ADE) & BitLocker — 综合排查指南

**条目数**: 20 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: mslearn-unlock-encrypted-disk-offline.md, onenote-nfs41-encryption-in-transit-aznfs.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Unlocking an ADE-Encrypted Disk for Offline Repair
> 来源: MS Learn (mslearn-unlock-encrypted-disk-offline.md)

1. **Source**: https://learn.microsoft.com/troubleshoot/azure/virtual-machines/windows/unlock-encrypted-disk-offline
2. - OS disk encrypted with Azure Disk Encryption (ADE/BitLocker) needs offline repair
3. - VM cannot boot and disk must be attached to a repair VM
4. - Determine ADE version: v1 (dual-pass) or v2 (single-pass)
5. - Determine if disk is managed or unmanaged
6. - Key Vault access with BEK/KEK permissions
7. | Condition | Method |
8. |-----------|--------|
9. | ADE v2 + managed + public IP OK | Automated: `az vm repair create` |
10. | ADE v2 + managed + no public IP | Semi-automated: attach during VM creation |

### Phase 2: NFS 4.1 Encryption in Transit (aznfs) Setup & Troubleshooting
> 来源: OneNote (onenote-nfs41-encryption-in-transit-aznfs.md)

1. Azure Files NFS 4.1 supports Encryption in Transit (EiT) via the `aznfs` mount helper, which uses **stunnel** for TLS tunneling. Two watchdog daemons run: `aznfswatchdog` (NFSv3) and `aznfswatchdogv4` (NFSv4.1).
2. Wiki: [Encryption in Transit for Azure Files NFSv4.1 Overview](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2162995/Encryption-in-Transit-for-Azure-Files-NFSv4.1-Overview_Storage)
3. 1. Enable "Enforce Encryption in Transit" on the Azure Files share (Portal)
4. 2. Install aznfs mount helper (Ubuntu):
5. curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/$VERSION_ID")/packages-microsoft-prod.deb
6. sudo dpkg -i packages-microsoft-prod.deb
7. sudo apt-get install aznfs
8. 3. Mount using `aznfs` type:
9. sudo mkdir -p /mount/nfsshare
10. sudo mount -t aznfs <account>.file.core.windows.net:/<account>/<share> /mount/nfsshare \

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Disk Encryption (ADE) fails with error code 2147942487 on Windows VM during BitLocker encryption via AzureDiskEncr | BitLocker policy conflict: custom FVE registry keys under HKLM\SOFTWARE\Policies\Microsoft\FVE (e.g. | Remove extra custom policy keys under Policies\Microsoft\FVE to restore defaults. If previous failed ADE extension exist | 🟢 10 | [MCVKB] |
| 2 | Azure Stack Edge unable to boot to OS; device stuck at Bitlocker Recovery screen; Local WebUI inaccessible even though d | Device unable to boot past Bitlocker due to certain issues that occurred on the device; 50-digit Bit | Connect to BMC at 192.168.100.100 (configure host adapter with static IP 192.168.100.5/24); log in as EdgeUser; open Vir | 🟢 8.5 | [ADO Wiki] |
| 3 | Windows VM with Azure Disk Encryption doesn't start. Boot diagnostics shows BitLocker recovery prompts: 'Plug in USB dri | The VM cannot locate the BitLocker Recovery Key (BEK) file to decrypt the encrypted OS disk. This ty | 1) Stop and deallocate the VM, then restart to force BEK re-retrieval from Azure Key Vault. 2) If that fails, attach the | 🟢 8.5 | [MS Learn] |
| 4 | Enabling Azure Disk Encryption on Windows VM fails with error: 'Azure Disk Encryption extension version 2.2 is not suppo | The subscription does not support ADE extension version 2.2 without the UnifiedDiskEncryptionForVMs  | Method 1: Revert to using Microsoft Entra (AAD) parameters (-AadClientID, -AadClientSecret) in Set-AzVMDiskEncryptionExt | 🟢 8.5 | [MS Learn] |
| 5 | Azure Disk Encryption fails with error 'Failed to send DiskEncryptionData...' when trying to encrypt a VM. | Common causes: 1) Key Vault in different region/subscription than VM, 2) Key Vault advanced access p | 1) Ensure Key Vault same region/subscription as VM. 2) Set Key Vault advanced access policies for disk encryption. 3) Ve | 🟢 8.5 | [MS Learn] |
| 6 | Shared Premium SSD (maxShares > 1) has no host caching and no disk bursting. Performance may be lower than expected comp | Platform limitations for shared disks: host caching is disabled when maxShares > 1 (applies to all s | For performance: consider using Ultra Disk or Premium SSD v2 as shared disks (they don't rely on host caching and offer  | 🔵 7.5 | [MS Learn] |
| 7 | Azure Disk Encryption fails behind a firewall/proxy/NSG with 'Extension status not available on the VM'. Encryption neve | Firewall, proxy, or NSG settings block the ADE extension from reaching required endpoints: Azure Key | 1) Ensure NSG/firewall allows outbound to Key Vault endpoints, Microsoft Entra endpoints (M365 URLs sections 56/59), and | 🔵 7.5 | [MS Learn] |
| 8 | Azure Disk Encryption fails on Windows Server 2016 Server Core because bdehdcfg component is not available by default. | Server Core installations do not include bdehdcfg.exe binary which ADE requires to split system volu | Copy 4 files from Windows Server 2016 Data Center (full) VM: bdehdcfg.exe, bdehdcfglib.dll, en-US/bdehdcfglib.dll.mui, e | 🔵 7.5 | [MS Learn] |
| 9 | Cannot extend encrypted OS volume in Windows VM: Extend Volume grayed out for C: drive. System Reserved partition placed | When ADE/BitLocker applied to custom image VM where C: is partition 1 (no pre-existing System Reserv | Resize OS disk SKU. Extend System Reserved into unallocated (leave 200MB). Create new boot volume, run bcdboot. Copy BCD | 🔵 7.5 | [MS Learn] |
| 10 | Linux VM fails to boot after ADE: emergency mode, /dev/mapper/rootvg-rootlv does not exist. ADE modules missing from ini | Required ADE crypt-ade scripts not included in initramfs during encryption. | Rescue VM chroot. RHEL: dracut -f --regenerate-all. Ubuntu: update-initramfs -u -k all. Verify with lsinitrd. Swap disk  | 🔵 7.5 | [MS Learn] |
| 11 | Linux ADE encryption interrupted: VM emergency mode, LUKS header (osluksheader) missing/corrupted. | ADE interrupted (extension failure/timeout). Partial encryption with missing LUKS header or ADE key  | Restore from backup. If none: create test VM, encrypt data volume same settings, copy ADE key from BEK, chroot to manual | 🔵 7.5 | [MS Learn] |
| 12 | Linux ADE fails: required packages cannot install. Extension log shows package errors. | VM lacks repo access or repo config broken. ADE needs cryptsetup, lvm2 etc. | Ensure repo access. For isolated networks see ADE isolated network docs. Check extension.log for failed package. | 🔵 7.5 | [MS Learn] |
| 13 | Linux ADE boot failure: missing rd.luks.ade.partuuid/bootuuid in GRUB. Emergency mode. | ADE extension failed to add UUID parameters to /etc/default/grub. | Offline: rescue VM chroot, blkid for UUIDs, add rd.luks.ade.partuuid/bootuuid to GRUB, regenerate. | 🔵 7.5 | [MS Learn] |
| 14 | Cannot disable ADE on Linux VM with encrypted OS disk (volumeType=ALL/OS). | Azure does not support disabling ADE when Linux OS disk is encrypted. Only data-disk-only encryption | Encrypted OS: restore from backup or redeploy. Data-only: Disable-AzVMDiskEncryption or az vm encryption disable --volum | 🔵 7.5 | [MS Learn] |
| 15 | Linux VM no-boot after VFAT disabled by hardening tools. Failed to mount /boot/efi or ADE VM shows mount unknown filesys | VFAT needed for /boot/efi on Gen2 UEFI VMs and for BEK VOLUME with ADE keys. Hardening tools add ins | grep -nr vfat /etc/modprobe.d/ to find config. Remove install vfat /bin/true. Regenerate initramfs (dracut -f or mkinitr | 🔵 7.5 | [MS Learn] |
| 16 | Azure portal shows disk as encrypted even after it was manually decrypted inside the VM using manage-bde. VM may fail to | Using low-level commands (manage-bde) to decrypt disk inside VM bypasses ADE management layer. Platf | Always use ADE management commands: PowerShell Disable-AzVMDiskEncryption then Remove-AzVMDiskEncryptionExtension (in th | 🔵 7.0 | [MS Learn] |
| 17 | VM backup snapshot fails: 'ExtensionSnapshotBitlockerError - This drive is locked by BitLocker Drive Encryption'. VSS sn | BitLocker Drive Encryption on VM drives blocks the VSS snapshot operation used by Azure Backup. | Turn off BitLocker for all drives on the VM (or the problematic drives), verify VSS issue resolved, retry backup. | 🔵 7.0 | [MS Learn] |
| 18 | Azure Disk Encryption (ADE/BitLocker/DM-Crypt) cannot be enabled on shared disks. Deployment fails. | Azure Disk Encryption (guest-level) is not supported for shared disks (maxShares > 1). Only server-s | Use server-side encryption (SSE) with platform-managed keys (default) or customer-managed keys via DiskEncryptionSet ins | 🔵 7.0 | [MS Learn] |
| 19 | Azure VM encrypted with ADE - OS disk appears locked with padlock icon when attached to repair VM for offline troublesho | Disk encrypted with BitLocker via ADE. When attached to a different VM as data disk, it remains lock | For ADE v2 (single-pass, managed disk): Use 'az vm repair create' for automated unlock, or attach disk during repair VM  | 🔵 6.0 | [MS Learn] |
| 20 | Ubuntu 14.04 ADE fails: OOM Killer terminates dd during OS encryption. | Kernel 4.4 bug: OOM Killer improperly kills dd. Fixed in Azure-tuned kernel 4.15+. | Update kernel: apt-get install linux-azure, reboot. Verify uname -a. Ensure VM agent >= 2.2.38. | 🔵 6.0 | [MS Learn] |
