# ARM Azure Lighthouse 委托管理 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Lighthouse delegations (Registration Assignments, Definitions, RBAC roles) disappear after mo… | When a subscription is moved to a tenant that is one of the managedBy tenants, Azure automatically … | Re-create the Lighthouse delegations after the tenant migration. If the target tenant is NOT one of… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Lighthouse 委派 CRUD 操作在 RP scope 层面无法找到日志 | Lighthouse 资源提供程序不在 RP scope 暴露日志，目前无法通过 RP scope 查看 Lighthouse 委派操作（注册分配/注册定义的创建、更新、删除）的日志 | ARM 层日志：参考 [TSG] Locate a specific operation in Kusto，使用 Lighthouse 资源信息查询 ARM 层记录；Lighthouse 授权的用户… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Re-create the Lighthouse delegations after the tenant migration. If the target … `[来源: ado-wiki]`
2. ARM 层日志：参考 [TSG] Locate a specific operation in Kusto，使用 Lighthouse 资源信息查询 ARM … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/lighthouse.md#排查流程)
