# ACR ACR 缓存规则 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR cache rule creation fails with 'Resource names must contain alphanumeric cha | Cache rule name does not meet naming requirements: must be 5-50 characters, only | Rename the cache rule to comply with naming requirements: 5-50 characters, alpha | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-060] |
| 2 | ACR cache rule creation fails with error about unsupported upstream or login ser | ACR Caching (artifact cache) only supports a limited set of upstream registries. | Only pull from supported upstream registries. Check latest supported list at htt | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-061] |
| 3 | ACR cache rule with credential set fails with 'does not have secrets get permiss | The ACR system identity (Microsoft.ContainerRegistry/registries) was not granted | Grant Key Vault access: az keyvault set-policy --name <kvName> --object-id <acrS | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-062] |
| 4 | ACR cache rule creation fails with 'Quota exceeded for resource type cacheRules  | Cache rule limit reached. Maximum 1000 cache rules per registry (previously 50 d | Delete unneeded cache rules to free up quota. The limit is per-registry, not per | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-063] |

## 快速排查路径
1. 检查 → Cache rule name does not meet naming requirements: must be 5 `[来源: ADO Wiki]`
   - 方案: Rename the cache rule to comply with naming requirements: 5-50 characters, alphanumeric only, hyphen
2. 检查 → ACR Caching (artifact cache) only supports a limited set of  `[来源: ADO Wiki]`
   - 方案: Only pull from supported upstream registries. Check latest supported list at https://learn.microsoft
3. 检查 → The ACR system identity (Microsoft.ContainerRegistry/registr `[来源: ADO Wiki]`
   - 方案: Grant Key Vault access: az keyvault set-policy --name <kvName> --object-id <acrSystemIdentityOID> --
4. 检查 → Cache rule limit reached. Maximum 1000 cache rules per regis `[来源: ADO Wiki]`
   - 方案: Delete unneeded cache rules to free up quota. The limit is per-registry, not per-SKU. Upgrading SKU 

> 本 topic 有融合排查指南 → [完整排查流程](details/caching-cache-rules.md#排查流程)
