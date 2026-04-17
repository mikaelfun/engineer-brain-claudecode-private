# ACR Content Trust 与 Notation 签名 — 排查工作流

**来源草稿**: ado-wiki-a-acr-content-trust-delegation.md
**Kusto 引用**: (无)
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Content Trust 签名流程
> 来源: ado-wiki-a-acr-content-trust-delegation.md | 适用: Mooncake ✅

### 前置条件
- ACR **Premium SKU**
- Content Trust 已启用
- 使用 Service Principal + AcrImageSigner 角色（Admin 账号不支持签名权限）

### 操作步骤

1. **启用 Content Trust**
   - Portal: Registry → Content Trust → Enable

2. **生成 Delegation Key**
   ```bash
   docker trust key generate <signer-username>
   ```

3. **添加签名者到仓库**（同时初始化仓库，等同于 `notary init`）
   ```bash
   docker trust signer add --key <pub-key> <signer-name> <registry>/<repo>
   ```

4. **签名镜像**
   ```bash
   DOCKER_CONTENT_TRUST=1
   docker trust sign <acr-name>.azurecr.io/repo:tag
   ```

5. **验证签名**
   ```bash
   docker trust inspect --pretty <acr-name>.azurecr.io/repo:tag
   ```

### Pull 行为
- `DOCKER_CONTENT_TRUST=1` → 客户端从 Notary 获取信任元数据，验证后按 digest 拉取
- `DOCKER_CONTENT_TRUST=0` → 跳过验证直接拉取

---

## Scenario 2: Content Trust 自动化（Pipeline 签名）
> 来源: ado-wiki-a-acr-content-trust-delegation.md | 适用: Mooncake ✅

### 架构
- **Alice**（管理员）：持有 root key + repo key，创建 delegation key
- **Bob**（开发者）：持有 delegation key，构建+签名镜像

### 步骤

1. **Alice 初始化仓库**
   - 从 Key Vault 获取 root key
   - 创建 repo key 并存入 Key Vault
   - 使用 root + repo key 初始化仓库

2. **Alice 授权 Bob**
   - 为 Bob 创建 key pair
   - 使用 repo key 将 Bob 的 public key 添加为 signer
   - 安全传输 key pair 给 Bob

3. **Bob 签名推送**
   - Push 镜像（先以 untrusted 推送）
   - 使用 delegation key 签名
   - 发布 trust collection 变更到 ACR

### 权限要求
- Alice 和 Bob 都需要 SP with `AcrImageSigner` + `AcrPush` 角色
- RBAC 是 registry-wide（任何有权限的用户都可以初始化任意仓库）

---

## Scenario 3: Content Trust 排查要点
> 来源: ado-wiki-a-acr-content-trust-delegation.md | 适用: Mooncake ✅

### 常见问题

1. **Admin 账号签名失败**
   - Admin 账号不支持 signer 权限
   - 解决: 使用 SP with AcrImageSigner 角色

2. **验证签名来源**
   ```bash
   # 1. 启用 Content Trust Pull
   DOCKER_CONTENT_TRUST=1 docker pull <image>
   # 2. 检查签名者 public key ID
   docker trust inspect --pretty <image>
   # 3. 在 root.json 中核对 public key
   ```

3. **Notary Client 不支持**
   - Notary client 不被 ACR 官方支持（有已知 bug）
   - 必须使用 Docker CLI

4. **Trust pinning 不支持**
   - Docker CLI 不支持 trust pinning（仅 Notary client 支持）

5. **已签名镜像 = 未签名镜像 + Notary 签名**
   - 签名本质上是推送 untrusted 镜像 + 发布 Notary 签名
   - 可以用 `DOCKER_CONTENT_TRUST=0` 拉取未验证版本
