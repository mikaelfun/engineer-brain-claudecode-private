# ACR 跨租户与 AAD 迁移 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-aks-acr-cross-tenant.md](../drafts/ado-wiki-aks-acr-cross-tenant.md), [ado-wiki-acr-move-to-different-aad-tenant.md](../drafts/ado-wiki-acr-move-to-different-aad-tenant.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认跨租户场景类型
> 来源: [MCVKB/ACR/cross-tenant](../../known-issues.jsonl) + [ADO Wiki — 多篇 TSG](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki)

**判断逻辑**：
| 场景 | 描述 | 后续动作 |
|------|------|---------|
| AKS 跨租户拉取 ACR 镜像 | AKS 在 Tenant A，ACR 在 Tenant B | → Phase 2 |
| ACR 整体迁移到另一 AAD 租户 | 保留注册表名和 login server | → Phase 3 |
| 外部用户访问 ACR（无 --aad-tenant-id） | 客户期望 ACR 支持类似 AKS 的 --aad-tenant-id 选项 | → Phase 4 |

`[结论: 🟢 8/10 — OneNote(3) + ADO Wiki 交叉(3) + 时效<6月(2) + Mooncake(2) — 多源交叉验证]`

### Phase 2: AKS 跨租户拉取 ACR 镜像
> 来源: [ADO Wiki — Set up AKS to pull from ACR in a different AD tenant](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant)

**前提**：AKS 在 Tenant A，ACR 在 Tenant B。Service Principal 在 Tenant A（home tenant）。需要 AKS 订阅的 Contributor 角色和 ACR 订阅的 Owner 角色。

#### 步骤 1: 启用多租户 AAD 应用

1. 在 Tenant A 的 Azure Portal → Azure AD → App registrations，找到 Service Principal 应用对象
2. 记下 **Application (client) ID**（步骤 2 和 4 需要）
3. 将 **Supported account types** 改为多租户
4. 创建 client secret（**重要**：确保在步骤 4 中使用此 client secret 更新 AKS）

#### 步骤 2: 在 ACR 租户中 Provision Service Principal

在 Tenant B 管理员账户下打开以下链接并接受权限请求：

```
https://login.microsoftonline.com/<ACR Tenant ID (Tenant B)>/oauth2/authorize?client_id=<Application (client) ID>&response_type=code&redirect_uri=<redirect url>
```

#### 步骤 3: 授予 ACR 镜像拉取权限

在 Tenant B 的 ACR 上为 Service Principal 分配 **AcrPull** 角色

#### 步骤 4: 更新 AKS Service Principal 凭据

使用步骤 1 收集的 Application (client) ID 和 client secret 更新 AKS：
- 参考：[更新 AKS 凭据](https://docs.microsoft.com/en-us/azure/aks/update-credentials#update-aks-cluster-with-new-service-principal-credentials)

> **参考**：[GitHub — acr/aks-acr-across-tenants](https://github.com/Azure/acr/blob/main/docs/aks-acr-across-tenants.md)

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 3: ACR 跨租户迁移（保留名称）
> 来源: [ADO Wiki — ACR Move to different AAD Tenant](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Move%20to%20different%20AAD%20Tenant)

**限制**：Azure 的 move object 操作无法直接在 AAD 租户间移动资源。Portal 会错误显示 ACR 不可移动。

#### 迁移策略

利用 **资源组可跨订阅移动** + **订阅可更改所属目录** 的特性：

```
创建临时资源组 → 移动 ACR → 移动到临时订阅 → 更改订阅目录 → 移回目标订阅/资源组
```

#### 前提条件

| 影响 | 说明 |
|------|------|
| ⚠️ RBAC 角色分配 | 用户/托管标识的 Azure RBAC 角色将**丢失** |
| ⚠️ Key Vault 访问 | 迁移后需修复 |
| ⚠️ Azure Stack | 需重新注册 |
| ✅ 必要权限 | 两个订阅都需要 **Owner** 角色 |

#### 详细步骤

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 在两个租户互邀管理员并授予 **Global Administrator** 角色 | |
| 2 | 在 Tenant A 创建临时订阅 "Temp" | |
| 3 | 为 "Temp" 订阅的两个租户管理员授予 **Owner** | |
| 4 | ACR Overview → Move → 选择 "Temp" 订阅和新资源组 | 等待验证 |
| 5 | Tenant A → Subscriptions → "Temp" → **Change Directory** → 选择 Tenant B | |
| 6 | 等待目录切换生效 | 可能需要较长时间 |
| 7 | 切换到 Tenant B 登录，验证 "Temp" 订阅可见 | |
| 8 | 确认 ACR 在 Container Registries 中可见 | 确保订阅筛选器设为 "all" |
| 9 | ACR Overview → Move → 选择 Tenant B 目标订阅和资源组 | 等待验证 |
| 10 | 验证 ACR 已在 Tenant B 目标位置 | |
| 11 | 删除 Temp 订阅 | |
| 12 | 从两个目录中移除 Guest Owner 用户 | |

#### 迁移后操作

如果使用签名（Content Trust）：需在 Tenant B 中为新用户/SP 分配角色：
```bash
az role assignment create --scope <registry ID> --role AcrImageSigner --assignee <user/sp>
az role assignment create --scope <registry ID> --role AcrPush --assignee <user/sp>
```

> **参考**: [DfM Case: 2201240060002313](../../known-issues.jsonl)

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 4: ACR 不支持 --aad-tenant-id
> 来源: [MCVKB/ACR/cross-tenant](../../known-issues.jsonl)

**症状**：客户期望 ACR 像 AKS 一样支持 `--aad-tenant-id` 选项指向不同 AAD 租户

**根因**：ACR 是 Azure 原生服务，与 Azure AD 和 RBAC 原生集成，只能认证托管 ACR 资源的 AAD 租户。AKS 有独立的 AAD 集成用于 kubectl 认证，但 ACR 没有此选项。

**替代方案**：

| 方案 | 说明 |
|------|------|
| **Azure Lighthouse** | 委托外部租户的安全组作为 ACR 资源组上的 delegated principal |
| **Guest 用户** | 将外部用户作为 Guest 邀请到 ACR 所在租户 |
| **CI/CD Pipeline** | 开发者在各自 ACR 开发，CI/CD 流程将批准的镜像导入生产 ACR |

> AKS 可从跨租户 ACR 拉取——开发者不需要直接 ACR 访问权限

`[结论: 🔵 7/10 — OneNote(3) + 时效<6月(2) + 单源文档(1) + 通用(1.5) — 扣分: 无多源验证]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR 不支持 --aad-tenant-id | ACR 原生绑定宿主 AAD 租户 | Lighthouse / Guest / CI/CD | 🔵 7 | [MCVKB/ACR/cross-tenant](../../known-issues.jsonl) |
| 2 📋 | AKS 跨租户拉取 ACR 镜像 | 需多租户 SP 配置 | 见 Phase 2 完整步骤 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant) |
| 3 📋 | ACR 迁移到另一 AAD 租户 | 不支持直接跨租户 move | 临时订阅+更改目录策略 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Move%20to%20different%20AAD%20Tenant) |
