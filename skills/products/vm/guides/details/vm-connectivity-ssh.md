# VM Vm Connectivity Ssh — 综合排查指南

**条目数**: 6 | **草稿融合数**: 11 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md), [ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md), [ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md), [ado-wiki-b-Collecting-VHD-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collecting-VHD-RDP-SSH.md), [ado-wiki-c-openssh.md](../../guides/drafts/ado-wiki-c-openssh.md), [ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md), [ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md), [mslearn-detailed-ssh-troubleshoot.md](../../guides/drafts/mslearn-detailed-ssh-troubleshoot.md), [mslearn-ssh-troubleshoot.md](../../guides/drafts/mslearn-ssh-troubleshoot.md), [onenote-asr-srsshoeboxevent-kusto-reference.md](../../guides/drafts/onenote-asr-srsshoeboxevent-kusto-reference.md), [onenote-ssh-into-aks-vmss-nodes.md](../../guides/drafts/onenote-ssh-into-aks-vmss-nodes.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki, OneNote

1. 参照 [ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md) 排查流程
2. 参照 [ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md) 排查流程
3. 参照 [ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md) 排查流程
4. 参照 [ado-wiki-b-Collecting-VHD-RDP-SSH.md](../../guides/drafts/ado-wiki-b-Collecting-VHD-RDP-SSH.md) 排查流程
5. 参照 [ado-wiki-c-openssh.md](../../guides/drafts/ado-wiki-c-openssh.md) 排查流程
6. 参照 [ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md) 排查流程
7. 参照 [ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md](../../guides/drafts/ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md) 排查流程
8. 参照 [mslearn-detailed-ssh-troubleshoot.md](../../guides/drafts/mslearn-detailed-ssh-troubleshoot.md) 排查流程
9. 参照 [mslearn-ssh-troubleshoot.md](../../guides/drafts/mslearn-ssh-troubleshoot.md) 排查流程
10. 参照 [onenote-asr-srsshoeboxevent-kusto-reference.md](../../guides/drafts/onenote-asr-srsshoeboxevent-kusto-reference.md) 排查流程
11. 参照 [onenote-ssh-into-aks-vmss-nodes.md](../../guides/drafts/onenote-ssh-into-aks-vmss-nodes.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| By design — the EnableVMAccess extension explicitl | 1 条相关 | This is expected behavior. If the customer requires Challeng... |
| The EnableVMAccess extension explicitly sets Chall | 1 条相关 | Inform customer this is by design - a security measure imple... |
| By design behavior. The EnableVMAccess (VMAccessFo | 1 条相关 | This is expected behavior by design. Inform the customer tha... |
| Neither password nor SSH key was provided in the V | 1 条相关 | Provide password or ssh_key information for the account in t... |
| Traffic to proxy VM comes from two sources: AzureL | 1 条相关 | Add two NSG inbound rules before DenyAll: (1) TCP 60000-6000... |
| nofile hard limit in /etc/security/limits.conf set | 1 条相关 | 1) Attach OS disk as data disk to rescue VM; 2) Either: chan... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After using Reset Password (EnableVMAccess extension) on a Linux VM, ChallengeResponseAuthentication... | By design — the EnableVMAccess extension explicitly sets ChallengeResponseAuthen... | This is expected behavior. If the customer requires ChallengeResponseAuthenticat... | 🟢 8.0 | ADO Wiki |
| 2 | After using Reset Password feature on a Linux VM, ChallengeResponseAuthentication is set to no in /e... | The EnableVMAccess extension explicitly sets ChallengeResponseAuthentication to ... | Inform customer this is by design - a security measure implemented by the VMAcce... | 🟢 8.0 | ADO Wiki |
| 3 | After using Reset Password on a Linux VM, sshd_config is modified: ChallengeResponseAuthentication i... | By design behavior. The EnableVMAccess (VMAccessForLinux) extension explicitly s... | This is expected behavior by design. Inform the customer that the EnableVMAccess... | 🟢 8.0 | ADO Wiki |
| 4 | VMAccessForLinux extension fails: 'Enable failed: No password or ssh_key is specified'. | Neither password nor SSH key was provided in the VMAccess extension settings for... | Provide password or ssh_key information for the account in the VMAccess extensio... | 🟢 8.0 | ADO Wiki |
| 5 | AIB build with customer VNET fails after ~30 minutes with WinRM/SSH connection timeout via proxy VM.... | Traffic to proxy VM comes from two sources: AzureLoadBalancer and private endpoi... | Add two NSG inbound rules before DenyAll: (1) TCP 60000-60001 from AzureLoadBala... | 🟢 8.0 | ADO Wiki |
| 6 | Linux VM SSH authentication succeeds but session immediately disconnects; /var/log/secure shows pam_... | nofile hard limit in /etc/security/limits.conf set higher than /proc/sys/fs/nr_o... | 1) Attach OS disk as data disk to rescue VM; 2) Either: change UsePAM yes to Use... | 🔵 6.5 | OneNote |

