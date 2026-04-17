# ARM ARM Private Link — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Creating Private Link Association (PLA) at a scope other than the root management group fails | Currently, the only allowed scope for the PLA resource (Microsoft.Authorization/privateLinkAssociat… | Create the PLA at the root management group scope. There is currently no option to scope it to a sp… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Cannot set Public Network Access to Disabled on ARM Private Link Association (PLA) | The Public Network Access option in the PLA exists but the Disabled setting has not been released y… | Inform the customer that the Public Network Access = Disabled option is not currently available. Th… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Create the PLA at the root management group scope. There is currently no option… `[来源: ado-wiki]`
2. Inform the customer that the Public Network Access = Disabled option is not cur… `[来源: ado-wiki]`
