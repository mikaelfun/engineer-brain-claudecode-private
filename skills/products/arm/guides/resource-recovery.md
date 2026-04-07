# ARM 资源恢复 — 排查速查

**来源数**: 4 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer deleted a Storage Account and needs recovery | Storage Account was deleted (individually, via RG deletion, bulk delete, or deployment in complete … | Storage Account is self-recoverable within 14 days of deletion. Customer must first attempt self-re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Customer deleted Network resources (Microsoft.Network/*) and needs recovery | Network resources (Public IPs, VNets, NSGs, etc.) were deleted | Most Microsoft.Network resources are NON-RECOVERABLE. Public IPs cannot be recovered. Other NRP res… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Customer deleted a Key Vault and needs recovery | Key Vault was deleted (individually or as part of RG deletion) | Key Vault is self-recoverable via soft-delete feature. Point customer to public doc: https://learn.… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Customer deleted ServiceBus, EventHub, EventGrid, Relay, or NotificationHub resources and needs rec… | These messaging service resources were deleted | ServiceBus, EventHub, EventGrid, Relay, and NotificationHub resources are NON-RECOVERABLE. Notify c… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Storage Account is self-recoverable within 14 days of deletion. Customer must f… `[来源: ado-wiki]`
2. Most Microsoft.Network resources are NON-RECOVERABLE. Public IPs cannot be reco… `[来源: ado-wiki]`
3. Key Vault is self-recoverable via soft-delete feature. Point customer to public… `[来源: ado-wiki]`
