# VM Vm Connectivity Rdp C — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 15 | **关键词**: connectivity, rdp, c
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot RDP to Azure VM. Guest OS firewall profiles set to block all inbound connections (BlockInboun... | Guest OS Windows Firewall inbound policy set to BlockInboundAlways, which ignore... | Via Serial Console: 1) Check profiles: netsh advfirewall show allprofiles. 2) If... | 🔵 7.0 | MS Learn |
| 2 | Azure VM unresponsive during boot, stuck at 'Please wait for the Local Session Manager' message show... | Multiple potential causes requiring memory dump analysis. VM is stuck waiting fo... | 1) Wait up to 1 hour as process may self-resolve. 2) If persists, prepare repair... | 🔵 7.0 | MS Learn |
| 3 | VM Inspector 405 ResourceNotSupported for encrypted/unmanaged/ephemeral disk | VM Inspector does not support encrypted, unmanaged, or ephemeral OS disks | Use alternative diagnostics: Serial Console, Boot Diagnostics. Convert unmanaged... | 🔵 7.0 | MS Learn |
| 4 | Azure Serial Console: Unable to type at SAC prompt when kernel debugging is enabled on Windows VM. | Kernel debugging conflicts with Serial Console SAC prompt input. | RDP to VM and run: bcdedit /debug {current} off. If cannot RDP, attach OS disk t... | 🔵 7.0 | MS Learn |
| 5 | Azure Serial Console: Forbidden response when accessing VM boot diagnostic storage account. Serial C... | Custom boot diagnostics storage account has firewall restrictions enabled. Seria... | Add Serial Console service IPs as firewall exclusions based on VM geography (use... | 🔵 7.0 | MS Learn |
| 6 | Azure Serial Console: Bad Request (400) error when connecting to VM. | Boot diagnostics URI is incorrect, e.g., using http:// instead of https://. | Fix boot diagnostics URI: az vm boot-diagnostics enable --name vmName --resource... | 🔵 7.0 | MS Learn |
| 7 | Azure Serial Console: Web socket is closed or could not be opened error. | Firewall or network policy blocking outbound access to *.serialconsole.azure.com... | Add *.serialconsole.azure.com to firewall allow list. For US Gov cloud, use *.se... | 🔵 7.0 | MS Learn |
| 8 | Azure Serial Console error: Another connection is currently in progress to this VM. | Another user has Serial Console open, or a stale connection exists. | If no other user has Serial Console open, try disabling and re-enabling boot dia... | 🔵 7.0 | MS Learn |
| 9 | Cannot SSH to Azure Linux VM, syslog shows: Permissions 0777 for '/etc/ssh/sshKeyName' are too open ... | The /etc/ssh configuration directory or files have incorrect permissions (e.g., ... | Restore correct permissions: chmod -R 644 /etc/ssh; chmod 600 /etc/ssh/ssh_host*... | 🔵 7.0 | MS Learn |
| 10 | Linux VM fails to boot with Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0) or mis... | Missing initramfs image after kernel update/patching. Initramfs file not generat... | Boot previous kernel via Serial Console GRUB menu. Regenerate initramfs: depmod ... | 🔵 7.0 | MS Learn |
| 11 | Linux VM kernel panic after kernel upgrade/downgrade - kernel BUG or boot failure with new kernel ve... | Kernel upgrade incompatibility or bug; kernel downgrade left missing modules; ke... | Boot previous kernel via Serial Console or ALAR scripts (az vm repair run --run-... | 🔵 7.0 | MS Learn |
| 12 | 需要通过 SAW 机器对 Mooncake VM 节点做控制台级访问（JIT + RDP/RDG 方式连接 Jump Box 再到 Host 节点） |  | 前置条件：申请 Silo Membership（sasweb.microsoft.com, Org: CloudEnterprise）+ 物理智能卡 + CME... | 🟢 8.5 | OneNote |
| 13 | Red Hat 9 custom image VM boots into emergency mode; pvs shows 'Devices file PVID last seen on /dev/... | RHEL 9 enables system.devices file feature by default (LVM2 device cache). When ... | 1) Add use_devicesfile=0 in /etc/lvm/lvm.conf (within devices {} section) to dis... | 🔵 7.5 | OneNote |
| 14 | VM storage IO slow, application performance degraded (e.g. SQL Server), high latency on all disks | VM-level throttling causes dependent blocking: one disk excessive IO triggers VM... | Prevent VM level throttling: ensure total cached disk throughput < VM cached max... | 🟢 8.5 | OneNote |
| 15 | Unable to use GPU after enabling Remote Desktop Session Host (RDSH) role on N-series VM | Enabling RDSH role can interfere with GPU passthrough or driver configuration on... | Follow TSG: AzureIaaSVM wiki 'Unable to use GPU after enabling the Remote Deskto... | 🟢 8.5 | OneNote |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-connectivity-rdp-c.md)
