# VM Vm Linux Os — 综合排查指南

**条目数**: 25 | **草稿融合数**: 20 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-Best-Practices-Managing-extensions-enabled-Linux.md](../../guides/drafts/ado-wiki-a-Best-Practices-Managing-extensions-enabled-Linux.md), [ado-wiki-b-Linux-GA-Guide.md](../../guides/drafts/ado-wiki-b-Linux-GA-Guide.md), [ado-wiki-b-Linux-Security-Cases-Process.md](../../guides/drafts/ado-wiki-b-Linux-Security-Cases-Process.md), [ado-wiki-b-Unlock-Encrypted-Linux-Disk.md](../../guides/drafts/ado-wiki-b-Unlock-Encrypted-Linux-Disk.md), [ado-wiki-c-monitoring-extension-linux-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-linux-manual-upgrade.md), [ado-wiki-capture-linux-ga-callstack.md](../../guides/drafts/ado-wiki-capture-linux-ga-callstack.md), [mslearn-collect-perf-metrics-linux.md](../../guides/drafts/mslearn-collect-perf-metrics-linux.md), [mslearn-cpu-perf-troubleshoot-linux.md](../../guides/drafts/mslearn-cpu-perf-troubleshoot-linux.md), [mslearn-create-swap-file-linux-vm.md](../../guides/drafts/mslearn-create-swap-file-linux-vm.md), [mslearn-linux-grub-rescue-troubleshooting.md](../../guides/drafts/mslearn-linux-grub-rescue-troubleshooting.md), [mslearn-linux-kernel-panic-troubleshooting.md](../../guides/drafts/mslearn-linux-kernel-panic-troubleshooting.md), [mslearn-linux-support-scope.md](../../guides/drafts/mslearn-linux-support-scope.md), [mslearn-memory-perf-troubleshoot-linux.md](../../guides/drafts/mslearn-memory-perf-troubleshoot-linux.md), [mslearn-performance-bottlenecks-linux.md](../../guides/drafts/mslearn-performance-bottlenecks-linux.md), [mslearn-redeploy-linux-vm-new-node.md](../../guides/drafts/mslearn-redeploy-linux-vm-new-node.md), [mslearn-reset-linux-password.md](../../guides/drafts/mslearn-reset-linux-password.md), [onenote-clamav-linux-vm.md](../../guides/drafts/onenote-clamav-linux-vm.md), [onenote-enable-cuda-on-nv-series-linux.md](../../guides/drafts/onenote-enable-cuda-on-nv-series-linux.md), [onenote-linux-perf-commands-reference.md](../../guides/drafts/onenote-linux-perf-commands-reference.md), [onenote-linux-slow-network-troubleshooting.md](../../guides/drafts/onenote-linux-slow-network-troubleshooting.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: MS Learn, ADO Wiki, OneNote

1. 参照 [ado-wiki-a-Best-Practices-Managing-extensions-enabled-Linux.md](../../guides/drafts/ado-wiki-a-Best-Practices-Managing-extensions-enabled-Linux.md) 排查流程
2. 参照 [ado-wiki-b-Linux-GA-Guide.md](../../guides/drafts/ado-wiki-b-Linux-GA-Guide.md) 排查流程
3. 参照 [ado-wiki-b-Linux-Security-Cases-Process.md](../../guides/drafts/ado-wiki-b-Linux-Security-Cases-Process.md) 排查流程
4. 参照 [ado-wiki-b-Unlock-Encrypted-Linux-Disk.md](../../guides/drafts/ado-wiki-b-Unlock-Encrypted-Linux-Disk.md) 排查流程
5. 参照 [ado-wiki-c-monitoring-extension-linux-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-linux-manual-upgrade.md) 排查流程
6. 参照 [ado-wiki-capture-linux-ga-callstack.md](../../guides/drafts/ado-wiki-capture-linux-ga-callstack.md) 排查流程
7. 参照 [mslearn-collect-perf-metrics-linux.md](../../guides/drafts/mslearn-collect-perf-metrics-linux.md) 排查流程
8. 参照 [mslearn-cpu-perf-troubleshoot-linux.md](../../guides/drafts/mslearn-cpu-perf-troubleshoot-linux.md) 排查流程
9. 参照 [mslearn-create-swap-file-linux-vm.md](../../guides/drafts/mslearn-create-swap-file-linux-vm.md) 排查流程
10. 参照 [mslearn-linux-grub-rescue-troubleshooting.md](../../guides/drafts/mslearn-linux-grub-rescue-troubleshooting.md) 排查流程
11. 参照 [mslearn-linux-kernel-panic-troubleshooting.md](../../guides/drafts/mslearn-linux-kernel-panic-troubleshooting.md) 排查流程
12. 参照 [mslearn-linux-support-scope.md](../../guides/drafts/mslearn-linux-support-scope.md) 排查流程
13. 参照 [mslearn-memory-perf-troubleshoot-linux.md](../../guides/drafts/mslearn-memory-perf-troubleshoot-linux.md) 排查流程
14. 参照 [mslearn-performance-bottlenecks-linux.md](../../guides/drafts/mslearn-performance-bottlenecks-linux.md) 排查流程
15. 参照 [mslearn-redeploy-linux-vm-new-node.md](../../guides/drafts/mslearn-redeploy-linux-vm-new-node.md) 排查流程
16. 参照 [mslearn-reset-linux-password.md](../../guides/drafts/mslearn-reset-linux-password.md) 排查流程
17. 参照 [onenote-clamav-linux-vm.md](../../guides/drafts/onenote-clamav-linux-vm.md) 排查流程
18. 参照 [onenote-enable-cuda-on-nv-series-linux.md](../../guides/drafts/onenote-enable-cuda-on-nv-series-linux.md) 排查流程
19. 参照 [onenote-linux-perf-commands-reference.md](../../guides/drafts/onenote-linux-perf-commands-reference.md) 排查流程
20. 参照 [onenote-linux-slow-network-troubleshooting.md](../../guides/drafts/onenote-linux-slow-network-troubleshooting.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Intel TDX 5th Gen (Emerald Rapids) architecture ti | 1 条相关 | Manual workaround per FAQ: https://learn.microsoft.com/en-us... |
| Input genomics file (FASTQ, BAM, or SAM) is corrup | 1 条相关 | Verify local file integrity using fastaq (for FASTQ files) o... |
| Genomics service performs paired-end read alignmen | 1 条相关 | Verify locally that both FASTQ input files are valid and cor... |
| Required OpenSSL library version (libssl.so.3, lib | 1 条相关 | 1) Check OpenSSL: rpm -qa / grep openssl (RPM) or apt list -... |
| cifs-utils RPM package is not installed by default | 1 条相关 | Install cifs-utils package: yum install cifs-utils. Verify i... |
| Missing Linux OS kernel fixes for Azure Files SMB  | 2 条相关 | Upgrade Linux kernel to 4.4.87+, 4.9.48+, 4.12.11+, or any v... |
| VMware Image Customization Initialization module i | 1 条相关 | OFFLINE approach: attach OS disk to rescue VM. Disable VMwar... |
| Stale udev rules under /etc/udev/rules.d contain e | 1 条相关 | Remove the files that contain entries for eth0 or eth1 under... |
| /etc/apt/sources.list contains ARM (armhf) archite | 1 条相关 | Remove or comment out armhf repository lines from sources.li... |
| Incompatibility between NVIDIA driver and Ubuntu 4 | 1 条相关 | Upgrade kernel to at least version 4.4.0-77 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | DCesv6/ECesv6 Linux VM time drifting - system time drifts by seconds on long-running VMs | Intel TDX 5th Gen (Emerald Rapids) architecture time sync bug affecting Linux on... | Manual workaround per FAQ: https://learn.microsoft.com/en-us/azure/confidential-... | 🟢 8.0 | ADO Wiki |
| 2 | Genomics workflow fails with 'Read length is too long', 'Encountered an invalid CIGAR value', or 'CI... | Input genomics file (FASTQ, BAM, or SAM) is corrupted | Verify local file integrity using fastaq (for FASTQ files) or samtools (for BAM/... | 🟢 8.0 | ADO Wiki |
| 3 | Genomics workflow fails with 'Error reading a FASTQ file; make sure the input files are valid and pa... | Genomics service performs paired-end read alignment requiring exactly two matche... | Verify locally that both FASTQ input files are valid and correctly paired using ... | 🟢 8.0 | ADO Wiki |
| 4 | RunCommand install/uninstall fails on Linux VM with error 'failed to parse protected settings: decry... | Required OpenSSL library version (libssl.so.3, libcrypto.so.3) is missing or inc... | 1) Check OpenSSL: rpm -qa / grep openssl (RPM) or apt list --installed / grep op... | 🟢 8.0 | ADO Wiki |
| 5 | Mount of Azure File Share on RHEL 8.2 fails with: mount: bad option; for several filesystems (e.g. n... | cifs-utils RPM package is not installed by default on RHEL 8.2, so /sbin/mount.c... | Install cifs-utils package: yum install cifs-utils. Verify installation: ls -l /... | 🟢 8.0 | ADO Wiki |
| 6 | ls command hangs or returns 'Cannot access FilePath: Input/output error' when listing files in Azure... | Missing Linux OS kernel fixes for Azure Files SMB client | Upgrade Linux kernel to 4.4.87+, 4.9.48+, 4.12.11+, or any version >= 4.13 | 🟢 8.0 | ADO Wiki |
| 7 | Linux ls command hangs when listing Azure Files directory, or returns error: ls: cannot access FileP... | Missing Linux OS kernel fixes for Azure Files SMB client operations | Upgrade the Linux kernel to one of these fixed versions: 4.4.87+, 4.9.48+, 4.12.... | 🟢 8.0 | ADO Wiki |
| 8 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying ... | VMware Image Customization Initialization module is enabled on the VM (similar t... | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu... | 🟢 8.0 | ADO Wiki |
| 9 | SUSE VM: No configuration found for eth4 / eth0 No interface found - VM not accessible over network | Stale udev rules under /etc/udev/rules.d contain entries for old network interfa... | Remove the files that contain entries for eth0 or eth1 under /etc/udev/rules.d | 🔵 7.0 | MS Learn |
| 10 | apt update fails with does not have a Release file for armhf packages on x86_64 Azure VM | /etc/apt/sources.list contains ARM (armhf) architecture repos, invalid for x86_6... | Remove or comment out armhf repository lines from sources.list or sources.list.d... | 🔵 7.0 | MS Learn |
| 11 | GPU disabled on Azure N-Series Ubuntu 16.04 LTS VM after upgrading to 4.4.0-75 kernel; kernel NULL p... | Incompatibility between NVIDIA driver and Ubuntu 4.4.0-75 kernel causing kernel ... | Upgrade kernel to at least version 4.4.0-77 | 🔵 7.0 | MS Learn |
| 12 | SLES 15->SP3 migration fails: products not activated, list of SP1 modules not activated | Previous SLES migration interrupted/terminated, incomplete package updates. | zypper dup, zypper rollback, zypper migration to retry. | 🔵 7.0 | MS Learn |
| 13 | SLES SP3->SP4/SP5: No migration available, products not available after incomplete migration | Required modules not activated while obsolete modules block path. | Activate web-scripting/public-cloud/containers/live-patching, deactivate legacy/... | 🔵 7.0 | MS Learn |
| 14 | SLES 12->15 migration fails: HPC Module 12 x86_64 not activated or Invalid combination of products r... | HPC became standalone product in SLES 15, blocks migration target resolution. | Remove HPC: zypper rm sle-module-hpc-release-POOL sle-module-hpc-release. Or mv ... | 🔵 7.0 | MS Learn |
| 15 | SLES 15->SP3 migration fails: products not activated, list of SP1 modules not activated | Previous SLES migration interrupted/terminated, incomplete package updates. | zypper dup, zypper rollback, zypper migration to retry. | 🔵 7.0 | MS Learn |
| 16 | SLES 15 SP3->SP4: Invalid system credentials and No repositories defined | Certification module conflicts with migration, causes invalid credentials. | SUSEConnect -d -p sle-module-certifications/15.3/x86_64 then retry. | 🔵 7.0 | MS Learn |
| 17 | Both Pacemaker cluster nodes terminated after failover in RHEL 8 two-node cluster | During outage, both nodes try to fence each other simultaneously via STONITH dev... | Use priority-fencing-delay=15s (Pacemaker 2.0.4-6+) or pcmk_delay_max=15s (older... | 🔵 7.0 | MS Learn |
| 18 | Azure fence agent fails in SUSE Pacemaker. Missing fence-agents-azure-arm package after Python 3.11 ... | SUSE rebuilt fence agent package for Python 3.11. Old package not compatible. | Install fence-agents-azure-arm package: zypper in fence-agents-azure-arm on all ... | 🔵 7.0 | MS Learn |
| 19 | RHEL yum fails through proxy. Misconfigured or residual proxy in /etc/yum.conf. | Wrong proxy config in /etc/yum.conf. Or leftover proxy= when no proxy exists. | Set correct proxy= or remove proxy= lines from yum.conf/dnf.conf. | 🔵 7.0 | MS Learn |
| 20 | ADE fails. VFAT module disabled, BEK volume unmountable, key inaccessible. | VFAT kernel module disabled. BEK volume (FAT) cannot mount. | Enable VFAT kernel module. | 🔵 7.0 | MS Learn |
| 21 | yum/dnf dependency conflict. Package requires version X but providers cannot be installed. | Incompatible packages from different OS releases coexisting. | yum remove <old-pkg>. Or --allowerasing/--skip-broken/--nobest. | 🔵 7.0 | MS Learn |
| 22 | yum SyntaxError/No module named yum/bad interpreter. Wrong Python version. | Default Python changed or symlink modified. | Fix symlink: ln -s python2.7 python. Or rpm -ivh python --replacepkgs. | 🔵 7.0 | MS Learn |
| 23 | yum RHEL 7 HTTPS 403 Forbidden to RHUI. Third-party curl from city-fan.org. | Third-party curl certificates not recognized by Red Hat. | Downgrade to official RHEL curl: yum downgrade curl libcurl --disablerepo=*. | 🔵 7.0 | MS Learn |
| 24 | Ubuntu 24.04 VM needs account lockout configuration: lock login for N minutes after N failed attempt... | Ubuntu 24.04 defaults to pam_faillock (replacing older pam_tally2). Three PAM co... | 1) Edit /etc/security/faillock.conf: deny=3, unlock_time=600, fail_interval=900,... | 🟢 8.5 | OneNote |



---

## 增量补充条目 (2026-04-18)

### vm-contentidea-kb-041
**来源**: KB | **分数**: 🟡 5.0

**症状**: cloud-init is an open source project provisioning agent, that can be baked into Linux images, this is responsible for completing the setup of the VM when you create it, such as setting the hostname, username, password/ssh keys, mounting the ephemeral disk etc. The process of completing the setup is known as æprovisioningÆ. In addition to just setting up the minimum required configuration options d

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

---
