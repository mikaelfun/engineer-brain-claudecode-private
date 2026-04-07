# ACR ACR 缓存规则 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-acr-caching.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Cache rule name does not meet naming requirements: must be 5
> 来源: ADO Wiki

1. Rename the cache rule to comply with naming requirements: 5-50 characters, alphanumeric only, hyphens allowed as separators. No special characters or spaces.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: ACR Caching (artifact cache) only supports a limited set of 
> 来源: ADO Wiki

1. Only pull from supported upstream registries. Check latest supported list at https://learn.microsoft.com/en-us/azure/container-registry/artifact-cache-overview#upstream-support. Docker.io and mcr.micr

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: The ACR system identity (Microsoft.ContainerRegistry/registr
> 来源: ADO Wiki

1. Grant Key Vault access: az keyvault set-policy --name <kvName> --object-id <acrSystemIdentityOID> --secret-permissions get. See https://learn.microsoft.com/en-us/azure/key-vault/general/assign-access-

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Cache rule limit reached. Maximum 1000 cache rules per regis
> 来源: ADO Wiki

1. Delete unneeded cache rules to free up quota. The limit is per-registry, not per-SKU. Upgrading SKU tier will not resolve this issue.

`[结论: 🟢 8.0/10 — ADO Wiki]`

---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR cache rule creation fails with 'Resource names must cont | Cache rule name does not | → Phase 1 |
| ACR cache rule creation fails with error about unsupported u | ACR Caching (artifact cache) only | → Phase 2 |
| ACR cache rule with credential set fails with 'does not have | The ACR system identity (Microsoft.Conta | → Phase 3 |
| ACR cache rule creation fails with 'Quota exceeded for resou | Cache rule limit reached. Maximum | → Phase 4 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR cache rule creation fails with 'Resource names must contain alphanumeric cha | Cache rule name does not meet naming requirements: must be 5-50 characters, only | Rename the cache rule to comply with naming requirements: 5-50 characters, alpha | 🟢 8.0 | ADO Wiki |
| 2 | ACR cache rule creation fails with error about unsupported upstream or login ser | ACR Caching (artifact cache) only supports a limited set of upstream registries. | Only pull from supported upstream registries. Check latest supported list at htt | 🟢 8.0 | ADO Wiki |
| 3 | ACR cache rule with credential set fails with 'does not have secrets get permiss | The ACR system identity (Microsoft.ContainerRegistry/registries) was not granted | Grant Key Vault access: az keyvault set-policy --name <kvName> --object-id <acrS | 🟢 8.0 | ADO Wiki |
| 4 | ACR cache rule creation fails with 'Quota exceeded for resource type cacheRules  | Cache rule limit reached. Maximum 1000 cache rules per registry (previously 50 d | Delete unneeded cache rules to free up quota. The limit is per-registry, not per | 🟢 8.0 | ADO Wiki |
