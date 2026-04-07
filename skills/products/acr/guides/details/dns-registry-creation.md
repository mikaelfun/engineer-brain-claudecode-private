# ACR DNS 与注册表创建 — 综合排查指南

**条目数**: 2 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-acr-custom-domain.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: RP leaks CNAME records when registry creation fails during v
> 来源: ADO Wiki

1. 1) Verify via Kusto: RPActivity | where LoginServerName == registry | project env_time, CorrelationId, Level, HttpMethod, HttpStatus. 2) Use Geneva action Clean up orphan registry CNAME record to manu

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Name Reservation Service (NRS) reserves deleted registry nam
> 来源: ADO Wiki

1. 1) Verify NRS reservation via Kusto: RPActivity | where TaskName == NameReservationServiceManagement | where Message contains name. 2) If reason is NameNotAvailable_NotAllowedByPolicy -> ACIS action F

`[结论: 🟢 8.0/10 — ADO Wiki]`

---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR registry creation fails with 400 error due to DNS name c | RP leaks CNAME records when | → Phase 1 |
| ACR registry name not available after deletion - CheckNameAv | Name Reservation Service (NRS) reserves | → Phase 2 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR registry creation fails with 400 error due to DNS name conflict - CNAME alre | RP leaks CNAME records when registry creation fails during vNET handshake with N | 1) Verify via Kusto: RPActivity | where LoginServerName == registry | project en | 🟢 8.0 | ADO Wiki |
| 2 | ACR registry name not available after deletion - CheckNameAvailability returns N | Name Reservation Service (NRS) reserves deleted registry names: Internal=infinit | 1) Verify NRS reservation via Kusto: RPActivity | where TaskName == NameReservat | 🟢 8.0 | ADO Wiki |
