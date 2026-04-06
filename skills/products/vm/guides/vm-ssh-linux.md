# VM Linux SSH 连接故障 — 排查速查

**来源数**: 13 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SSH 认证成功但会话立即断开；/var/log/secure 显示 pam_limits 错误；console 和 single-user 模式也无法登录 | /etc/security/limits.conf 中 nofile hard limit 超过 /proc/sys/fs/nr_open，pam_limits.so 失败拒绝所有登录 | 挂 OS disk 到修复 VM：(1) 改 UsePAM yes→no 或移除 pam_limits.so；(2) 修复 limits.conf 确保 nofile ≤ nr_open | 🟢 9 — OneNote 实证 | [MCVKB/VM+SCIM/.../3.6](onenote) |
| 2 | 禁用默认 NIC 或手动设静态 IP 后无法 SSH 连接 Linux VM | 默认网络接口被禁用或静态 IP 配置错误 | Azure Portal 重置 NIC（改 IP 为 static 触发重启）；az vm repair reset-nic；或 Azure CLI az vm nic set | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/reset-network-interface-azure-linux-vm) |
| 3 | CentOS: eth0 does not seem to be present / Device eth0 has different MAC address — DHCP 改固定 IP 后断网 | ifcfg-eth0 中 HWADDR 指令包含旧 MAC 地址，VM resize/move 后 MAC 不匹配 | 移除 /etc/sysconfig/network-scripts/ifcfg-eth0 中的 HWADDR 行 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/cannot-connect-linux-network) |
| 4 | SUSE: No configuration found for eth4 / eth0 No interface found — VM 不可达 | /etc/udev/rules.d 下有旧网卡接口名的 stale udev 规则 | 删除 /etc/udev/rules.d 下包含 eth0/eth1 条目的文件 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/cannot-connect-linux-network) |
| 5 | Ubuntu: cloud-init-nonet waiting 120 seconds / route_info failed / Missing required variable: address for eth0/inet | (1) 旧 udev 规则导致新 NIC 变成 eth1; (2) eth0.cfg 有静态配置而非 DHCP | (1) 删 70-persistent-net.rules 更新 udev; (2) 重置 eth0.cfg 为 DHCP 并清除 /var/lib/dhcp 缓存 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/cannot-connect-linux-network) |
| 6 | SSH 失败: /var/empty/sshd (RHEL) 或 /var/lib/empty (SUSE) 或 /var/run/sshd (Ubuntu) must be owned by root and not group/world-writable | sshd 特权分离目录不存在、非 root 拥有、或权限过宽 | mkdir -p 创建目录; chmod 755; chown root:root。各发行版路径不同 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-vm-sshconnectionissue-perms) |
| 7 | SSH 失败 — Serial Console 显示 'Failed to load SELinux policy'，OS 无法完成启动 | /etc/selinux/config 中 SELINUXTYPE 设为 'disabled' 而非 'targeted'/'minimum'/'mls' | (1) GRUB 添加 selinux=0 启动后修复 config; (2) az vm repair 挂 chroot 修复 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-selinux-troubleshooting) |
| 8 | VMware 迁移到 Azure 后无法连接 Debian 9.1 VM | NIC 名 'ens33p0' 而非 Azure 要求的 'eth0' | GRUB 添加 'net.ifnames=0 biosdevname=0'; /etc/network/interfaces 改为 auto eth0 + iface inet eth0 dhcp | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/cannot-connect-debian-linux) |
| 9 | SSH 失败: Permissions 0777 for '/etc/ssh/sshKeyName' are too open / key_load_private: bad permissions | /etc/ssh 目录或文件权限过宽(0777)，通常由错误的 chmod 命令导致 | 恢复权限: chmod 644 /etc/ssh/*; chmod 600 ssh_host*key + sshd_config; chmod 700 ~/.ssh; chmod 600 authorized_keys | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-ssh-permissions-too-open) |
| 10 📋 | Ubuntu UFW (Uncomplicated Firewall) 阻断端口包括 SSH | UFW 配置阻断 SSH 端口 | 见融合指南 guides/drafts/mslearn-ubuntu-ufw-troubleshoot.md | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/ubuntu-ufw-guide) |
| 11 | SSH/应用访问问题 — Redeploy Linux VM 到新节点 | 参考指南（无特定根因） | Redeploy VM 到新 Azure 节点 | 🔵 6 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/redeploy-to-new-node-linux) |
| 12 | Linux VM SSH 失败 — hv_netvsc 驱动被禁用，网络完全中断 | Hyper-V 网络驱动 (hv_netvsc) 在 /etc/modprobe.d/ 中被 blacklist | grep -nr hv_netvsc /etc/modprobe.d/，移除禁用条目，dracut -f -v 或 mkinitramfs，重启 | 🟢 8 — MS Learn 详细 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-hyperv-issue) |
| 13 | Linux VM NIC 变更后网络故障 — MAC 地址不匹配，cloud-init apply_network_config false | NIC MAC 变化但 OS 配置未更新; cloud-init apply_network_config 被禁用 | 设 apply_network_config: true; 或 rm /var/lib/cloud/instance/obj.pkl 后重启 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-hyperv-issue) |

## 快速排查路径
1. 确认 VM 运行状态 + NSG 规则允许 SSH (22) 入站 `[来源: MS Learn]`
2. 确认 Boot Diagnostics / Serial Console 可用 `[来源: MS Learn]`
3. 按错误类型分类 `[来源: MS Learn + OneNote]`
   - **认证成功后断开** → 检查 pam_limits (#1)
   - **权限错误** → 检查 /etc/ssh 和 sshd 目录权限 (#6, #9)
   - **SELinux 启动失败** → 修复 /etc/selinux/config (#7)
   - **网络完全中断** → 检查以下顺序:
     a. NIC 被禁用/静态 IP 错误 → reset-nic (#2)
     b. hv_netvsc 驱动被禁 → 移除 blacklist (#12)
     c. MAC 地址不匹配 → cloud-init 配置 (#13)
     d. 发行版特定 NIC 命名:
        - CentOS: HWADDR (#3)
        - SUSE: udev rules (#4)
        - Ubuntu: cloud-init/udev (#5)
        - Debian: NIC 命名 (#8)
4. **防火墙阻断** → UFW 排查 (#10) `[来源: MS Learn]`
5. 以上均无效 → Redeploy (#11) `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-ssh-linux.md#排查流程)
