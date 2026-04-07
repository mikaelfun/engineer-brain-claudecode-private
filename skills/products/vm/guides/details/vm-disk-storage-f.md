# VM Vm Disk Storage F — 综合排查指南

**条目数**: 4 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-adds-hybrid-storage-aadj-haadj.md](../../guides/drafts/ado-wiki-f-adds-hybrid-storage-aadj-haadj.md), [ado-wiki-f-debug-azstorage-account-auth.md](../../guides/drafts/ado-wiki-f-debug-azstorage-account-auth.md), [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: OneNote

1. 参照 [ado-wiki-f-adds-hybrid-storage-aadj-haadj.md](../../guides/drafts/ado-wiki-f-adds-hybrid-storage-aadj-haadj.md) 排查流程
2. 参照 [ado-wiki-f-debug-azstorage-account-auth.md](../../guides/drafts/ado-wiki-f-debug-azstorage-account-auth.md) 排查流程
3. 参照 [onenote-vm-storage-performance-throttling.md](../../guides/drafts/onenote-vm-storage-performance-throttling.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Windows Server in-place upgrade requires following | 1 条相关 | 1) Always snapshot before upgrade; 2) Supported: 2012->2012R... |
| BCD corruption or incorrect OS disk reference afte | 1 条相关 | 0xC000000E: https://learn.microsoft.com/en-us/troubleshoot/a... |
| BitLocker recovery key location depends on join ty | 1 条相关 | AD: Get-ADObject -Filter msFVE-RecoveryInformation on DC/RSA... |
| Azure VM extensions are not in the support matrix  | 1 条相关 | 1) Attempt extension removal: az vm extension delete -g <RG>... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to perform Windows Server in-place upgrade on Azure VM (e.g. 2012R2->2016/2019, 2016->2019/2022... | Windows Server in-place upgrade requires following specific supported upgrade pa... | 1) Always snapshot before upgrade; 2) Supported: 2012->2012R2/2016, 2012R2->2016... | 🔵 7.5 | OneNote |
| 2 | After CrowdStrike BSOD fix, Azure VM fails to boot with winload.exe error 0xC000000E or winload.efi ... | BCD corruption or incorrect OS disk reference after OS disk swap during CrowdStr... | 0xC000000E: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machine... | 🔵 7.5 | OneNote |
| 3 | During CrowdStrike BSOD repair, BitLocker-encrypted disk requires recovery key that customer cannot ... | BitLocker recovery key location depends on join type: AD-joined, AAD-joined, or ... | AD: Get-ADObject -Filter msFVE-RecoveryInformation on DC/RSAT server. AAD (Moonc... | 🔵 7.5 | OneNote |
| 4 | Palo Alto firewall VM fails to convert from unmanaged disk to managed disk; extensions (OMSAgentForL... | Azure VM extensions are not in the support matrix for Palo Alto OS. Extension op... | 1) Attempt extension removal: az vm extension delete -g <RG> --vm-name <VM> -n <... | 🔵 7.5 | OneNote |

