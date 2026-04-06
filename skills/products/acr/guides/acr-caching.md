# ACR Caching（Artifact Cache） — 排查速查

**来源数**: 4 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cache rule 创建失败 — 名称不合规（需 5-50 字符、字母数字+连字符） | Cache rule 名称不满足命名规则 | 重命名为 5-50 字符，仅字母数字，连字符可用作分隔符 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FCaching) |
| 2 | Cache rule 创建失败 — 不支持的上游 registry | ACR Caching 仅支持有限的上游注册表（Docker Hub、MCR 等） | 仅从支持的上游 registry 拉取；查看 MS Learn 最新支持列表 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FCaching) |
| 3 | Cache rule + credential set 失败 — Key Vault secrets get 权限不足 | ACR 系统标识未获 Key Vault 的 secrets get 权限 | `az keyvault set-policy --name <kv> --object-id <acrOID> --secret-permissions get` | 🟢 8 — ADO Wiki + 实证命令 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FCaching) |
| 4 | Cache rule 创建失败 — cacheRules 配额超限（SKU Standard） | Cache rule 上限 1000/registry（非按 SKU 区分）；错误信息误导：升级 SKU 不解决 | 删除不需要的 cache rule 释放配额；上限按 registry 计，升级 SKU 无效 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FCaching) |

## 快速排查路径
1. Cache rule 创建失败 → 先检查错误信息类型 `[来源: ADO Wiki]`
2. 命名错误 → 改名为 5-50 字符字母数字 `[来源: ADO Wiki]`
3. 上游不支持 → 确认 upstream registry 在支持列表中 `[来源: ADO Wiki]`
4. Key Vault 权限 → 为 ACR 系统标识添加 secrets get 权限 `[来源: ADO Wiki]`
5. 配额超限 → 清理旧 cache rule；**注意**：升级 SKU 不增加配额 `[来源: ADO Wiki]`
