# VM Vm Provisioning F — 综合排查指南

**条目数**: 30 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md)
**Kusto 引用**: [provisioning-timeout.md](../../../kusto/vm/references/queries/provisioning-timeout.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — provisioning-timeout.md]`

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure endpoint (Classic) misconfiguration: either  | 1 条相关 | For ACL issue: Go to Azure portal endpoint configuration, re... |
| Debian uses ens33 (or ens33p0) interface names ins | 1 条相关 | Attach OS disk to rescue VM and chroot. 1) Fix GRUB: edit /e... |
| OS Bug 5880648 - GPO Local Users and Groups policy | 1 条相关 | 1) Backup OS disk. 2) ONLINE: Use hang scenario mitigation t... |
| GPO Registry policy processing hangs during boot.  | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| GPO Scheduled Tasks policy processing hangs during | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| GPO Services policy processing hangs during boot.  | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| GPO Shortcuts policy processing hangs during boot. | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| Registry policy processing hangs during boot. Root | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| Security policy processing hangs during boot. Root | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |
| GPO Software Installation policy processing hangs  | 1 条相关 | ONLINE troubleshooting: Use hang scenario mitigation templat... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot RDP/SSH to Azure VM via VIP. VM screenshot shows OS at login. RDP via jumpbox to DIP works fi... | Azure endpoint (Classic) misconfiguration: either (1) an ACL on the endpoint blo... | For ACL issue: Go to Azure portal endpoint configuration, review and remove rest... | 🔵 7.0 | ADO Wiki |
| 2 | Cannot SSH to Debian 9.1 (Stretch) Linux VM created from a specialized disk. No VIP/DIP connectivity... | Debian uses ens33 (or ens33p0) interface names instead of eth0, which violates A... | Attach OS disk to rescue VM and chroot. 1) Fix GRUB: edit /etc/default/grub, set... | 🔵 7.0 | ADO Wiki |
| 3 | Azure VM not booting, stuck at "Applying Group Policy Local Users and Groups" on boot screenshot. OS... | OS Bug 5880648 - GPO Local Users and Groups policy processing causes hang/deadlo... | 1) Backup OS disk. 2) ONLINE: Use hang scenario mitigation template (NMI crash d... | 🔵 7.0 | ADO Wiki |
| 4 | Azure VM not booting, stuck at "Applying Group Policy Registry policy" on boot screenshot. | GPO Registry policy processing hangs during boot. Root cause depends on memory d... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 5 | Azure VM not booting, stuck at "Applying Group Policy Scheduled Tasks policy" on boot screenshot. | GPO Scheduled Tasks policy processing hangs during boot. Root cause depends on m... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 6 | Azure VM not booting, stuck at "Applying Group Policy Services policy" on boot screenshot. | GPO Services policy processing hangs during boot. Root cause depends on memory d... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 7 | Azure VM not booting, stuck at "Applying Group Policy Shortcuts policy" on boot screenshot. | GPO Shortcuts policy processing hangs during boot. Root cause depends on memory ... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 8 | Azure VM not booting, stuck at "Applying Registry policy" on boot screenshot (general Registry polic... | Registry policy processing hangs during boot. Root cause depends on memory dump ... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 9 | Azure VM not booting, stuck at "Applying security policy to the system" on boot screenshot. | Security policy processing hangs during boot. Root cause depends on memory dump ... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 10 | Azure VM not booting, stuck at "Applying Software Installation policy" on boot screenshot. | GPO Software Installation policy processing hangs during boot. Root cause depend... | ONLINE troubleshooting: Use hang scenario mitigation template (run command / NMI... | 🔵 7.0 | ADO Wiki |
| 11 | Azure VM not booting, boot screenshot shows "Error ####### applying update operations ##### of #####... | OS unable to complete KB installation; failing in primitive operation queue exec... | OFFLINE troubleshooting required (Guest OS not operational): 1) Collect WU data.... | 🔵 7.0 | ADO Wiki |
| 12 | Azure VM crashes with bugcheck 0xC0000139 (STATUS_ENTRY_POINT_NOT_FOUND). VM screenshot shows blue s... | Depends on memory dump analysis. The error code 0xC0000139 indicates a required ... | OFFLINE troubleshooting required: (1) Backup OS disk, (2) Create rescue VM via O... | 🔵 7.0 | ADO Wiki |
| 13 | Azure VM crashes with bugcheck 0xC0000145. VM screenshot shows blue screen with error code 0xC000014... | Depends on memory dump analysis. | OFFLINE troubleshooting required: (1) Backup OS disk, (2) Create rescue VM via O... | 🔵 7.0 | ADO Wiki |
| 14 | Azure VM crashes with bugcheck 0x000000CE (DRIVER_UNLOADED_WITHOUT_CANCELLING_PENDING_OPERATIONS). V... | A driver failed to cancel lookaside lists, DPCs, worker threads, or other pendin... | OFFLINE troubleshooting required: Backup OS disk, create rescue VM, collect and ... | 🔵 7.0 | ADO Wiki |
| 15 | Azure VM crashes with bugcheck 0x0000001E (KMODE_EXCEPTION_NOT_HANDLED). VM screenshot shows KMODE_E... | A kernel-mode program generated an exception which the error handler did not cat... | OFFLINE troubleshooting required: Backup OS disk, create rescue VM, collect and ... | 🔵 7.0 | ADO Wiki |
| 16 | Windows VM BSOD with error 0x00000067 CONFIG_INITIALIZATION_FAILED, VM cannot boot | IMC (Initial Machine Configuration) reference exists in Boot Loader (imcdevice, ... | Offline: Attach OS disk to rescue VM. Mitigation 1: delete IMC entries from BCD ... | 🔵 7.0 | ADO Wiki |
| 17 | Windows VM stuck with "Error C01A001D applying update operations" after June 2021 patch, Event 7023 ... | CLFS transaction log creation fails. Base container file (txr\*.TxR.blf) has SE_... | Offline: (1) dism.exe /image:<drive>:\ /cleanup-image /revertpendingactions. (2)... | 🔵 7.0 | ADO Wiki |
| 18 | Azure VM stuck during Windows Update with error C0000265 applying update operations - hardlink limit... | During KB installation, a core file cannot be created because the filesystem har... | Offline: attach OS disk to rescue VM. Open poqexec.log (\windows\winsxs\poqexec.... | 🔵 7.0 | ADO Wiki |
| 19 | Azure VM stuck during Windows Update with error C01A001D applying update operations - unable to writ... | The OS disk is full, preventing Windows Update from writing files during KB inst... | Offline: attach OS disk to rescue VM, free up disk space (delete temp files, exp... | 🔵 7.0 | ADO Wiki |
| 20 | Azure VM stuck during Windows Update with error C01A001D, Service Control Manager event 7023 "Log sp... | During patch installation, poqexec creates many registry transaction keys. CLFS ... | Offline: attach OS disk to rescue VM. Fix the security descriptor on the CLFS ba... | 🔵 7.0 | ADO Wiki |
| 21 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows ... | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo... | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights... | 🔵 7.0 | ADO Wiki |
| 22 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an... | First boot of a generalized (sysprepped) image fails to process the unattended a... | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre... | 🔵 7.0 | ADO Wiki |
| 23 | NFS mount fails with mount.nfs: Remote I/O error | The file share is SMB type, not NFS. Customer is attempting to mount an SMB shar... | Verify the share protocol in Azure Portal or ASC Resource Explorer (Files tab > ... | 🔵 7.0 | ADO Wiki |
| 24 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev... | A third-party service flagged as critical is failing to start, causing OS to res... | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach... | 🔵 7.0 | ADO Wiki |
| 25 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f... | OS changes (KB/application installation or policy change) or file system corrupt... | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda... | 🔵 7.0 | ADO Wiki |
| 26 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying ... | VMware Image Customization Initialization module is enabled on the VM (similar t... | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu... | 🔵 7.0 | ADO Wiki |
| 27 | Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB rescue prompt ('Minim... | During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cyli... | 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=se... | 🔵 7.0 | ADO Wiki |
| 28 | Windows VM screenshot shows Linux/Grub boot process instead of Windows boot - the VM is encrypted wi... | CloudLink encryption uses a Linux-based machine to manage encryption keys. If th... | Engage CloudLink support to troubleshoot key retrieval. If Bitlocker team involv... | 🔵 7.0 | ADO Wiki |
| 29 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows ... | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo... | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights... | 🔵 7.0 | ADO Wiki |
| 30 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an... | The OS boot process could not locate an active system partition - the system par... | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att... | 🔵 7.0 | ADO Wiki |

