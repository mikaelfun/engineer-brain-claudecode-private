# ACR 镜像删除、恢复与软删除 — 综合排查指南

**条目数**: 12 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**来源草稿**: 无
**Kusto 引用**: [manifest-statistics.md]
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 场景分类
> 来源: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) + [MCVKB](onenote)

客户关于 ACR 删除/恢复的请求分为两大类：

**判断逻辑**：
| 客户需求 | 后续动作 |
|---------|---------|
| 误删 ACR 注册表，需要恢复 | → Phase 2a |
| 误删镜像/仓库，需要恢复 | → Phase 2b |
| 软删除相关问题（Push/Import 被阻、恢复冲突） | → Phase 3 |
| 无法删除仓库/镜像（被锁定或 operation disallowed） | → Phase 4 |
| 删除后存储空间未释放 | → Phase 5 |
| 已删仓库仍在 Portal 显示 | → Phase 4c |

`[结论: 🟢 9/10 — OneNote(3) + ADO Wiki(2.5) + MS Learn(1.5) 三源交叉验证]`

### Phase 2a: ACR 注册表恢复
> 来源: [MCVKB](onenote) + [ADO Wiki — Recovery of Azure Container Registry](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FRecovery+of+Azure+Container+Registry)

⚠️ **无 SLA 保证**——不要向客户承诺恢复时间线。恢复窗口约 30 天，不保证成功。

**Step 1: 客户操作**

客户需先创建**同名空注册表**（所有参数必须匹配）：
- **相同**：名称、资源组、区域、订阅、SKU
- **不能启用**：异地复制、可用区

**Step 2: 确认原始注册表信息**

如果客户不记得原始 SKU/区域，使用 Kusto 查询：
```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(30d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| summarize arg_max(env_time, *) by RegistryId
| project RegistryId, RegistryLoginUri, env_time
```
`[工具: Kusto skill — manifest-statistics.md]`

**Step 3: 执行恢复**

| 环境 | 恢复方式 |
|------|---------|
| 公有云 | 联系 TA（Technical Advisor）通过 Jarvis/Geneva Dashboard 执行 |
| Gov Cloud | 提 ICM 到 ACR PG |
| 21V (Mooncake) | 联系 TA 或提 ICM |

**恢复后注意事项**：
- ✅ 镜像数据可恢复
- ❌ 认证信息（admin 密码、token）**无法恢复**——必须使用新凭据
- ❌ 私有端点/私有链路**不会恢复**——需客户重新创建

`[结论: 🟢 9/10 — OneNote(3) + ADO Wiki(2.5) 交叉验证 + 实证(3) + Mooncake 适用(2)]`

### Phase 2b: 镜像/仓库恢复
> 来源: [ADO Wiki — ACR Image or Repository Recovery](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Image%20or%20Repository%20Recovery)

**前提**：软删除未启用或 retention period（默认 7 天）已过期。

**Step 1: 查找已删除的仓库**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(30d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(Repository)
| summarize 
    TagCount = dcount(Tag),
    DigestCount = dcount(Digest),
    TotalSize = sum(BlobSize),
    LastActivity = max(env_time)
  by Repository
| order by TagCount desc
```
`[工具: Kusto skill — manifest-statistics.md]`

**Step 2: 获取 Tag 信息**

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity 
| where env_time > ago(2d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend Count = 1
| distinct Repository, Tag, Digest, Count
```
`[工具: Kusto skill — manifest-statistics.md]`

**Step 3: 确认并恢复**
1. 与客户确认需要恢复的 tag/digest
2. 联系 TA 执行镜像恢复

`[结论: 🟢 8.5/10 — ADO Wiki(2.5) + Kusto 验证(+1) + 近期(2) + Mooncake 适用(2) + 实证(2)]`

### Phase 3: 软删除相关问题
> 来源: [ADO Wiki — Soft Delete](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSoft+Delete)

#### Phase 3a: Push 被软删除阻断

**症状**：`manifest sha256:xxx was soft-deleted, and can be restored if needed`

Push 的镜像 digest 与回收站中已删除 manifest 相同 → ACR 阻止覆盖。

**解决方案**：先恢复，再操作
```bash
az acr manifest restore -r <registry> -n <repo>:<tag>
```

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(1.5)]`

#### Phase 3b: Import 被软删除阻断

**症状**：`Import failed: A soft-deleted image with digest sha256:xxx already exists in repository`

与 Phase 3a 同理——目标仓库回收站中有相同 digest 的 manifest。

**解决方案**：恢复后 Import 不再需要（镜像已在仓库中）
```bash
az acr manifest restore -r <registry> -n <repo>:<tag>
```

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(1.5)]`

#### Phase 3c: 恢复冲突 (METADATA_CONFLICT)

**症状**：`METADATA_CONFLICT: Tag latest already exists linked to a different digest, try force restore instead`

回收站中要恢复的 tag 在 live 仓库中已存在，但指向不同 digest。

**解决方案**：使用 force 标志覆盖
```bash
az acr manifest restore -r <registry> -n <repo>:<tag> -d sha256:<digest> -f
```

