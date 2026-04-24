# ACR 排查指南索引

| # | Topic | Title | Entries | Fusion | Score | Keywords | Sources | Files |
|---|-------|-------|---------|--------|-------|----------|---------|-------|
| 1 | connected-registry | Connected Registry 与 Arc 扩展 | 3 | — | 🔵 6.8 | connected-registry, arc-extension, pvc, connection-string, already-activated | AW | [speed](connected-registry.md) / [detail](details/connected-registry.md) |
| 2 | api-deprecation | ACR API 版本弃用 | 2 | ✅ | 🔵 7.0 | api-deprecation, preview-api, policy-scan, migration | AW | [speed](api-deprecation.md) / [detail](details/api-deprecation.md) / [workflow](workflows/api-deprecation.md) |
| 3 | authentication-login | ACR 认证与登录 | 9 | ✅ | 🔵 6.7 | authentication, login, 401, 403, unauthorized | AW ML | [speed](authentication-login.md) / [detail](details/authentication-login.md) / [workflow](workflows/authentication-login.md) |
| 4 | firewall-network-rules | 防火墙与网络规则 | 8 | ✅ | 🔵 6.9 | firewall, network-rules, ip-allowlist, selected-networks, service-tag | AW ML ON | [speed](firewall-network-rules.md) / [detail](details/firewall-network-rules.md) / [workflow](workflows/firewall-network-rules.md) |
| 5 | private-endpoint-dns | Private Endpoint 与 DNS 解析 | 10 | ✅ | 🔵 6.6 | private-endpoint, private-link, dns, private-dns-zone, vnet-link | AW ML | [speed](private-endpoint-dns.md) / [detail](details/private-endpoint-dns.md) / [workflow](workflows/private-endpoint-dns.md) |
| 6 | pull-timeout-connectivity | Pull 超时与连接问题 | 8 | ✅ | 🔵 6.8 | pull-failure, timeout, io-timeout, context-deadline-exceeded, mcr | AW ML ON | [speed](pull-timeout-connectivity.md) / [detail](details/pull-timeout-connectivity.md) / [workflow](workflows/pull-timeout-connectivity.md) |
| 7 | content-trust-notation | Content Trust 与 Notation 签名 | 7 | ✅ | 🔵 7.0 | content-trust, notation, notary, signing, verify | AW ON | [speed](content-trust-notation.md) / [detail](details/content-trust-notation.md) / [workflow](workflows/content-trust-notation.md) |
| 8 | acr-tasks-build | ACR Tasks 与构建 | 8 | ✅ | 🔵 7.2 | acr-tasks, acr-build, buildhost-trace, agent-pool, continuous-patching | AW ON | [speed](acr-tasks-build.md) / [detail](details/acr-tasks-build.md) / [workflow](workflows/acr-tasks-build.md) |
| 9 | image-deletion-forensics | 镜像删除调查与审计 | 4 | ✅ | 🔵 7.6 | image-deletion, manifest-event, audit-logs, operator-ip, bulk-deletion | AW ON | [speed](image-deletion-forensics.md) / [detail](details/image-deletion-forensics.md) / [workflow](workflows/image-deletion-forensics.md) |
| 10 | image-lock-repository | 镜像锁定与仓库管理 | 5 | — | 🔵 6.5 | image-lock, write-enabled, delete-enabled, immutable, NAME_UNKNOWN | AW ML | [speed](image-lock-repository.md) / [detail](details/image-lock-repository.md) |
| 11 | throttling-intermittent | 限流与间歇性错误 | 4 | ✅ | 🔵 7.5 | throttling, 429, 502, 503, egress | AW | [speed](throttling-intermittent.md) / [detail](details/throttling-intermittent.md) / [workflow](workflows/throttling-intermittent.md) |
| 12 | rbac-authorization | RBAC 与权限管理 | 6 | ✅ | 🔵 7.2 | rbac, abac, scope-map, token, custom-role | AW ON | [speed](rbac-authorization.md) / [detail](details/rbac-authorization.md) / [workflow](workflows/rbac-authorization.md) |
| 13 | aks-image-pull | AKS 拉取 ACR 镜像 | 4 | — | 🔵 7.2 | aks, image-pull, managed-identity, AcrPull, service-principal | AW | [speed](aks-image-pull.md) / [detail](details/aks-image-pull.md) |
| 14 | push-storage-limit | Push 失败与存储限制 | 6 | ✅ | 🔵 7.2 | push-failure, storage-limit, 40tib, quarantine, geo-replication | AW ML | [speed](push-storage-limit.md) / [detail](details/push-storage-limit.md) / [workflow](workflows/push-storage-limit.md) |
| 15 | soft-delete | 软删除与恢复冲突 | 4 | — | 🔵 6.5 | soft-delete, recycle-bin, metadata-conflict, force-restore, geo-replication | AW | [speed](soft-delete.md) / [detail](details/soft-delete.md) |
| 16 | recovery-restore | 注册表恢复与还原 | 5 | ✅ | 🔵 7.4 | recovery, undelete, jarvis, icm, registry-recovery | AW ON | [speed](recovery-restore.md) / [detail](details/recovery-restore.md) / [workflow](workflows/recovery-restore.md) |
| 17 | retention-cleanup-defender | 保留策略、清理与 Defender 扫描 | 4 | ✅ | 🔵 6.8 | retention-policy, purge, untagged-manifest, defender, vulnerability-scan | AW ML | [speed](retention-cleanup-defender.md) / [detail](details/retention-cleanup-defender.md) / [workflow](workflows/retention-cleanup-defender.md) |
| 18 | caching-cache-rules | ACR 缓存规则 | 4 | ✅ | 🔵 6.5 | caching, cache-rule, upstream-registry, credential-set, key-vault | AW | [speed](caching-cache-rules.md) / [detail](details/caching-cache-rules.md) / [workflow](workflows/caching-cache-rules.md) |
| 19 | dns-registry-creation | DNS 与注册表创建 | 2 | ✅ | 🔵 7.5 | dns, cname, registry-creation, name-reservation, custom-domain | AW | [speed](dns-registry-creation.md) / [detail](details/dns-registry-creation.md) / [workflow](workflows/dns-registry-creation.md) |
| 20 | platform-integration | 平台集成（Web App / Container Apps / Webhook） | 5 | ✅ | 🔵 6.4 | webhook, web-app, container-apps, migration, escalation | AW ML ON | [speed](platform-integration.md) / [detail](details/platform-integration.md) / [workflow](workflows/platform-integration.md) |

最后更新: 2026-04-24
