# ARM CN1/CE1 区域迁移 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Storage cross-region live migration gets stuck or aborts when storage account has sustained i… | Live cross-region migration is a single atomic operation using geo-replication machinery. High sust… | Throttle or freeze writes during migration. Prefer ADF/AzCopy for Mooncake: create new storage acco… | 🟢 8.5 — onenote+21V适用 | [MCVKB/CN1_CE1 Migration 防坑指南 - PG Storage Migration Guid.md] |
| 2 | After Azure SQL geo-replication failover (promoting secondary), application cannot authenticate — l… | Geo-replication copies database-level Users automatically but does NOT copy server-level Logins. If… | Before failover: export all logins with SIDs from source (sys.sql_logins), create matching logins o… | 🟢 8.5 — onenote+21V适用 | [MCVKB/CN1_CE1 Migration 防坑指南 - SQL Migration Guide.md] |

## 快速排查路径
1. Throttle or freeze writes during migration. Prefer ADF/AzCopy for Mooncake: cre… `[来源: onenote]`
2. Before failover: export all logins with SIDs from source (sys.sql_logins), crea… `[来源: onenote]`
