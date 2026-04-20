# VM Vm Windows Os — 综合排查指南

**条目数**: 6 | **草稿融合数**: 11 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-Guest-Agent-Event-Logs-Reference-Guide-WindowsOS.md](../../guides/drafts/ado-wiki-b-Guest-Agent-Event-Logs-Reference-Guide-WindowsOS.md), [ado-wiki-b-Unlock-Encrypted-Windows-Disk.md](../../guides/drafts/ado-wiki-b-Unlock-Encrypted-Windows-Disk.md), [ado-wiki-c-aad-login-extension-for-windows.md](../../guides/drafts/ado-wiki-c-aad-login-extension-for-windows.md), [ado-wiki-c-monitoring-extension-windows-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-windows-manual-upgrade.md), [ado-wiki-c-windows-partitions-non-boot.md](../../guides/drafts/ado-wiki-c-windows-partitions-non-boot.md), [ado-wiki-d-access-file-share-from-windows.md](../../guides/drafts/ado-wiki-d-access-file-share-from-windows.md), [ado-wiki-e-Encrypt-a-Windows-VM.md](../../guides/drafts/ado-wiki-e-Encrypt-a-Windows-VM.md), [ado-wiki-f-Search-Windows-Events-From-SAC.md](../../guides/drafts/ado-wiki-f-Search-Windows-Events-From-SAC.md), [mslearn-windows-activation-troubleshoot.md](../../guides/drafts/mslearn-windows-activation-troubleshoot.md), [mslearn-windows-vm-deployment-faqs.md](../../guides/drafts/mslearn-windows-vm-deployment-faqs.md), [onenote-windows-server-eos-esu-policy.md](../../guides/drafts/onenote-windows-server-eos-esu-policy.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: MS Learn, ADO Wiki

1. 参照 [ado-wiki-b-Guest-Agent-Event-Logs-Reference-Guide-WindowsOS.md](../../guides/drafts/ado-wiki-b-Guest-Agent-Event-Logs-Reference-Guide-WindowsOS.md) 排查流程
2. 参照 [ado-wiki-b-Unlock-Encrypted-Windows-Disk.md](../../guides/drafts/ado-wiki-b-Unlock-Encrypted-Windows-Disk.md) 排查流程
3. 参照 [ado-wiki-c-aad-login-extension-for-windows.md](../../guides/drafts/ado-wiki-c-aad-login-extension-for-windows.md) 排查流程
4. 参照 [ado-wiki-c-monitoring-extension-windows-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-windows-manual-upgrade.md) 排查流程
5. 参照 [ado-wiki-c-windows-partitions-non-boot.md](../../guides/drafts/ado-wiki-c-windows-partitions-non-boot.md) 排查流程
6. 参照 [ado-wiki-d-access-file-share-from-windows.md](../../guides/drafts/ado-wiki-d-access-file-share-from-windows.md) 排查流程
7. 参照 [ado-wiki-e-Encrypt-a-Windows-VM.md](../../guides/drafts/ado-wiki-e-Encrypt-a-Windows-VM.md) 排查流程
8. 参照 [ado-wiki-f-Search-Windows-Events-From-SAC.md](../../guides/drafts/ado-wiki-f-Search-Windows-Events-From-SAC.md) 排查流程
9. 参照 [mslearn-windows-activation-troubleshoot.md](../../guides/drafts/mslearn-windows-activation-troubleshoot.md) 排查流程
10. 参照 [mslearn-windows-vm-deployment-faqs.md](../../guides/drafts/mslearn-windows-vm-deployment-faqs.md) 排查流程
11. 参照 [onenote-windows-server-eos-esu-policy.md](../../guides/drafts/onenote-windows-server-eos-esu-policy.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| SYSTEM account lacks Full Control permissions on t | 1 条相关 | Grant SYSTEM account Full Control on the target installation... |
| VM is experiencing a performance spike or virtual  | 1 条相关 | Identify resource-heavy processes via Task Manager or Get-Pr... |
| SLES 12 Public Cloud module not enabled by default | 1 条相关 | SUSEConnect -p sle-module-public-cloud/12/x86_64. For SAP re... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure File Sync agent installation fails with error 0x80070080 - SYSTEM account does not have Full C... | SYSTEM account lacks Full Control permissions on the installation folder, possib... | Grant SYSTEM account Full Control on the target installation directory. Check fo... | 🟢 8.0 | ADO Wiki |
| 2 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage;... | VM is experiencing a performance spike or virtual memory exhaustion due to appli... | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory... | 🟢 8.0 | ADO Wiki |
| 3 | SLES migration: suse-migration-sle15-activation not found in package names | SLES 12 Public Cloud module not enabled by default. | SUSEConnect -p sle-module-public-cloud/12/x86_64. For SAP remove sle-ha-release.... | 🔵 7.0 | MS Learn |



---

## 增量补充条目 (2026-04-18)

### vm-contentidea-kb-007
**来源**: KB | **分数**: 🟡 5.0

**症状**: Remote Server Administration Tools (RSAT) enables IT administrators to remotely manage roles and features in Windows Server 2012 R2, Windows Server 2012, Windows Server 2008, and Windows Server 2008 R2 from a computer that is running Windows 10, Windows 8.1, Windows 8, Windows 7, or Windows Vista. For RSAT on Windows Vista and Windows 7, you must enable the tools for the roles and features that yo

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

---

### vm-contentidea-kb-023
**来源**: KB | **分数**: 🟡 5.0

**症状**: Running Windows Server 2008 on Microsoft Azure Summary This article provides information about Windows Server 2008 support, and answers some of the most common questions about running Windows Server 2008 on Microsoft Azure. Extended support for Windows Server 2008 The extended support for Windows Server 2008 will be ended on January 14, 2020. If you are running Windows Server 2008, this may put yo

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

---

### vm-contentidea-kb-036
**来源**: KB | **分数**: 🟡 5.0

**症状**: Nano Server is optimized as a lightweight operating system for running ôcloud-nativeö applications based on containers and micro-services or as an agile and cost-effective datacenter host with a dramatically smaller footprint, there are important differences in Nano Server versus Server Core or Server with Desktop Experience installations. Note: This blog is to address the Uplink mode and Teaming 

**根因**: Reference doc (no explicit root cause)

**方案**: See original document for detailed steps

---
