# VM Linux Guest Agent 安装与配置 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 53 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM WireServer not responding: OSProvisioningTimeout, waagent logs show HTTP GET IOError timed  | Two root causes: (1) WireServer platform-side issue affecting multiple VMs on th | RC1: Telnet 168.63.129.16:80 from multiple VMs to confirm platform issue, file I | 🟢 8 | ON |
| 2 | VM deployment times out after ~20 minutes with ProvisioningTimeout error. Boot diagnostics shows Win | A generalized VHD (sysprep'd/waagent-deprovisioned) was deployed using specializ | Redeploy the VM using the correct method: use FromImage (generalized) instead of | 🟢 8 | ON |
| 3 | Linux VM provisioning times out when created via SDK/ARM template with Chinese characters in resourc | IMDS returns JSON response containing Chinese characters from tags. On CentOS 7. | Remove Chinese characters from VM tags (use ASCII-only tag values). Alternativel | 🟢 8 | ON |
| 4 | Large number of Windows Azure CRP Certificate Generator certificates accumulate in the VM certificat | Each time a VM is stopped and started, the Tenant is recreated with a new Deploy | Delete old certificates and keep only the latest ones. VM Agent will recreate th | 🔵 7.5 | AW |
| 5 | Linux VM Agent Not Ready; extensions stuck Transitioning/Failed; waagent.log shows ConnectionRefused | iptables filter table rules blocking connectivity to WireServer 168.63.129.16: e | Add iptables rules: sudo iptables -I OUTPUT -p tcp --dport 80 -d 168.63.129.16 - | 🔵 7.5 | AW |
| 6 | Linux VM provisioning fails; waagent.log shows cloud-init does not appear to be running with repeate | Resource Group or VM tags contain Unicode characters. IMDS returns these in meta | Remove all Unicode characters from Resource Group and VM tags. Use only ASCII. V | 🔵 7.5 | AW |
| 7 | Linux VM Agent shows Not Ready, extensions stuck. waagent.log shows ConnectionRefusedError [Errno 11 | iptables or nftables firewall rules block outbound to WireServer (168.63.129.16) | Add iptables rules: iptables -I OUTPUT -p tcp --dport 80 -d 168.63.129.16 -j ACC | 🔵 7.5 | AW |
| 8 | Linux VM provisioning fails: cloud-init does not appear to be running in waagent.log. cloud-init.log | Resource Group or VM tags contain Unicode characters (e.g. accented letters). IM | Remove Unicode characters from Resource Group name, RG tags, and VM tags. Use on | 🔵 7.5 | AW |
| 9 | Linux Guest Agent stuck on old version; waagent --version shows outdated Goal state agent version; w | New version of Guest Agent terminated abnormally (e.g., WireServer connectivity  | 1. Fix WireServer connectivity (168.63.129.16). 2. Find blacklisted agent folder | 🔵 7.5 | AW |
| 10 | VM Agent fails with 'Unable to perform the operation as the VM agent is not responsive'; waagent -ve | Outdated Azure Linux Agent version on Oracle Linux VM does not recognize Oracle  | 1. Enable ol7_addons repo: edit /etc/yum.repos.d/public-yum-ol7.repo, set enable | 🔵 7.5 | AW |
| 11 | Rocky Linux 8 VM is shown as centos in Azure Portal Operating System field; waagent.log shows OS: ce | Python version in Rocky Linux 8 is < 3.8; get_distro() with Python < 3.8 picks u | Remove centos-release and redhat-release symlinks: sudo rm /etc/centos-release / | 🔵 7.5 | AW |
| 12 | Linux Guest Agent not ready; waagent.log shows repeated WireServer endpoint not found / WireServer n | Guest Agent versions prior to 2.4.0.2 do not support multiconfig which Managed R | Update Guest Agent to version 2.4.0.2 or above: 1. Ensure AutoUpdate.Enabled=y i | 🔵 7.5 | AW |
| 13 | Linux Guest Agent (waagent) stays on old version and does not auto-update; Goal state agent shows ou | New version of Guest Agent terminated abnormally (e.g. due to WireServer connect | 1. Fix WireServer connectivity to 168.63.129.16 first. 2. Find blacklisted versi | 🔵 7.5 | AW |
| 14 | Oracle Linux VM shows Unable to perform the operation as the VM agent is not responsive; waagent --v | Outdated Azure Linux Agent version does not recognize Oracle Linux as a supporte | 1. Enable Oracle Addons repo: edit /etc/yum.repos.d/public-yum-ol7.repo, set ena | 🔵 7.5 | AW |
| 15 | Rocky Linux 8 VM shows as centos in Azure Portal Operating System; waagent.log shows OS: centos 8.7; | Python < 3.8 in Rocky Linux 8: get_distro() picks up /etc/centos-release symlink | Remove symlinks: sudo rm /etc/centos-release /etc/redhat-release, then restart w | 🔵 7.5 | AW |
| 16 | Linux Guest Agent Not Ready with repeated WireServer is not responding and Exceeded max retry updati | Linux GA < 2.4.0.2 does not support multiconfig required by Managed Run Command  | 1. Set AutoUpdate.Enabled=y in /etc/waagent.conf, restart waagent. 2. If repo GA | 🔵 7.5 | AW |
| 17 | Azure Linux Guest Agent (waagent) stuck on old version after newer version is blacklisted. waagent - | New version of Guest Agent terminated abnormally (e.g., WireServer connectivity  | 1. Fix WireServer connectivity to 168.63.129.16 (see WireServer TSG). 2. Delete  | 🔵 7.5 | AW |
| 18 | VM Agent fails with Unable to perform the operation as the VM agent is not responsive. Running waage | Outdated Azure Linux Agent version that does not properly recognize Oracle Linux | Enable ol7_addons repo: edit /etc/yum.repos.d/public-yum-ol7.repo, set enabled=1 | 🔵 7.5 | AW |
| 19 | Rocky Linux 8 VM is shown as centos in Operating System field in Azure Portal. waagent.log shows OS: | Python < 3.8 get_distro() function picks up /etc/centos-release symlink (alphabe | Remove centos-release and redhat-release symbolic links: sudo rm /etc/centos-rel | 🔵 7.5 | AW |
| 20 | Linux Guest Agent Not Ready with repeated WireServer connection loop in waagent.log: WireServer endp | RunCommandv2 (Managed Run Command / Microsoft.CPlat.Core.RunCommandHandlerLinux) | 1. Check /etc/waagent.conf: ensure AutoUpdate.Enabled=y. 2. Restart waagent serv | 🔵 7.5 | AW |
| 21 | Linux VM agent reports Size of VM status blob is larger than allowed limit of 1 MB. Guest agent cont | Status blob exceeds 1MB size limit. Associated with high VM CPU and agent repeat | Collect verbose Linux agent logs (enable only for a few minutes). Update agent t | 🔵 7.5 | AW |
| 22 | SUSE Linux VM hostname keeps alternating between the configured hostname and linux (e.g., hn1-hdb0 - | SUSE wicked network manager bug (SUSE bug 1167134) causes DHCP renewal to reset  | 1) Update guest agent to latest version. 2) Set DHCLIENT_SET_HOSTNAME=no in /etc | 🔵 7.5 | AW |
| 23 | Linux VM guest agent (waagent) fails with TransportCert.pem is missing. waagent.log shows /usr/bin/o | The /usr/bin/openssl symlink is broken, pointing to /usr/local/ssl/bin/openssl w | 1) Unlink broken symlink: sudo unlink /usr/bin/openssl. 2) Reinstall openssl: su | 🔵 7.5 | AW |
| 24 | Linux Guest Agent stuck on old version; waagent --version shows outdated Goal state agent; waagent.l | New Guest Agent version terminated abnormally (e.g., WireServer 168.63.129.16 co | 1. Fix WireServer connectivity to 168.63.129.16. 2. Find blacklisted agent folde | 🔵 7.5 | AW |
| 25 | VM Agent fails with Unable to perform the operation as the VM agent is not responsive; waagent -vers | Outdated Azure Linux Agent version on Oracle Linux VM does not recognize Oracle  | 1. Enable ol7_addons repo: edit /etc/yum.repos.d/public-yum-ol7.repo, set enable | 🔵 7.5 | AW |
| 26 | Linux Guest Agent Not Ready after installing Managed Run Command extension (Microsoft.CPlat.Core.Run | Linux Guest Agent versions prior to 2.4.0.2 do not support multiconfig required  | 1. Ensure AutoUpdate.Enabled=y in /etc/waagent.conf, restart agent (systemctl re | 🔵 7.5 | AW |
| 27 | Linux VM 备份失败，错误 UserErrorGuestAgentStatusUnavailable / VMAgentStatusCommunicationError；waagent 日志在某 | waagent 脚本 shebang 为 #!/usr/bin/env python，但 Linux 系统默认 Python 已升级为 Python 3，导致  | 1) 检查 waagent 脚本：cat /usr/sbin/waagent（查看第一行 shebang）；2) 修复 shebang：cat bin/waag | 🔵 7 | ON |
| 28 | Linux agent error 'Failed to copy ovf-env' on a VM that was previously provisioned successfully | The /var/lib/waagent/provisioned marker file is missing on a previously provisio | Run: sudo touch /var/lib/waagent/provisioned | 🔵 6.5 | AW |
| 29 | Linux agent warning 'Too many files under /var/lib/waagent/events' causing agent performance issues | Event telemetry files accumulate in the /var/lib/waagent/events directory faster | Run: sudo rm -f /var/lib/waagent/events/* | 🔵 6.5 | AW |
| 30 | Old extension files accumulate in /var/lib/waagent on Linux VM, consuming disk space. WALA agent doe | Older versions of the Windows Azure Linux Agent (WALA) did not perform cleanup o | Update the WALA agent to version 2.2.44 or later. This version includes automati | 🔵 6.5 | AW |
| 31 | Linux VM Agent Not Ready. waagent.log shows ConnectionRefusedError [Errno 111] to 168.63.129.16. nc  | iptables filter table rules (set by customer or 3rd-party software) block outbou | Add iptables rules: sudo iptables -I OUTPUT -p tcp --dport 80 -d 168.63.129.16 - | 🔵 6.5 | AW |
| 32 | Linux VM provisioning fails OSProvisioningTimedOut. waagent.log: cloud-init does not appear to be ru | Resource Group or VM tags contain Unicode characters. IMDS returns them to cloud | Remove Unicode characters from Resource Group and VM tags. Use only ASCII charac | 🔵 6.5 | AW |
| 33 | Linux VM running deprecated Azure Guest Agent version (WALinuxAgent v2.2.33/v2.2.35/v2.2.39) causing | Known bugs in specific deprecated Linux GA versions: v2.2.33 (agent hangs during | Update Linux Guest Agent to the latest release. Use Kusto query on Vmainsight/CA | 🔵 6.5 | AW |
| 34 | Linux waagent reports Exception retrieving extension handlers: [ProtocolError] /var/lib/waagent/Goal | Stale or corrupted XML goal state files in /var/lib/waagent/ directory prevent t | Run: sudo rm -f /var/lib/waagent/*.[0-9]*.xml && sudo service walinuxagent resta | 🔵 6.5 | AW |
| 35 | Linux waagent.log flooded with Failed to report status: NoneType object is not iterable errors. WALA | Bug in older WALA versions (e.g. 2.3.1.1) with NoneType error in _process_substa | Manually update WALA: 1) Ensure AutoUpdate.Enabled=y in /etc/waagent.conf; 2) Do | 🔵 6.5 | AW |
| 36 | Linux Guest Agent versions v2.2.33, v2.2.35, v2.2.39 are deprecated. v2.2.33 hangs during update, v2 | Known bugs in specific deprecated Linux GA versions | Update Linux Guest Agent to the latest release. Check current version via Kusto  | 🔵 6.5 | AW |
| 37 | Linux VM DMESG: Exception retrieving extension handlers: [ProtocolError] /var/lib/waagent/GoalState. | Corrupted or missing GoalState XML files in /var/lib/waagent/ directory | Run: sudo rm -f /var/lib/waagent/*.[0-9]*.xml && sudo service walinuxagent resta | 🔵 6.5 | AW |
| 38 | waagent.log flooded with Failed to report status: NoneType object is not iterable. Agent version stu | Outdated Linux Guest Agent version (2.3.1.1) with bug in status reporting (_proc | Manually update Linux GA: 1) waagent --version, 2) Enable AutoUpdate in /etc/waa | 🔵 6.5 | AW |
| 39 | Linux Guest Agent waagent.log grows abnormally large with repeated HTTP 404 errors fetching from sta | VM did not receive new goal state after RDFE-to-CAPS migration, causing agent to | Trigger new goal state via 'az vm reapply' or PowerShell Set-AzVM -Reapply. For  | 🔵 6.5 | AW |
| 40 | Linux Guest Agent fails to start with 'No such file or directory' error referring to Python in waage | Python symbolic link at /usr/bin/python is broken or pointing to a non-existent  | Remove broken symlink (rm /usr/bin/python), create correct link (ln -s /usr/bin/ | 🔵 6.5 | AW |
| 41 | Linux Guest Agent fails to start with Python import errors (IsADirectoryError on /etc/motd, missing  | Python3 binaries or packages are missing from the system, causing walinuxagent t | Reinstall python3: apt install -f --reinstall python3 byobu ubuntu-server. If dp | 🔵 6.5 | AW |
| 42 | WALinuxAgent fails to start after zonal migration with PermissionError removing extension config fil | Stale file handles in /var/lib/waagent from previous extension configurations ca | Stop waagent (systemctl stop waagent.service), backup waagent dir (mv /var/lib/w | 🔵 6.5 | AW |
| 43 | Linux VM provisioning fails with 'Error mounting dvd: Failed to get dvd device from /dev' or 'Failed | VM created from specialized disk (VHD directly attached, not from image) which d | Create VM from image instead of specialized disk. If ovf-env.xml is required, cr | 🔵 6.5 | AW |
| 44 | Linux VM Guest Agent logs (waagent.log/syslog) growing excessively large with repeated 404 errors fe | VMs not migrated from RDFE to CAPS still reference old RDFE manifest URIs. Agent | Trigger a new goal state via 'az vm reapply' to update manifests from RDFE to CA | 🔵 6.5 | AW |
| 45 | Linux Guest Agent fails with 'No such file or directory' in waagent.log when launching with 'python  | The /usr/bin/python symbolic link is broken or pointing to a non-existent Python | Remove the broken symlink (rm /usr/bin/python), recreate it pointing to correct  | 🔵 6.5 | AW |
| 46 | Linux Guest Agent fails to start with 'IsADirectoryError: [Errno 21] Is a directory: /etc/motd' or ' | Python3 binaries are missing or corrupt on the system, preventing walinuxagent f | Reinstall python3: apt install -f --reinstall python3 byobu ubuntu-server. If dp | 🔵 6.5 | AW |
| 47 | After zonal migration, WALinuxAgent fails to start with 'PermissionError: [Errno 1] Operation not pe | Zonal migration left stale file handles in /var/lib/waagent/ for extension confi | Stop waagent (systemctl stop waagent.service), move waagent dir (mv /var/lib/waa | 🔵 6.5 | AW |
| 48 | Waagent Not Ready on CentOS 8 VM with custom-built Python 3.11: ModuleNotFoundError, NameError distr | Customer replaced system Python3 with custom-built Python 3.11, installed WALinu | Change waagent systemd ExecStart to platform-python (/usr/bin/python3.6); system | 🔵 6 | ON |
| 49 | VM error: OSProvisioningClientError - SSH host key generation failed during Linux VM provisioning. | Linux agent (waagent) not set up properly. | Verify Linux agent is set up properly per https://learn.microsoft.com/en-us/azur | 🔵 5.5 | ML |
| 50 | Swap file not re-created after Linux VM restart on cloud-init provisioned VMs with waagent | Both cloud-init and waagent try to configure swap, causing conflict | Disable swap in waagent (ResourceDisk.EnableSwap=n). Create cloud-init per-boot  | 🔵 5.5 | ML |
| 51 | Azure Linux VM Agent 2.1.5 or 2.1.6 cannot process extensions after multiple auto-updates. High CPU  | Bug in Agent 2.1.5/2.1.6 where multiple auto-updates corrupt state. | Upgrade Agent via distro package manager. Workaround: restart walinuxagent servi | 🔵 5.5 | ML |
| 52 | Linux VM Guest Agent Not Ready. Extensions fail. walinuxagent service stopped. | Service not running, auto-update disabled, or VM cannot reach WireServer 168.63. | Check service status, restart, verify AutoUpdate.Enabled=y, test curl 168.63.129 | 🔵 5.5 | ML |
| 53 | waagent.log: error retrieving goal state. Cannot connect to WireServer 168.63.129.16. | Firewall/proxy/iptables blocking WireServer IP on ports 80, 32526. | curl http://168.63.129.16/?comp=versions to test. Check iptables, proxy, third-p | 🔵 5.5 | ML |

## 快速排查路径

1. **Linux VM WireServer not responding: OSProvisioningTimeout, waagent logs show HTT**
   - 根因: Two root causes: (1) WireServer platform-side issue affecting multiple VMs on the same VNet; (2) VM has primary and seco
   - 方案: RC1: Telnet 168.63.129.16:80 from multiple VMs to confirm platform issue, file IcM. RC2: Validate OS routing with ip route show, ensure WireServer rou
   - `[🟢 8 | ON]`

2. **VM deployment times out after ~20 minutes with ProvisioningTimeout error. Boot d**
   - 根因: A generalized VHD (sysprep'd/waagent-deprovisioned) was deployed using specialized deployment method (Attach). The provi
   - 方案: Redeploy the VM using the correct method: use FromImage (generalized) instead of Attach (specialized). Check ASC → VM → CreateOption to verify. Auto R
   - `[🟢 8 | ON]`

3. **Linux VM provisioning times out when created via SDK/ARM template with Chinese c**
   - 根因: IMDS returns JSON response containing Chinese characters from tags. On CentOS 7.x with Python 2.7, cloud-init catches js
   - 方案: Remove Chinese characters from VM tags (use ASCII-only tag values). Alternatively, upgrade to a newer image with Python 3 and updated cloud-init. Note
   - `[🟢 8 | ON]`

4. **Large number of Windows Azure CRP Certificate Generator certificates accumulate **
   - 根因: Each time a VM is stopped and started, the Tenant is recreated with a new DeploymentID, causing a new CRP certificate to
   - 方案: Delete old certificates and keep only the latest ones. VM Agent will recreate the certificate if needed. Engineering fix (PR 2239105, commit e76149cf)
   - `[🔵 7.5 | AW]`

5. **Linux VM Agent Not Ready; extensions stuck Transitioning/Failed; waagent.log sho**
   - 根因: iptables filter table rules blocking connectivity to WireServer 168.63.129.16: either explicit block-all-internet with n
   - 方案: Add iptables rules: sudo iptables -I OUTPUT -p tcp --dport 80 -d 168.63.129.16 -j ACCEPT && sudo iptables -I OUTPUT -p tcp --dport 32526 -d 168.63.129
   - `[🔵 7.5 | AW]`

