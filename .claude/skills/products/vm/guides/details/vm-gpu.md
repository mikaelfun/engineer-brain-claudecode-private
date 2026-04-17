# VM Vm Gpu — 综合排查指南

**条目数**: 1 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-flickering-nvidia-gpu.md](../../guides/drafts/ado-wiki-a-flickering-nvidia-gpu.md), [onenote-gpu-extension-tsg-index.md](../../guides/drafts/onenote-gpu-extension-tsg-index.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-a-flickering-nvidia-gpu.md](../../guides/drafts/ado-wiki-a-flickering-nvidia-gpu.md) 排查流程
2. 参照 [onenote-gpu-extension-tsg-index.md](../../guides/drafts/onenote-gpu-extension-tsg-index.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| GPO Drive Map policy configured with Replace actio | 1 条相关 | Change the GPO Drive Map action from Replace to Update in Ne... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | File Explorer tab with Azure File Share mount (mapped drive via GPO) closes unexpectedly every ~90 m... | GPO Drive Map policy configured with Replace action causes the mapped drive to d... | Change the GPO Drive Map action from Replace to Update in New Drive Properties d... | 🔵 7.0 | ADO Wiki |

