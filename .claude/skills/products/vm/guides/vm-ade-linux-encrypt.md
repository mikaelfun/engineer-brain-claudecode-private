# VM ADE Linux 加密 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 32 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | RunCommand v2 (Managed RunCommand) upgrade fails with 'InternalExecutionError/FabricInternalOperatio | Upgrade from RunCommand v2 extension (Windows 2.0.4->2.0.5, Linux 1.3.1->1.3.2)  | Delete all RunCommand v2 resources: Get-AzVmRunCommand then loop Remove-AzVMRunC | 🔵 7.5 | AW |
| 2 | VM extension deployment fails on Linux distros with Python 3.x (Ubuntu 20.04, RHEL 8.1, CentOS 8.1); | Linux distributions transitioning to Python 3.x removed legacy /usr/bin/python e | Reinstall python symlink: Ubuntu: sudo apt install python-is-python2; RHEL/CentO | 🔵 7.5 | AW |
| 3 | VM extension deployment fails on Linux VMs running Python 3.x with missing /usr/bin/python entrypoin | Linux distributions transitioned to Python 3.x and removed the legacy /usr/bin/p | Reinstall python entrypoint: For Ubuntu: sudo apt update && sudo apt install pyt | 🔵 7.5 | AW |
| 4 | ACSS Monitoring Extension installation fails with OperationNotAllowed - ARM template deployment fail | The ACSS monitoring extension was onboarded for auto-upgrade but was not added t | A hotfix was released to disable the enableAutomaticUpgrade flag for monitoring  | 🔵 7.5 | AW |
| 5 | VM using legacy ADE Dual Pass (with AAD) encryption needs migration to current Single Pass (without  | ADE Dual Pass (with AAD) is deprecated legacy version that relies on Azure AD fo | Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> -VMName <vm> -Migrat | 🔵 7.5 | AW |
| 6 | VM is running ADE Dual Pass (with AAD) encryption - older ADE version (Windows: 1.1.*, Linux: 0.1.*) | VM was encrypted with the older ADE version that relied on Azure Active Director | Migrate using PowerShell: Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg | 🔵 7.5 | AW |
| 7 | Linux VM data disk secrets lost after boot: LinuxPassPhraseFileName_1_0 missing from /mnt/azure_bek_ | Race condition between ADE and Fast Attach/Detach (FAD) during VM creation. CRP  | Deallocate and start the VM to remount BEK volume with data disk secrets. For no | 🔵 7.5 | AW |
| 8 | Defender for Cloud shows non-compliance alerts (Windows/Linux VMs should enable ADE or EncryptionAtH | VM missing system-assigned managed identity or AzurePolicyforWindows/AzurePolicy | Enable system-assigned identity on VM (Identity > ON), install Azure Machine Con | 🔵 7.5 | AW |
| 9 | RHEL 9 VM enters emergency mode after enabling ADE, boot filesystem /boot mount failure with empty b | grub2-mkconfig on RHEL9 with grub2-tools >= 2.06-69 requires --update-bls-cmdlin | Attach disk to rescue VM, chroot into the filesystem. Run: grub2-mkconfig --upda | 🔵 7.5 | AW |
| 10 | Azure Support Center (ASC) disk search shows EncryptionType for SSE+CMK encrypted disks, but does no | ASC EncryptionType property (e.g. EncryptionAtRestWithCustomerKey) only reflects | To check CMK: use PowerShell Get-AzDisk and inspect $disk.Encryption.Type, or se | 🔵 7.5 | AW |
| 11 | Need to encrypt Linux VM data disks with ADE using KEK via Azure CLI. Customer prefers CLI over Powe |  | az vm encryption enable --resource-group RG --name VM --disk-encryption-keyvault | 🔵 7.5 | AW |
| 12 | ADE Dual Pass encryption setup fails or customer is confused about AAD App and Service Principal req | Dual Pass ADE (legacy) requires an AAD Application registration with Service Pri | Create AAD App: az ad sp create-for-rbac --name AppName --role Contributor --sco | 🔵 7.5 | AW |
| 13 | Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB rescue prompt ('Minim | During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cyli | 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=se | 🔵 7.5 | AW |
| 14 | ASR Mobility service shows old version (e.g., 9.15.2) in Azure Portal after upgrade to newer version | Upgrade completed with exit code 209 (EP0903) meaning the upgrade succeeded but  | Reboot the source Linux/Windows VM to allow system changes from the mobility ser | 🔵 7.5 | ON |
| 15 | Mooncake RHEL VM: Only selected data disk for Azure Disk Encryption, but after encryption both OS an | Mooncake RHEL images (provided by 21Vianet) use LVM for OS disk (/dev/mapper/rhe | This is a known limitation of Mooncake RHEL images. The OS disk is not actually  | 🔵 7 | ON |
| 16 | Linux VM cannot boot via SSH, drops to GRUB shell showing "Minimal BASH-like line editing is support | GRUB bootloader is unable to start because: (1) GRUB configuration file (/boot/g | Create rescue VM, enter chroot environment. Regenerate GRUB config: RHEL/CentOS  | 🔵 6.5 | AW |
| 17 | Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - the VM is encrypted wi | CloudLink encryption uses a Linux-based machine to manage encryption keys. If th | Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involv | 🔵 6.5 | AW |
| 18 | RHEL 7/8 Gen 2 Azure VM fails to boot with 'Failed to open \EFI\redhat\grubx64.efi Not Found' - rebo | Missing grubx64.efi file from the EFI system partition. Can be caused by misconf | Create RHEL Gen2 rescue VM with same distro, attach broken OS disk copy, mount a | 🔵 6.5 | AW |
| 19 | Linux VM kernel panic after kernel upgrade/downgrade - kernel BUG or boot failure with new kernel ve | Kernel upgrade incompatibility or bug; kernel downgrade left missing modules; ke | Boot previous kernel via Serial Console or ALAR scripts (az vm repair run --run- | 🔵 6.5 | ML |
| 20 | Provisioning timeout or failure when deploying custom Linux image. Generalized image uploaded as spe | Image type mismatch: generalized image uploaded/captured as specialized causes p | Upload/capture with correct setting matching OS state. Run -deprovision before u | 🔵 6.5 | ML |
| 21 | ADE Linux boot failure. Emergency mode. /dev/mapper/rootvg-rootlv missing. ADE modules not in initra | 91adeOnline (RHEL) or crypt-ade-boot/hook (Ubuntu) missing from initramfs. | Repair VM + chroot. RHEL: copy 91adeOnline, dracut -f. Ubuntu: copy crypt-ade-bo | 🔵 6.5 | ML |
| 22 | Gen2 Linux VM fails to boot: boot loader did not load an operating system / boot image not found - U | UEFI (EFI System) boot loader partition missing or deleted from OS disk. | Create repair VM via az vm repair, recreate EFI partition with gdisk (correct se | 🔵 5.5 | ML |
| 23 | Gen2 Linux VM fails to boot - UEFI EFI partition corrupted (dirty bit set) | UEFI vfat partition corrupted, preventing boot loader from reading EFI System pa | Create repair VM, run fsck.vfat on EFI partition to remove dirty bit, then resto | 🔵 5.5 | ML |
| 24 | Linux VM extensions stop running; extension downgrade error in /var/log/waagent.log: Downgrade not a | Bug in Linux VM Agent versions 2.2.21 to 2.2.24 prevents extension processing du | Remove all *.manifest.xml files in /var/lib/waagent/ to resolve immediately; alt | 🔵 5.5 | ML |
| 25 | SLES Gen2 VM won t start after SP1->SP2 upgrade: grub_file_filters not found or grub_verify string n | After Gen2 VM stop/deallocate, Hyper-V doesn t preserve startup entries, GRUB co | Chroot rescue VM, reinstall GRUB: /usr/sbin/shim-install --config-file=/boot/gru | 🔵 5.5 | ML |
| 26 | Oracle Linux 8 SP2 VM: Failed to start Switch Root after GRUB package update. | GRUB update corrupts boot entries. kernelopts missing from /boot/loader/entries/ | Boot rescue kernel, copy kernelopts from grubenv, add to boot entry + earlyprint | 🔵 5.5 | ML |
| 27 | Linux VM does not start correctly after LIS 4.1.3 upgrade on kernel 3.10.0-514.16, depmod warnings a | Kernel ABI changes in kernel 3.10.0-514.16.1 cause LIS 4.1.3 driver upgrade to f | Do not upgrade LIS 4.1.3 on kernel 3.10.0-514.16.1. Install LIS 4.2.0 or later. | 🔵 5.5 | ML |
| 28 | Linux VM fails to boot after VFAT disabled. Failed to mount /boot/efi. ADE VMs cannot mount BEK VOLU | VFAT required for /boot/efi (Gen2) and ADE BEK VOLUME. Hardening tools disable v | Remove 'install vfat /bin/true' from /etc/modprobe.d/, regenerate initramfs. Gen | 🔵 5.5 | ML |
| 29 | ADE encryption interrupted. Linux VM stuck in emergency mode after failed ADE deployment. | ADE deployment failed/interrupted midway. Python errors or device not found in e | Restore from backup. Or: az vm repair, check prerequisites, LUKS header, initram | 🔵 5.5 | ML |
| 30 | Ubuntu ADE fails. Boot partition too small for initramfs regeneration. | ADE splits /boot; insufficient space for new initramfs. Ubuntu-specific. | Delete old kernels. Ubuntu 24+ has 1GB+ boot partition. | 🔵 5.5 | ML |
| 31 | ADE fails. VFAT module disabled, BEK volume unmountable, key inaccessible. | VFAT kernel module disabled. BEK volume (FAT) cannot mount. | Enable VFAT kernel module. | 🔵 5.5 | ML |
| 32 | ADE encrypted Linux OS disk unrecoverable. osluksheader missing/corrupted. | LUKS header file osluksheader corrupted/missing. Without it, partition cannot be | Restore osluksheader from backup. No backup = unrecoverable. | 🔵 5.5 | ML |

## 快速排查路径

1. **RunCommand v2 (Managed RunCommand) upgrade fails with 'InternalExecutionError/Fa**
   - 根因: Upgrade from RunCommand v2 extension (Windows 2.0.4->2.0.5, Linux 1.3.1->1.3.2) conflicts with previously deployed RunCo
   - 方案: Delete all RunCommand v2 resources: Get-AzVmRunCommand then loop Remove-AzVMRunCommand (ignore errors). Verify count=0. Subsequent operations use late
   - `[🔵 7.5 | AW]`

2. **VM extension deployment fails on Linux distros with Python 3.x (Ubuntu 20.04, RH**
   - 根因: Linux distributions transitioning to Python 3.x removed legacy /usr/bin/python entrypoint; extensions still referencing 
   - 方案: Reinstall python symlink: Ubuntu: sudo apt install python-is-python2; RHEL/CentOS: sudo dnf install python2 && sudo alternatives --set python /usr/bin
   - `[🔵 7.5 | AW]`

3. **VM extension deployment fails on Linux VMs running Python 3.x with missing /usr/**
   - 根因: Linux distributions transitioned to Python 3.x and removed the legacy /usr/bin/python entrypoint; affected extensions st
   - 方案: Reinstall python entrypoint: For Ubuntu: sudo apt update && sudo apt install python-is-python2. For RHEL/CentOS: sudo dnf install python2 && sudo alte
   - `[🔵 7.5 | AW]`

4. **ACSS Monitoring Extension installation fails with OperationNotAllowed - ARM temp**
   - 根因: The ACSS monitoring extension was onboarded for auto-upgrade but was not added to the GASupportedExtensions list (a requ
   - 方案: A hotfix was released to disable the enableAutomaticUpgrade flag for monitoring extensions installed from the service. Customer needs to delete the VI
   - `[🔵 7.5 | AW]`

5. **VM using legacy ADE Dual Pass (with AAD) encryption needs migration to current S**
   - 根因: ADE Dual Pass (with AAD) is deprecated legacy version that relies on Azure AD for authentication
   - 方案: Run Set-AzVMDiskEncryptionExtension -ResourceGroupName <rg> -VMName <vm> -Migrate (requires Az module >= 5.9.0). VM will reboot during migration. Veri
   - `[🔵 7.5 | AW]`

