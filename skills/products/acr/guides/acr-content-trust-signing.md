# ACR 内容信任与镜像签名 — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker Content Trust (DCT) 即将在 ACR 中退役；2026-05-31 后新 registry 无法启用 DCT，2028-03-31 完全移除 | Microsoft 将 DCT 替换为 Notary Project | 1) 迁移到 Notary Project 签名 + Azure Key Vault 2) 更新依赖 DCT 的 Azure Policy 定义 3) 已启用 DCT 的 registry 在 2028-03-31 前继续工作，之后签名和数据将永久删除 | 🟢 9 — OneNote+Mooncake 实证 | [MCVKB/.../DCT 退役](../../MCVKB) |
| 2 | Content Trust 签名失败 — 使用 ACR admin account 作为 signer 时权限错误 | ACR admin account 不支持 Content Trust signer 权限，仅支持基本 push/pull | 使用 Service Principal 并分配 AcrImageSigner + AcrPush RBAC 角色 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 3 | `docker trust sign` 后 ACR repository 中出现 unsigned/untrusted 镜像，客户困惑为何 `DOCKER_CONTENT_TRUST=0` 可拉取 | 设计行为：`docker trust sign` 先推送 untrusted 镜像再通过 Notary 签名；unsigned 层和签名元数据共存 | 预期行为。客户端必须设置 `DOCKER_CONTENT_TRUST=1` 才能强制仅拉取已签名镜像 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 4 📋 | 需要 ACR Content Trust 委托设置、密钥管理、CI/CD 自动化或 TUF/Notary 架构指导 | — | 见融合排查指南 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Content%20Trust%20Delegation%20Demo%20and%20FAQs) |
| 5 | Notation sign 失败：'describe-key command failed: Caller is not authorized to perform action on resource'（Azure Key Vault 插件） | 签名身份缺少 Key Vault 权限 | RBAC：分配 'Key Vault Crypto User' + 'Key Vault Secrets User' + 'Key Vault Certificate User'。Access Policy：配置 keys sign/get/list、secrets get/list、certificates get/list | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 6 | Notation verify 失败：'authenticity validation failed: signature is not produced by a trusted signer' | 签名使用的 Root CA 证书不在 Notation trust store 中 | `notation cert add` 添加 Root CA 证书到 trust store；确保 trust policy 的 `trustStores` 引用正确的 trust store | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 7 | Notation verify 失败：'artifact has no applicable trust policy. Trust policy applicability is determined by registryScopes' | Trust policy 的 `registryScopes` 未包含目标 repository 路径 | 更新 `registryScopes` 加入完整 repository 路径（如 `wabbitregistry.azurecr.io/net-monitor`）。注意：不支持 registry 级别 scope，必须指定完整 repo 路径。用 `'*'` 匹配所有。`notation policy import` 导入更新 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |

## 快速排查路径
1. 判断客户使用的签名技术 `[来源: OneNote + ADO Wiki]`
   - **DCT (旧)** → 即将退役，建议迁移到 Notary Project（#1）
   - **Notation (新)** → 继续排查 Notation 错误（#5-7）
2. 如果 DCT 签名失败 → 检查是否用 admin account（不支持），改用 SP + AcrImageSigner（#2） `[来源: ADO Wiki]`
3. 如果 DCT 签名后出现 unsigned 镜像 → 预期行为，需 `DOCKER_CONTENT_TRUST=1`（#3） `[来源: ADO Wiki]`
4. 如果 Notation sign 失败 `[来源: ADO Wiki]`
   - 401 Unauthorized → ACR 认证问题，检查 `az acr login` 和 AcrPull/AcrPush role
   - Key Vault 权限错误 → 分配 3 个 KV 角色（#5）
5. 如果 Notation verify 失败 `[来源: ADO Wiki]`
   - 'not produced by a trusted signer' → 添加 Root CA 到 trust store（#6）
   - 'no applicable trust policy' → 修正 `registryScopes`（#7）

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-content-trust-signing.md#排查流程)
