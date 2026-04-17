# VM Vm Boot Diagnostics — 排查速查

**来源数**: 3 | **21V**: 未标注
**条目数**: 15 | **关键词**: boot, diagnostics
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Microsoft engineer cannot re-submit a second Customer Lockbox request for the same support case; sec... | Customer Lockbox enforces a per-case cooldown: a second request for the same cas... | Wait 4 days before re-triggering. If urgent, escalate via IcM to 'Azure LockBox\... | 🟢 8.0 | ADO Wiki |
| 2 | 客户询问 Azure VM 是否受 LogoFAIL 固件漏洞（UEFI boot loader firmware vulnerability）影响 | LogoFAIL 漏洞需攻击者预先获得 OS 完整控制权（admin/root 级别）才可利用；大多数 Azure 裸金属机器不使用 boot loader 镜... | Azure VM 不受 LogoFAIL 影响。使用 Surface 等硬件设备的客户需联系硬件厂商获取固件更新。建议遵循 Zero Trust 安全模型（ht... | 🟢 8.0 | ADO Wiki |
| 3 | Customer reports vulnerability scanner findings or alerts on Azure VM (Microsoft Defender or 3rd-par... |  | 1) Gather: scanner name/vendor, Microsoft vs 3rd-party, version (if Defender), a... | 🟢 8.0 | ADO Wiki |
| 4 | TransparentInstaller.log shows System.TypeLoadException: Could not load type 'System.Runtime.Diagnos... | Outdated .NET Framework version on the VM (below 4.5.2) | Update .NET Framework to version 4.5.2 or 4.6.2 depending on OS. Download: https... | 🟢 8.0 | ADO Wiki |
| 5 | TransparentInstaller.log shows System.TypeLoadException: Could not load type System.Runtime.Diagnost... | Outdated .NET Framework version on Windows VM | Update .NET Framework to 4.5.2 or 4.6.2 depending on OS: https://www.microsoft.c... | 🟢 8.0 | ADO Wiki |
| 6 | Azure VM Bugcheck 7B. Boot driver .sys NOT found in System32/drivers per 7Bchecks. | Missing driver .sys in System32/drivers from corruption/update failure. | Copy from DriverStore/FileRepository or identical server. SFC scan. | 🟢 8.0 | ADO Wiki |
| 7 | Azure VM Bugcheck 7B. Third-party filter drivers in Upperfilter/LowerFilter per 7Bchecks. | Filter drivers interfere with boot device access. | Remove third-party entries from HKLM ControlSet Services Upperfilter/LowerFilter... | 🟢 8.0 | ADO Wiki |
| 8 | After installing July 2018 security patches (KB4338825, KB4338814, etc.), VMs running network worklo... | Regression caused by MSRC case 44653 shipped in July 2018 (07B) patches, introdu... | If VM is accessible (online): install resolving KB (e.g., KB4345421 for RS4, KB4... | 🟢 8.0 | ADO Wiki |
| 9 | Windows VM stuck during boot with "Error C0000265 applying update operations" during Windows Update,... | Core file during KB installation reached NTFS hardlink limit. PendingDeletes ent... | Offline: (1) Open \windows\winsxs\poqexec.log, find line with error c0000265 to ... | 🟢 8.0 | ADO Wiki |
| 10 | rsync to NFS Azure File Share fails with rsync: chown filename failed: Invalid argument (22). Occurs... | NFS v4.1 on Azure Files only accepts numeric UID/GID. NFS v4 passes identities a... | Disable ID mapping: echo 'options nfs nfs4_disable_idmapping=1' > /etc/modprobe.... | 🟢 8.0 | ADO Wiki |
| 11 | VM screenshot shows 'Working on features ##% complete Don't turn off your computer' and VM is stuck ... | Customer added or removed a Windows Server role or feature, and the operation is... | Take multiple screenshots to validate if progress is being made. Only intercede ... | 🟢 8.0 | ADO Wiki |
| 12 | Linux VM fails to boot after VFAT disabled. Failed to mount /boot/efi. ADE VMs cannot mount BEK VOLU... | VFAT required for /boot/efi (Gen2) and ADE BEK VOLUME. Hardening tools disable v... | Remove 'install vfat /bin/true' from /etc/modprobe.d/, regenerate initramfs. Gen... | 🔵 7.0 | MS Learn |
| 13 | ADE Linux boot failure. Emergency mode. /dev/mapper/rootvg-rootlv missing. ADE modules not in initra... | 91adeOnline (RHEL) or crypt-ade-boot/hook (Ubuntu) missing from initramfs. | Repair VM + chroot. RHEL: copy 91adeOnline, dracut -f. Ubuntu: copy crypt-ade-bo... | 🔵 7.0 | MS Learn |
| 14 | Ubuntu ADE fails. Boot partition too small for initramfs regeneration. | ADE splits /boot; insufficient space for new initramfs. Ubuntu-specific. | Delete old kernels. Ubuntu 24+ has 1GB+ boot partition. | 🔵 7.0 | MS Learn |
| 15 | Reference: DSS data classification standards for handling Azure VM support data including crash dump... |  | DSS classifications: Content Data (VM data, crash dumps, customer files) = Highl... | 🟢 8.5 | OneNote |
