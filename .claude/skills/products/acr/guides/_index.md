# ACR 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [Connected Registry 与 Arc 扩展](connected-registry.md) | 📊 速查 | 0 | connected-registry, arc-extension, pvc, connection-string | 3 | high |
| [ACR API 版本弃用](api-deprecation.md) | 📋 融合 | 1 | api-deprecation, preview-api, policy-scan, migration | 2 | high |
| [ACR 认证与登录](authentication-login.md) | 📋 融合 | 1 | authentication, login, 401, 403 | 9 | high |
| [防火墙与网络规则](firewall-network-rules.md) | 📋 融合 | 1 | firewall, network-rules, ip-allowlist, selected-networks | 8 | high |
| [Private Endpoint 与 DNS 解析](private-endpoint-dns.md) | 📋 融合 | 1 | private-endpoint, private-link, dns, private-dns-zone | 10 | high |
| [Pull 超时与连接问题](pull-timeout-connectivity.md) | 📋 融合 | 1 | pull-failure, timeout, io-timeout, context-deadline-exceeded | 8 | high |
| [Content Trust 与 Notation 签名](content-trust-notation.md) | 📋 融合 | 0 | content-trust, notation, notary, signing | 7 | high |
| [ACR Tasks 与构建](acr-tasks-build.md) | 📋 融合 | 1 | acr-tasks, acr-build, buildhost-trace, agent-pool | 8 | high |
| [镜像删除调查与审计](image-deletion-forensics.md) | 📋 融合 | 2 | image-deletion, manifest-event, audit-logs, operator-ip | 4 | high |
| [镜像锁定与仓库管理](image-lock-repository.md) | 📊 速查 | 0 | image-lock, write-enabled, delete-enabled, immutable | 5 | high |
| [限流与间歇性错误](throttling-intermittent.md) | 📋 融合 | 2 | throttling, 429, 502, 503 | 4 | high |
| [RBAC 与权限管理](rbac-authorization.md) | 📋 融合 | 0 | rbac, abac, scope-map, token | 6 | high |
| [AKS 拉取 ACR 镜像](aks-image-pull.md) | 📊 速查 | 0 | aks, image-pull, managed-identity, AcrPull | 4 | high |
| [Push 失败与存储限制](push-storage-limit.md) | 📋 融合 | 2 | push-failure, storage-limit, 40tib, quarantine | 6 | high |
| [软删除与恢复冲突](soft-delete.md) | 📊 速查 | 0 | soft-delete, recycle-bin, metadata-conflict, force-restore | 4 | high |
| [注册表恢复与还原](recovery-restore.md) | 📋 融合 | 1 | recovery, undelete, jarvis, icm | 5 | high |
| [保留策略、清理与 Defender 扫描](retention-cleanup-defender.md) | 📋 融合 | 1 | retention-policy, purge, untagged-manifest, defender | 4 | high |
| [ACR 缓存规则](caching-cache-rules.md) | 📋 融合 | 0 | caching, cache-rule, upstream-registry, credential-set | 4 | high |
| [DNS 与注册表创建](dns-registry-creation.md) | 📋 融合 | 0 | dns, cname, registry-creation, name-reservation | 2 | high |
| [平台集成（Web App / Container Apps / Webhook）](platform-integration.md) | 📋 融合 | 1 | webhook, web-app, container-apps, migration | 5 | medium |

最后更新: 2026-04-07
