# VM Vm Monitoring — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 1 | **关键词**: monitoring
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After upgrading Azure File Sync agent from v16 to v17, the Bytes Synced metric in Azure portal overr... | Bug in Azure File Sync v17 release causing bytes synced metric to overreport. | No customer-side workaround. PG working on service-side fix (IcM 477088437). Met... | 🔵 7.0 | ADO Wiki |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-monitoring.md)
