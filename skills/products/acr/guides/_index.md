# ACR 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [认证与登录故障](acr-auth-login.md) | 📋 融合 | 1 | authentication, login, 401, 403 | 9 | high |
| [RBAC 授权与权限管理](acr-rbac-authorization.md) | 📋 融合 | 0 | rbac, abac, authorization, token | 6 | high |
| [私有链路与专用终结点](acr-private-link.md) | 📋 融合 | 0 | private-link, private-endpoint, dns | 10 | high |
| [网络防火墙与 MCR 代理](acr-network-firewall.md) | 📋 融合 | 0 | firewall, network, mcr, proxy | 8 | high |
| [镜像拉取故障](acr-pull-failures.md) | 📋 融合 | 1 | pull, timeout, 502, manifest-unknown | 8 | high |
| [推送、存储限制与限流](acr-push-storage-throttling.md) | 📋 融合 | 3 | push, throttling, 429, 503, storage-limit | 7 | high |
| [与 AKS/Web App/Function App 集成](acr-service-integration.md) | 📊 速查 | 0 | aks, web-app, managed-identity, acrpull | 7 | high |
| [镜像删除、恢复与软删除](acr-deletion-recovery.md) | 📋 融合 | 1 | delete, recovery, soft-delete, undelete | 12 | high |
| [审计日志与操作追溯](acr-audit-investigation.md) | 📋 融合 | 1 | audit, investigation, operator-ip, bulk-deletion | 7 | high |
| [镜像清理与保留策略](acr-retention-cleanup.md) | 📊 速查 | 0 | retention, purge, cleanup, acr-cli | 3 | medium |
| [Tasks 构建与自动化](acr-tasks.md) | 📋 融合 | 1 | acr-task, build, buildkit, agent-pool | 9 | high |
| [Content Trust 与 Notation 签名](acr-content-trust-signing.md) | 📋 融合 | 0 | content-trust, notation, dct, notary | 7 | medium |
| [Connected Registry (Arc 扩展)](acr-connected-registry.md) | 📊 速查 | 0 | connected-registry, arc-extension, pvc | 3 | medium |
| [注册表生命周期管理](acr-registry-lifecycle.md) | 📋 融合 | 2 | dns, cname, replication, api-deprecation | 8 | medium |
| [跨租户与 AAD 迁移](acr-cross-tenant.md) | 📋 融合 | 0 | cross-tenant, aad, tenant-migration | 3 | medium |
| [缓存规则 (Cache Rules)](acr-caching.md) | 📊 速查 | 0 | caching, cache-rule, upstream-registry | 4 | medium |
| [漏洞扫描与 Defender 集成](acr-vulnerability-scanning.md) | 📋 融合 | 0 | vulnerability, defender, scanning | 3 | medium |
| [诊断工具与其他问题](acr-diagnostics-misc.md) | 📋 融合 | 0 | kusto, diagnostics, health-check, escalation | 6 | medium |

最后更新: 2026-04-05
