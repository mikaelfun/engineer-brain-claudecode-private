# VM Vm Gpu — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 1 | **关键词**: gpu
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | File Explorer tab with Azure File Share mount (mapped drive via GPO) closes unexpectedly every ~90 m... | GPO Drive Map policy configured with Replace action causes the mapped drive to d... | Change the GPO Drive Map action from Replace to Update in New Drive Properties d... | 🔵 7.0 | ADO Wiki |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-gpu.md)
