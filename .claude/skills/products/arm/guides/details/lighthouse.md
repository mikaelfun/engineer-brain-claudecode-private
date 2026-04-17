# ARM Azure Lighthouse 委托管理 — 综合排查指南

**条目数**: 2 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-lighthouse-get-configuration.md, ado-wiki-a-lighthouse-get-logs.md, ado-wiki-b-lighthouse-architecture.md, ado-wiki-b-lighthouse-start-here.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Lighthouse delegations (Registration Assignments, Definitions, RBAC roles…
> 来源: ado-wiki

**根因分析**: When a subscription is moved to a tenant that is one of the managedBy tenants, Azure automatically removes the delegation data (Registration Assignments, Definitions, and RBAC roles) for that specific target tenant. Delegations to other tenants remain intact.

1. Re-create the Lighthouse delegations after the tenant migration.
2. If the target tenant is NOT one of the managedBy tenants, no action is needed - all active delegations continue to work.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Lighthouse 委派 CRUD 操作在 RP scope 层面无法找到日志
> 来源: ado-wiki

**根因分析**: Lighthouse 资源提供程序不在 RP scope 暴露日志，目前无法通过 RP scope 查看 Lighthouse 委派操作（注册分配/注册定义的创建、更新、删除）的日志

1. ARM 层日志：参考 [TSG] Locate a specific operation in Kusto，使用 Lighthouse 资源信息查询 ARM 层记录；Lighthouse 授权的用户操作（应通过 Lighthouse 授权但失败的 API 调用）：使用 [TSG] Get a HTTP trace 收集 HTTP 跟踪日志后分析。.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Lighthouse delegations (Registration Assignments, Def… | When a subscription is moved to a tenant that is one of the… | Re-create the Lighthouse delegations after the tenant migra… |
| Azure Lighthouse 委派 CRUD 操作在 RP scope 层面无法找到日志 | Lighthouse 资源提供程序不在 RP scope 暴露日志，目前无法通过 RP scope 查看 Lighth… | ARM 层日志：参考 [TSG] Locate a specific operation in Kusto，使用 Li… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Lighthouse delegations (Registration Assignments, Definitions, RBAC roles) disappear after mo… | When a subscription is moved to a tenant that is one of the managedBy tenants, Azure automatically … | Re-create the Lighthouse delegations after the tenant migration. If the target tenant is NOT one of… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Lighthouse 委派 CRUD 操作在 RP scope 层面无法找到日志 | Lighthouse 资源提供程序不在 RP scope 暴露日志，目前无法通过 RP scope 查看 Lighthouse 委派操作（注册分配/注册定义的创建、更新、删除）的日志 | ARM 层日志：参考 [TSG] Locate a specific operation in Kusto，使用 Lighthouse 资源信息查询 ARM 层记录；Lighthouse 授权的用户… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
