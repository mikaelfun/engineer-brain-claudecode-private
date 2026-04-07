# ACR ACR API 版本弃用 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer receives ACR API deprecation email notification for 2018-02-01-preview  | ARM PolicyScan service (clientApplicationId: 1d78a85d-813d-46f0-b496-dd72f50a3ec | Run Kusto query on armprodgbl cluster to verify userAgent: if only 'PolicyScan'  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-004] |
| 2 | ACR API calls fail after deprecation date for preview API versions (2016-06-27-p | Customer is using deprecated ACR API versions that have reached end-of-support | 1) Migrate to a newer ACR API version listed at https://learn.microsoft.com/azur | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-005] |

## 快速排查路径
1. 检查 → ARM PolicyScan service (clientApplicationId: 1d78a85d-813d-4 `[来源: ADO Wiki]`
   - 方案: Run Kusto query on armprodgbl cluster to verify userAgent: if only 'PolicyScan' appears with the kno
2. 检查 → Customer is using deprecated ACR API versions that have reac `[来源: ADO Wiki]`
   - 方案: 1) Migrate to a newer ACR API version listed at https://learn.microsoft.com/azure/templates/microsof

> 本 topic 有融合排查指南 → [完整排查流程](details/api-deprecation.md#排查流程)
