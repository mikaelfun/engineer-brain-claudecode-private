# VM Vm Connectivity Ssh — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 6 | **关键词**: connectivity, ssh
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After using Reset Password (EnableVMAccess extension) on a Linux VM, ChallengeResponseAuthentication... | By design — the EnableVMAccess extension explicitly sets ChallengeResponseAuthen... | This is expected behavior. If the customer requires ChallengeResponseAuthenticat... | 🟢 8.0 | ADO Wiki |
| 2 | After using Reset Password feature on a Linux VM, ChallengeResponseAuthentication is set to no in /e... | The EnableVMAccess extension explicitly sets ChallengeResponseAuthentication to ... | Inform customer this is by design - a security measure implemented by the VMAcce... | 🟢 8.0 | ADO Wiki |
| 3 | After using Reset Password on a Linux VM, sshd_config is modified: ChallengeResponseAuthentication i... | By design behavior. The EnableVMAccess (VMAccessForLinux) extension explicitly s... | This is expected behavior by design. Inform the customer that the EnableVMAccess... | 🟢 8.0 | ADO Wiki |
| 4 | VMAccessForLinux extension fails: 'Enable failed: No password or ssh_key is specified'. | Neither password nor SSH key was provided in the VMAccess extension settings for... | Provide password or ssh_key information for the account in the VMAccess extensio... | 🟢 8.0 | ADO Wiki |
| 5 | AIB build with customer VNET fails after ~30 minutes with WinRM/SSH connection timeout via proxy VM.... | Traffic to proxy VM comes from two sources: AzureLoadBalancer and private endpoi... | Add two NSG inbound rules before DenyAll: (1) TCP 60000-60001 from AzureLoadBala... | 🟢 8.0 | ADO Wiki |
| 6 | Linux VM SSH authentication succeeds but session immediately disconnects; /var/log/secure shows pam_... | nofile hard limit in /etc/security/limits.conf set higher than /proc/sys/fs/nr_o... | 1) Attach OS disk as data disk to rescue VM; 2) Either: change UsePAM yes to Use... | 🔵 6.5 | OneNote |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-connectivity-ssh.md)
