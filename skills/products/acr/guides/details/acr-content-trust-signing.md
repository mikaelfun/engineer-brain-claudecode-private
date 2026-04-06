# ACR Content Trust 与 Notation 签名 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-acr-content-trust-delegation.md](../drafts/ado-wiki-acr-content-trust-delegation.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认签名技术路线 — DCT vs Notation
> 来源: [MCVKB/ACR/DCT 退役](../../known-issues.jsonl) + [ADO Wiki — Content Trust Delegation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs)

**首先确认客户使用的是哪种签名技术**：

| 技术 | 状态 | 关键特征 |
|------|------|---------|
| Docker Content Trust (DCT) | **即将退役** — 2026-05-31 后新注册表不可启用，2028-03-31 完全移除 | `DOCKER_CONTENT_TRUST=1`，基于 Notary v1/TUF |
| Notation (Notary Project) | **推荐** — 基于 ORAS + AKV 插件 | `notation sign/verify`，搭配 Azure Key Vault |

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 客户使用 DCT (`docker trust` 命令) | 传统签名，需迁移 | → Phase 2 |
| 客户使用 Notation (`notation sign/verify`) | 新签名方案 | → Phase 3 |
| 客户需要 DCT → Notation 迁移指导 | 迁移规划 | → Phase 2 + Phase 3 |
| 客户需要 CI/CD 自动化签名 | 流水线集成 | → Phase 4 |

`[结论: 🟢 9/10 — OneNote(3) + ADO Wiki 交叉验证(3) + 时效<6月(2) + Mooncake(2) — 多源交叉验证]`

### Phase 2: Docker Content Trust (DCT) — 使用与退役
> 来源: [MCVKB/ACR/DCT 退役](../../known-issues.jsonl) + [ADO Wiki — Content Trust Delegation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs)

#### 2a. DCT 退役时间线

| 时间 | 事件 |
|------|------|
| 2026-05-31 | 新注册表无法启用 DCT |
| 2028-03-31 | DCT 完全移除，所有签名数据永久删除 |

