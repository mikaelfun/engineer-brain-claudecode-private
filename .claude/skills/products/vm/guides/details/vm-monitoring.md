# VM Vm Monitoring — 综合排查指南

**条目数**: 1 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-c-monitoring-extension-linux-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-linux-manual-upgrade.md), [ado-wiki-c-monitoring-extension-windows-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-windows-manual-upgrade.md), [mslearn-vm-perf-monitoring-portal.md](../../guides/drafts/mslearn-vm-perf-monitoring-portal.md), [onenote-host-monitoring-agent-logs.md](../../guides/drafts/onenote-host-monitoring-agent-logs.md), [onenote-sar-linux-performance-monitoring.md](../../guides/drafts/onenote-sar-linux-performance-monitoring.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-c-monitoring-extension-linux-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-linux-manual-upgrade.md) 排查流程
2. 参照 [ado-wiki-c-monitoring-extension-windows-manual-upgrade.md](../../guides/drafts/ado-wiki-c-monitoring-extension-windows-manual-upgrade.md) 排查流程
3. 参照 [mslearn-vm-perf-monitoring-portal.md](../../guides/drafts/mslearn-vm-perf-monitoring-portal.md) 排查流程
4. 参照 [onenote-host-monitoring-agent-logs.md](../../guides/drafts/onenote-host-monitoring-agent-logs.md) 排查流程
5. 参照 [onenote-sar-linux-performance-monitoring.md](../../guides/drafts/onenote-sar-linux-performance-monitoring.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Bug in Azure File Sync v17 release causing bytes s | 1 条相关 | No customer-side workaround. PG working on service-side fix ... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | After upgrading Azure File Sync agent from v16 to v17, the Bytes Synced metric in Azure portal overr... | Bug in Azure File Sync v17 release causing bytes synced metric to overreport. | No customer-side workaround. PG working on service-side fix (IcM 477088437). Met... | 🔵 7.0 | ADO Wiki |

