# VM Vm Start Stop P — 综合排查指南

**条目数**: 30 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md), [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md), [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: MS Learn

1. 参照 [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md) 排查流程
2. 参照 [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md) 排查流程
3. 参照 [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| RDP component disabled: fDenyTSConnections=1, TSEn | 1 条相关 | Serial Console: set fDenyTSConnections=0, TSEnabled=1, TSSer... |
| A static IP address was manually configured on the | 1 条相关 | Use Serial Console to revert NIC to DHCP: netsh interface ip... |
| VM is configured to boot into Safe Mode (safeboot  | 1 条相关 | Use Serial Console: bcdedit /deletevalue {current} safeboot,... |
| Bug in Windows exposed when provisioned image has  | 1 条相关 | Apply update KB4057903 (Hyper-V integration components updat... |
| Intermediate certificates for IMDS attested data T | 1 条相关 | 1. For WS2022 install KB5036909. 2. Configure firewall/proxy... |
| Driver problem, corrupted system file or memory, o | 1 条相关 | 1. Attach OS disk to recovery VM. 2. Locate Memory.dmp in Wi... |
| Server performing final restart after configuratio | 1 条相关 | 1. Restore VM from backup if available. 2. Otherwise attach ... |
| Disk structure corrupted and unreadable. For Gen1  | 1 条相关 | 1. Create repair VM, attach OS disk. 2. Gen1: diskpart check... |
| VM cannot locate the BitLocker Recovery Key (BEK)  | 1 条相关 | Stop and deallocate the VM, then start it (forces BEK retrie... |
| LSASS.exe cannot authenticate because the domain c | 1 条相关 | Attach OS disk to repair VM. 1) Free disk space if <300MB. 2... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | RDP general error: Remote Desktop cannot connect. Remote access not enabled, computer turned off, or... | RDP component disabled: fDenyTSConnections=1, TSEnabled=0, drain mode, listener ... | Serial Console: set fDenyTSConnections=0, TSEnabled=1, TSServerDrainMode=0, fEna... | 🔵 6.0 | MS Learn |
| 2 | Cannot RDP to Azure VM. VM boots normally and shows login screen in boot diagnostics, but RDP connec... | A static IP address was manually configured on the Windows network interface ins... | Use Serial Console to revert NIC to DHCP: netsh interface ip set address name="<... | 🔵 6.0 | MS Learn |
| 3 | Cannot RDP or make any network connection to Azure VM. Boot diagnostics shows VM booted into Safe Mo... | VM is configured to boot into Safe Mode (safeboot flag set in BCD). RDP service ... | Use Serial Console: bcdedit /deletevalue {current} safeboot, then restart VM. If... | 🔵 6.0 | MS Learn |
| 4 | Azure VM running Windows Server 2012 R2 experiences poor performance. Severe decrease in local resou... | Bug in Windows exposed when provisioned image has phantom IDE devices. The storf... | Apply update KB4057903 (Hyper-V integration components update for Windows virtua... | 🔵 6.0 | MS Learn |
| 5 | Azure VM cannot connect to IMDS endpoint (169.254.169.254) due to expired or missing intermediate ce... | Intermediate certificates for IMDS attested data TLS expired or missing from loc... | 1. For WS2022 install KB5036909. 2. Configure firewall/proxy to allow cert downl... | 🔵 6.0 | MS Learn |
| 6 | Windows VM shows blue screen error (BSOD) on boot. Boot diagnostics shows stop error: Your PC ran in... | Driver problem, corrupted system file or memory, or application accessing forbid... | 1. Attach OS disk to recovery VM. 2. Locate Memory.dmp in Windows folder. 3. If ... | 🔵 6.0 | MS Learn |
| 7 | Windows VM stuck on Getting ready or Getting Windows ready. Dont turn off your computer. VM does not... | Server performing final restart after configuration change (Windows Update or ro... | 1. Restore VM from backup if available. 2. Otherwise attach OS disk to recovery ... | 🔵 6.0 | MS Learn |
| 8 | Boot diagnostics shows: A disk read error occurred. Press Ctrl+Alt+Del to restart. VM cannot boot. | Disk structure corrupted and unreadable. For Gen1 VMs, boot partition may not be... | 1. Create repair VM, attach OS disk. 2. Gen1: diskpart check/set partition activ... | 🔵 6.0 | MS Learn |
| 9 | Azure Windows VM doesn't start, boot diagnostics shows BitLocker recovery key prompt: 'Plug in the U... | VM cannot locate the BitLocker Recovery Key (BEK) file from Azure Key Vault to d... | Stop and deallocate the VM, then start it (forces BEK retrieval from Key Vault).... | 🔵 6.0 | MS Learn |
| 10 | Azure Windows VM (domain controller) stuck in reboot loop, boot diagnostics shows stop code 0xC00002... | LSASS.exe cannot authenticate because the domain controller has no read/write ac... | Attach OS disk to repair VM. 1) Free disk space if <300MB. 2) Verify NTDS.DIT di... | 🔵 6.0 | MS Learn |
| 11 | Azure Windows VM shows 'Windows could not finish configuring the system. To attempt to resume config... | The OS is unable to complete the Sysprep process. Occurs on initial boot of a ge... | The image cannot be recovered. Recreate the generalized image following Azure gu... | 🔵 6.0 | MS Learn |
| 12 | Windows VM caught in reboot loop: boot diagnostics shows VM booting but process gets interrupted and... | Three possible causes: (1) Third-party service flagged as critical cannot start;... | Attach OS disk to rescue VM. Cause 1: Check ErrorControl registry value for RDAg... | 🔵 6.0 | MS Learn |
| 13 | Azure VM startup stuck at Windows Update screen: messages like Installing Windows ##%, We could not ... | Windows Update installation or rollback process stuck during boot. Update packag... | Wait 8 hours first. If still stuck: attach OS disk to rescue VM, run dism /image... | 🔵 6.0 | MS Learn |
| 14 | Windows installation error during VM boot: The computer restarted unexpectedly or encountered an une... | Custom Unattend.xml answer file used with sysprep generalize. Custom answer file... | Re-run sysprep without /unattend flag: sysprep /oobe /generalize /shutdown. Do n... | 🔵 6.0 | MS Learn |
| 15 | VM stuck at Windows Boot Manager menu: Choose an operating system to start, or press TAB to select a... | BCD flag displaybootmenu is enabled, causing Boot Manager to wait for user input... | Via Serial Console: bcdedit /set {bootmgr} timeout 5 or bcdedit /deletevalue {bo... | 🔵 6.0 | MS Learn |
| 16 | Windows Server 2016 VM unresponsive after applying Windows Update (specifically KB5003638). Boot dia... | Insufficient disk space or permission issue with files in %systemroot%\system32\... | Before applying KB5003638: ensure 1GB free space, apply KB5001347 or KB5003197 f... | 🔵 6.0 | MS Learn |
| 17 | Azure VM unresponsive during boot showing Applying Audit Policy Configuration policy message. Applie... | Conflicting locks when Delete user profiles older than N days on system restart ... | Attach OS disk to rescue VM. Load SOFTWARE hive as BROKENSOFTWARE. Delete Cleanu... | 🔵 6.0 | MS Learn |
| 18 | Azure VM (domain controller) unresponsive on restart, boot diagnostics shows Default Domain Controll... | Recent changes to Default Domain Controllers Policy causing boot hang. Specific ... | Undo recent Default Domain Controllers Policy changes. If unknown cause: attach ... | 🔵 6.0 | MS Learn |
| 19 | Azure VM fails to boot with Windows Boot Manager error: Status 0xC0000428 - Windows cannot verify th... | The VM was built from a preview/trial image with an expiration date. Once the pr... | 1) Preview image expiration is non-recoverable - cannot extend expiration. 2) De... | 🔵 6.0 | MS Learn |
| 20 | Azure VM BSOD with Windows stop code 0x00000074 BAD_SYSTEM_CONFIG_INFO: Your PC ran into a problem a... | SYSTEM registry hive is corrupted. Possible causes: registry hive not closed pro... | 1) Delete VM (keep OS disk). 2) Attach OS disk as data disk to troubleshooting V... | 🔵 6.0 | MS Learn |
| 21 | Azure VM (Windows Server 2008) crashes with blue screen: *** Hardware Malfunction - Call your vendor... | Guest OS was not set up correctly and a Non-Maskable Interrupt (NMI) was sent. A... | 1) Restart VM via Azure portal. 2) Once booted, run elevated cmd: REG ADD HKLM\S... | 🔵 6.0 | MS Learn |
| 22 | Azure VM BSOD with stop error 0xC000021A STATUS_SYSTEM_PROCESS_TERMINATED: Your PC ran into a proble... | Critical process failed: Winlogon (winlogon.exe) or Client Server Run-Time Subsy... | 1) Try restoring VM from backup. 2) If no backup: create repair VM, attach OS di... | 🔵 6.0 | MS Learn |
| 23 | Azure VM BSOD with stop error 0x0000007E SYSTEM_THREAD_EXCEPTION_NOT_HANDLED: A system thread except... | Cannot be determined until memory dump is analyzed. A system thread generated an... | 1) Try restoring VM from backup. 2) Create repair VM, attach OS disk. 3) Connect... | 🔵 6.0 | MS Learn |
| 24 | Azure Windows VM fails to boot with error 0xC00000BA: a critical system driver is missing or contain... | Windows system files corruption from unfinished installation/erasure, bad applic... | 1) Disable recently installed service via registry (set Start=4). 2) Repair file... | 🔵 6.0 | MS Learn |
| 25 | Azure Windows VM fails to boot with stop error 0xC0000102 STATUS_FILE_CORRUPT. | Corrupt file or disk structure has become corrupt and unreadable. | VM repair commands to create repair VM. chkdsk /F. Replace corrupt binary from W... | 🔵 6.0 | MS Learn |
| 26 | Azure Windows VM fails to boot with INACCESSIBLE_BOOT_DEVICE error or Boot failure: Reboot and Selec... | Boot Configuration Data (BCD) is corrupted, or the partition containing the Wind... | Stop/deallocate and restart VM first. If persists: attach OS disk to rescue VM. ... | 🔵 6.0 | MS Learn |
| 27 | Windows VM stuck during boot at 'Applying Group Policy Power Options policy' message shown in boot d... | Group Policy processing stall during boot. Specific cause requires memory dump a... | Collect OS memory dump file via rescue VM, then file Azure support request for d... | 🔵 6.0 | MS Learn |
| 28 | Windows VM stuck during boot at 'Please wait for the Group Policy Client' message. VM does not progr... | VM is applying many or complex Group Policy settings at startup. Normal processi... | Wait up to 1 hour for GP processing to complete. If still stuck, collect OS memo... | 🔵 6.0 | MS Learn |
| 29 | Azure Windows VM stuck during boot on 'Applying Group Policy Shortcuts policy' screen. VM unresponsi... | Group Policy Shortcuts policy processing hangs during startup. Specific root cau... | Collect OS memory dump file using repair VM, then open support request with the ... | 🔵 6.0 | MS Learn |
| 30 | Azure Windows VM fails to boot with error: 'An operating system wasn't found. Try disconnecting any ... | Startup process cannot locate active system partition — causes include: (1) syst... | 1. Stop/deallocate and restart VM. 2. If persists: attach OS disk to repair VM →... | 🔵 6.0 | MS Learn |