⚠️ 这会用回收站中的镜像**替换** live 仓库中当前 tag 指向的镜像。

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(1.5)]`

#### Phase 3d: 异地复制不支持软删除

**症状**：软删除命令返回 `repository not found`

⚠️ **已知限制**：ACR 软删除与异地复制目前互斥。

**解决方案**：移除异地复制后再使用软删除功能。

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(1.5)]`

### Phase 4: 删除失败排查
> 来源: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues)

#### Phase 4a: 三级锁定导致删除失败

**症状**：`The operation is disallowed on this registry, repository or image`

ACR 锁定存在**三个独立级别**，必须逐一解锁：

| 级别 | 检查命令 | 解锁命令 |
|------|---------|---------|
| Repository | `az acr repository show --name <reg> --repository <repo>` | `az acr repository update --name <reg> --repository <repo> --delete-enabled true --write-enabled true` |
| Image by Tag | `az acr repository show --name <reg> --image <repo>:<tag>` | `az acr repository update --name <reg> --image <repo>:<tag> --delete-enabled true --write-enabled true` |
| Image by Digest | `az acr repository show --name <reg> --image <repo>@sha256:<digest>` | `az acr repository update --name <reg> --image <repo>@sha256:<digest> --delete-enabled true --write-enabled true` |

⚠️ **关键陷阱**：通过 Tag 修改锁定时，输出会显示关联的 digest，但 **digest 级别的锁不会被自动更新**——必须单独解锁 digest 级别。

`[结论: 🟢 9/10 — ADO Wiki(2.5) + MS Learn(1.5) 交叉验证 + 实证(3) + Mooncake 适用(2)]`

#### Phase 4b: 无法删除空仓库 (NAME_UNKNOWN)

**症状**：`repository name not known to registry`

仓库内镜像已全部删除，留下孤立元数据。

**解决方案**：
1. 先推一个临时镜像到该仓库
2. 然后删除整个仓库（会清理所有镜像、tag、唯一层和 manifest）

`[结论: 🔵 6/10 — MS Learn 单源(1.5) + 近期(2) + 通用(1.5) + 单源文档(1)]`

#### Phase 4c: 已删仓库仍在 Portal 显示

**症状**：Portal 仍展示已删除仓库，点击进入报 NAME_UNKNOWN

**解决方案**：
1. 等待 Portal 缓存刷新（通常几分钟）
2. 通过 Kusto 验证删除是否成功（RegistryActivity 过滤 DELETE 方法）
3. 如果 Portal 持续不同步 → 升级到 ACR PG 执行 Geneva Action 重新同步 ARM 元数据

`[结论: 🟢 8/10 — ADO Wiki(2.5) + 近期(2) + 实证(2) + Mooncake 适用(1.5)]`

### Phase 5: 删除后存储空间未释放
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues)

**这是预期行为 (By Design)**。

ACR 使用层级去重（layer deduplication）——多个 manifest 可引用相同的层。删除一个镜像只移除其 manifest 和唯一层；共享层仍被其他 manifest 引用，不会删除。

**Kusto 验证存储使用分析**：
```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(BlobSize) and BlobSize > 0
| summarize 
    TotalSizeGB = round(sum(BlobSize) / 1024 / 1024 / 1024, 2),
    UniqueBlobs = dcount(Digest),
    RepositoryCount = dcount(Repository)
  by bin(env_time, 1d)
| order by env_time desc
```
`[工具: Kusto skill — manifest-statistics.md]`

**最大化空间回收**：删除所有共享公共基础层的镜像，或删除整个仓库。

`[结论: 🔵 6/10 — MS Learn 单源(1.5) + 近期(2) + 通用(1.5) + 单源文档(1)]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 误删 ACR 注册表需恢复 | 客户误操作 | 同名空注册表 + TA/ICM 恢复 | 🟢 9 | [MCVKB](onenote) + [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 2 | 三级锁定导致删除失败 | 三级独立锁未逐一解锁 | 分别解锁 repo/tag/digest 级别 | 🟢 9 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
| 3 | 误删镜像/仓库需恢复（软删除过期） | 超过 retention period | Kusto 查找 + TA 恢复 | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 4 | 已删仓库仍在 Portal 显示 | Portal 缓存 / ARM 元数据不同步 | 等待刷新或 Geneva Action 同步 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 5 | ACR 注册表恢复（详细 TA 流程） | 误删需专业恢复 | 同名重建 + TA Jarvis 恢复 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 6 | Push 被软删除 manifest 阻断 | 回收站中有相同 digest | az acr manifest restore | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 7 | Import 被软删除 image 阻断 | 同上 | az acr manifest restore | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 8 | 恢复冲突 METADATA_CONFLICT | tag 已存在但指向不同 digest | force restore (-f) | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 9 | 软删除不支持异地复制 | 已知限制，互斥 | 移除异地复制 | 🟢 8 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki) |
| 10 | 无法删除空仓库 (NAME_UNKNOWN) | 孤立元数据 | 先推临时镜像再删除仓库 | 🔵 6 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
| 11 | 删除后存储空间未释放 | 层级去重，共享层不删除 | By Design，删除所有共享层镜像 | 🔵 6 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
| 12 | 删除被 writeEnabled=false 阻断 | 镜像/仓库锁定 | 逐级解锁 writeEnabled | 🔵 7 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
