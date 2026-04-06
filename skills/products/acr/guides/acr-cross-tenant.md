# ACR 跨租户 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 客户想对 ACR 使用 --aad-tenant-id 选项（类似 AKS）指向不同 AAD 租户 | ACR 只能认证其所在租户的 AAD；不像 AKS 有独立 AAD 集成选项 | 1) Azure Lighthouse 委托管理 2) 将外部用户作为 Guest 加入 ACR 所在租户 3) 跨租户 CI/CD：各自 ACR 开发，Pipeline import 到生产 ACR | 🔵 7.5 — OneNote 单源 | [MCVKB/ACR aad-tenant-id](../../known-issues.jsonl#acr-014) |
| 2 📋 | AKS 需从不同 AAD 租户的 ACR 拉取镜像 — 跨租户 ACR-AKS 集成 | 跨租户场景需特殊配置 | 见融合指南详细步骤 | 🔵 7 — ADO Wiki 含融合指南 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant) |
| 3 📋 | 客户需将 ACR 迁移到不同 AAD 租户并保留 registry 名和 login server | 跨租户迁移需特殊流程 | 见融合指南详细步骤 | 🔵 7 — ADO Wiki 含融合指南 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Move%20to%20different%20AAD%20Tenant) |

## 快速排查路径
1. 客户要跨租户访问 ACR → 确认场景：是 AKS 拉取、开发协作、还是完整迁移 `[来源: OneNote]`
2. AKS 拉取跨租户 ACR → 见融合指南 cross-tenant 集成步骤 `[来源: ADO Wiki]`
3. ACR 整体迁移到另一租户 → 见融合指南 tenant 迁移流程 `[来源: ADO Wiki]`
4. 仅需跨租户协作 → 推荐 Azure Lighthouse 或 Guest 用户方案 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-cross-tenant.md#排查流程)
