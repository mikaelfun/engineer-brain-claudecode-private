# VM Vm Migration — 综合排查指南

**条目数**: 3 | **草稿融合数**: 3 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-b-vm-unreachable-after-migration-staticnic-grub-bls.md](../../guides/drafts/ado-wiki-b-vm-unreachable-after-migration-staticnic-grub-bls.md), [ado-wiki-c-ADE-Migration-FAQ.md](../../guides/drafts/ado-wiki-c-ADE-Migration-FAQ.md), [onenote-fabric-maintenance-migration-check.md](../../guides/drafts/onenote-fabric-maintenance-migration-check.md)
**Kusto 引用**: [live-migration.md](../../../kusto/vm/references/queries/live-migration.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — live-migration.md]`

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-b-vm-unreachable-after-migration-staticnic-grub-bls.md](../../guides/drafts/ado-wiki-b-vm-unreachable-after-migration-staticnic-grub-bls.md) 排查流程
2. 参照 [ado-wiki-c-ADE-Migration-FAQ.md](../../guides/drafts/ado-wiki-c-ADE-Migration-FAQ.md) 排查流程
3. 参照 [onenote-fabric-maintenance-migration-check.md](../../guides/drafts/onenote-fabric-maintenance-migration-check.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Files have NTFS Alternate Data Streams which Azure | 1 条相关 | Remove alternate data streams before copying: Remove-Item <f... |
| Source files have Alternate Data Streams (ADS). Az | 1 条相关 | Check for ADS with Get-Item <file> -Stream *. If streams bey... |
| Permissions on the System Volume Information (SVI) | 1 条相关 | Grant SYSTEM full control: run PsExec.exe -s -I -d cmd, then... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 'File already exists' error when copying files to mounted Azure file share using Windows File Explor... | Files have NTFS Alternate Data Streams which Azure File Shares do not support | Remove alternate data streams before copying: Remove-Item <filepath> -Stream *; ... | 🔵 7.0 | ADO Wiki |
| 2 | Copying files into mounted Azure File Share using Windows File Explorer shows File already exists or... | Source files have Alternate Data Streams (ADS). Azure File Shares do not support... | Check for ADS with Get-Item <file> -Stream *. If streams beyond :$DATA exist, re... | 🔵 7.0 | ADO Wiki |
| 3 | Azure File Sync upload operations fail with error code -2147024891 (Access Denied). Download operati... | Permissions on the System Volume Information (SVI) folder are incorrect; NT AUTH... | Grant SYSTEM full control: run PsExec.exe -s -I -d cmd, then cacls "<drive>:\sys... | 🔵 7.0 | ADO Wiki |

