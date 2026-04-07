# ARM Azure Resource Graph — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Resource Graph query returns stale/outdated data for resources table that does not match curr… | ARG updates data on PUT/PATCH/DELETE through ARM. If resource state changes without going through A… | 1) Check ARMProd Kusto if the change went through ARM endpoint. 2) If RP has not implemented ARG no… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Resource Graph query returns stale/outdated data for proxy resource types (non-resources tabl… | Proxy resource data is fed into ARG via custom RP pipeline. If data in ARG differs from RP API, the… | 1) Compare proxy resource ARM API response with ARG data. 2) If data is also outdated on RP API, is… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Customer wants to export Azure Policy compliance data but cannot find the option in the Azure portal | — | Compliance data export through the portal is not supported. Use Azure Resource Graph (ARG) or REST … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1) Check ARMProd Kusto if the change went through ARM endpoint. 2) If RP has no… `[来源: ado-wiki]`
2. 1) Compare proxy resource ARM API response with ARG data. 2) If data is also ou… `[来源: ado-wiki]`
3. Compliance data export through the portal is not supported. Use Azure Resource … `[来源: ado-wiki]`
