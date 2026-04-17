# ACR DNS 与注册表创建 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR registry creation fails with 400 error due to DNS name conflict - CNAME alre | RP leaks CNAME records when registry creation fails during vNET handshake with N | 1) Verify via Kusto: RPActivity | where LoginServerName == registry | project en | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-027] |
| 2 | ACR registry name not available after deletion - CheckNameAvailability returns N | Name Reservation Service (NRS) reserves deleted registry names: Internal=infinit | 1) Verify NRS reservation via Kusto: RPActivity | where TaskName == NameReservat | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-028] |

## 快速排查路径
1. 检查 → RP leaks CNAME records when registry creation fails during v `[来源: ADO Wiki]`
   - 方案: 1) Verify via Kusto: RPActivity | where LoginServerName == registry | project env_time, CorrelationI
2. 检查 → Name Reservation Service (NRS) reserves deleted registry nam `[来源: ADO Wiki]`
   - 方案: 1) Verify NRS reservation via Kusto: RPActivity | where TaskName == NameReservationServiceManagement

> 本 topic 有融合排查指南 → [完整排查流程](details/dns-registry-creation.md#排查流程)