**迁移建议**：
1. 迁移到 Notary Project 签名 + Azure Key Vault：[官方指南](https://docs.azure.cn/zh-cn/container-registry/container-registry-tutorial-sign-build-push)
2. 审查并更新验证 DCT 的 Azure Policy 定义，避免 2026-05-31 后部署失败
3. 参考：[DCT 退役公告](https://docs.azure.cn/zh-cn/container-registry/container-registry-content-trust-deprecation)

#### 2b. DCT 架构与密钥体系 (TUF)

| 密钥 | 持有者 | 用途 |
|------|--------|------|
| Root key | 集合所有者 (离线) | 信任根，签署 root metadata |
| Snapshot key | 所有者/Notary 服务 | 签署 snapshot metadata |
| Timestamp key | Notary 服务 | 时效性保证 |
| Targets key | 集合所有者 | 签署 targets metadata，授权委托 |
| Delegation keys | 协作者 | 签署特定内容子集 |

**客户端 vs 服务端存储**：
- 客户端：所有 metadata 文件 + root/targets/delegation 私钥
- ACR 服务端：snapshot/timestamp 私钥

#### 2c. DCT 常见问题

**Admin 账户不支持签名**：
- ❌ ACR admin 账户不支持 signer 权限
- ✅ 使用 Service Principal，分配 `AcrImageSigner` + `AcrPush` RBAC 角色
- 参考：[授予签名权限](https://docs.microsoft.com/azure/container-registry/container-registry-content-trust#grant-image-signing-permissions)

**签名后出现未签名镜像（By Design）**：
- `docker trust sign` 先将镜像作为未签名镜像推送到注册表，然后通过 Notary 服务签名
- `DOCKER_CONTENT_TRUST=1`：客户端拉取信任 metadata → 验证 → 按 digest 拉取（可信）
- `DOCKER_CONTENT_TRUST=0` 或直接按 digest 拉取：跳过信任验证
- 消费者**必须**设置 `DOCKER_CONTENT_TRUST=1` 才能强制仅拉取已签名镜像

`[结论: 🟢 8.5/10 — OneNote(3) + ADO Wiki 交叉验证(3) + 时效<6月(2) + Mooncake(2) — 扣分: DCT 即将退役]`

### Phase 3: Notation (Notary Project) 签名与验证
> 来源: [ADO Wiki — Notary Image Signing and Verification](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification)

#### 3a. 签名失败 — Key Vault 权限不足

**症状**：`notation sign` 失败，`describe-key command failed: Caller is not authorized to perform action on resource`

**根因**：签名身份缺少 Key Vault 所需权限

**解决方案**（按 Key Vault 访问模型）：

| 访问模型 | 所需权限 |
|---------|---------|
| **RBAC** | Key Vault Crypto User + Key Vault Secrets User + Key Vault Certificate User |
| **Access Policy** | Keys: sign/get/list; Secrets: get/list; Certificates: get/list |

#### 3b. 验证失败 — 签名者不受信任

**症状**：`notation verify` 失败，`authenticity validation failed: signature is not produced by a trusted signer`

**根因**：签名使用的根 CA 证书不在 Notation trust store 中

**解决方案**：
1. 将根 CA 证书添加到 Notation trust store：
   ```bash
   notation cert add --type ca --store <store-name> <root-ca.pem>
   ```
2. 确保 trust policy 的 `trustStores` 字段引用了包含根 CA 证书的正确 trust store

#### 3c. 验证失败 — registryScopes 不匹配

**症状**：`notation verify` 失败，`artifact has no applicable trust policy. Trust policy applicability is determined by registryScopes`

**根因**：trust policy 的 `registryScopes` 未包含被验证的仓库

**解决方案**：
1. 更新 `registryScopes` 包含目标仓库（需完整仓库路径）：
   ```json
   "registryScopes": ["wabbitregistry.azurecr.io/net-monitor"]
   ```
2. ⚠️ 不支持注册表级别 scope（如 `wabbitregistry.azurecr.io`）— 必须指定完整仓库路径
3. 使用 `*` 匹配所有注册表/仓库
4. 导入更新的 policy：`notation policy import <policy-file>`

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源+实证(2) + 通用(1.5)]`

### Phase 4: CI/CD 自动化签名（DCT Delegation）
> 来源: [ADO Wiki — Content Trust Delegation](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs)

#### 角色分工

| 角色 | 职责 |
|------|------|
| **Alice** (管理团队) | 持有 root key / repository key，创建和分发 delegation key |
| **Bob** (开发团队) | 持有 Alice 分发的 delegation key，构建/推送/签名镜像 |

#### 流程步骤

**仓库初始化 (Alice)**：
1. 从 Key Vault 获取 root key
2. 创建 repository key，存入 KV
3. 使用 root + repository key 初始化仓库

**委托授权 (Alice → Bob)**：
1. 为 Bob 创建密钥对
2. 从 KV 获取 repository key
3. 添加 Bob 的公钥为 signer：
   ```bash
   docker trust signer add --key bob.pub bob <acr>.azurecr.io/<repo>
   ```
4. 发布变更到 ACR
5. 将密钥对发送给 Bob

**可信镜像推送 (Bob)**：
1. 推送未签名镜像到 ACR
2. 使用 delegation key 签名
3. 发布信任集合变更

**重要注意事项**：
- Alice 和 Bob 都需要 `AcrImageSigner` + `AcrPush` 角色
- RBAC 是注册表级别的 — 拥有这些角色的用户可以初始化任意仓库
- Owner 角色可通过 `DELETE /v2/<GUN>/_trust/tuf/` 删除信任集合

#### DCT 操作完整流程（手动）

1. 创建 Premium SKU ACR，启用 Content Trust
2. 认证：`docker login <acr>.azurecr.io`
3. 生成 delegation key：`docker trust key generate <username>`
4. 添加 signer：`docker trust signer add --key <pub-key> <signer-name> <repo>`
5. 构建镜像：`docker build -t <acr>.azurecr.io/<repo>:<tag>`
6. 签名：`docker trust sign <acr>.azurecr.io/<repo>:<tag>`
7. 验证：`docker trust inspect --pretty <acr>.azurecr.io/<repo>:<tag>`

`[结论: 🔵 7/10 — ADO Wiki(2.5) + 时效<6月(2) + 单源文档(1) + 通用(1.5) — 扣分: DCT 将退役，建议迁移到 Notation]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | DCT 将退役 (2026-05-31 / 2028-03-31) | Microsoft 转向 Notary Project | 迁移到 Notation + AKV | 🟢 9 | [MCVKB/ACR/DCT退役](../../known-issues.jsonl) |
| 2 | Admin 账户无法签名 DCT | admin 不支持 signer 权限 | 用 SP + AcrImageSigner + AcrPush 角色 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 3 | 签名后出现未签名镜像 | By Design: 先 push 再签名 | 消费者设置 DOCKER_CONTENT_TRUST=1 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 4 📋 | DCT delegation + CI/CD 自动化 | — | 见 Phase 4 完整流程 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 5 | Notation sign 报 Key Vault 权限不足 | 缺少 Crypto/Secrets/Certificate User 角色 | 分配 RBAC 角色或配置 Access Policy | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 6 | Notation verify 报签名者不受信任 | 根 CA 不在 trust store | notation cert add 添加根 CA | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 7 | Notation verify 报 registryScopes 不匹配 | trust policy 未包含目标仓库 | 更新 registryScopes 为完整仓库路径 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
