# Disk — 知识矛盾检测报告

**生成日期**: 2026-04-07 | **候选对扫描**: 16 | **真矛盾**: 3 | **误报**: 13

| # | Topic | 类型 | 来源A | 来源B | 判断 | 建议 |
|---|-------|------|-------|-------|------|------|
| 001 | data-box-disk-setup | solution_conflict | disk-015(onenote) | disk-122(ado-wiki) | context_dependent | 指南中两个都保留，标注条件：轻度损坏先尝试 ntfsfix，严重损坏/物理故障则... |
| 002 | data-box-disk-setup | solution_conflict | disk-019(onenote) | disk-128(ado-wiki) | context_dependent | 指南中先列 ADO Wiki 具体修复方案，OneNote 的换 OS 作为 f... |
| 003 | data-box-pod-prepare | rootCause_conflict | disk-028(onenote) | disk-246(ado-wiki) | context_dependent | 指南中按根因分支列出，均保留... |

## 误报说明

以下 13 对候选虽然症状关键词重叠度 >45%，但分析后判定为误报（不同错误码/不同子问题/相同结论）：

- **ade-bitlocker**: disk-001 vs disk-276/277 — 不同 ADE 错误码，不同根因，非矛盾
- **aks-disk**: disk-011 vs disk-267 — 两源结论完全一致（LRS 跨 AZ 限制，方案 ZRS/nodeAffinity）
- **data-box-disk-setup**: disk-058 vs disk-129 — 不同症状（重启后需 re-unlock vs 磁盘物理不识别）
- **data-box-disk-setup**: disk-059 vs disk-327 — 不同症状（USB 弹出 vs Linux read-only 挂载）
- **data-box-pod-connectivity**: disk-038 vs disk-153/156/158/163/164 — OneNote 通用条目 vs ADO Wiki 细分子问题，互补不矛盾
- **data-box-pod-copy**: disk-026 vs disk-330 — 两源结论一致（VHD 512 字节对齐）
- **data-box-pod-ordering**: disk-047 vs disk-179 — 不同症状（archive 层 vs XML 格式错误）
