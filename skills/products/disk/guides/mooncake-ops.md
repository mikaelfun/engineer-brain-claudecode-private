# Disk Mooncake Operations — 排查速查

**来源数**: 1 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: escort-access, fairfax, geneva-action, mooncake, national-cloud, psa, rbac, security

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Geneva Action cannot be triggered in national clouds (Mooncake/Fairfax): operations require escort access or Run with Ap | National clouds have stricter security policy. Geneva Actions with combined PSA+PSO+PSV claims use t | Adjust Geneva Action claims: each operation should have ONE role within a scope (not PSA+PSO+PSV combined). Create a rea | 🟢 9 | [MCVKB] |

## 快速排查路径

1. Geneva Action cannot be triggered in national clouds (Mooncake/Fairfax): operati → Adjust Geneva Action claims: each operation should have ONE role within a scope (not PSA+PSO+PSV com `[来源: onenote]`
