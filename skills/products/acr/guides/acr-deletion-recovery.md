# ACR 删除与恢复 — 排查速查

**来源数**: 12 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 误删 ACR 注册表或镜像 manifest，需要恢复 | 误操作删除 ACR 资源 | 重建同名/同 SKU/同 Region 的 ACR（关闭 geo-replication）→ 提交 ICM 到 ACR/Triage 团队恢复；~30 天保留，无 SLA | 🟢 10 — OneNote+Wiki 交叉验证 | [MCVKB/wiki_migration/.../ACR Recovery](skills/products/acr/guides/drafts/) |
| 2 | 设置 lock attributes 后无法删除 ACR repo/image，解锁后仍失败 | ACR 锁存在三个独立层级：Repository / Tag / Digest，解锁 Tag 不会自动解锁 Digest | 逐层检查并解锁：`az acr repository show` + `az acr repository update --delete-enabled true --write-enabled true`，三层均需独立操作 | 🟢 9 — ADO Wiki+MS Learn 交叉 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FEnable%20image%20and%20repository%20deletion%20with%20ACR%20locks) |
| 3 | 误删镜像/仓库，未启用 soft delete 或超过 7 天保留期 | 镜像被硬删除，需 PG 协助通过 Kusto 查找并恢复 | Kusto 查询 RegistryManifestEvent (Delete) + WorkerServiceActivity → 确认 tag/digest → 联系 TA 恢复 | 🟢 9 — ADO Wiki+OneNote 交叉 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Image%20or%20Repository%20Recovery) |
| 4 | 删除的 ACR 仓库仍显示在 Portal 中，报 NAME_UNKNOWN；CLI 删除报 `repository name not known` | Azure Portal 缓存未刷新；或 image lock 静默阻止了删除操作 | 等待 Portal 缓存刷新 → Kusto 验证删除是否成功 → 持续不一致则 escalate PG 执行 Geneva Action 同步 ARM 元数据 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FACR+unable+to+delete+repository) |
| 5 | 误删 ACR 注册表需要恢复/undelete | 客户发起的注册表删除，支持有限窗口内恢复 | 重建同名同配置 ACR（无 geo-replication/AZ）→ 联系 TA 通过 Jarvis/Geneva 恢复；Gov cloud 走 ICM；私有终结点不恢复需重建 | 🟢 9 — ADO Wiki+OneNote 交叉 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FRecovery+of+Azure+Container+Registry) |
| 6 | Docker push 失败 `manifest was soft-deleted, and can be restored if needed` | 推送的镜像 digest 与回收站中的 soft-deleted manifest 相同 | 先恢复软删除的 manifest：`az acr manifest restore -r <reg> -n <repo>:<tag>` → 恢复后正常推送 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSoft+Delete) |
| 7 | ACR import 失败 `soft-deleted image with digest already exists in repository` | 目标仓库回收站中存在相同 digest 的软删除 manifest | 恢复软删除镜像：`az acr manifest restore -r <reg> -n <repo>:<tag>` → 镜像已在 live repo 中，无需 import | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSoft+Delete) |
| 8 | Soft-delete restore 失败 `METADATA_CONFLICT: Tag already exists linked to a different digest` | 待恢复的 tag 在 live repo 中已存在且指向不同的 manifest | 使用 force restore：`az acr manifest restore -r <reg> -n <repo>:<tag> -d sha256:<digest> -f` 覆盖 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSoft+Delete) |
| 9 | Soft-delete 命令在 geo-replicated registry 上失败 `repository not found` | Soft Delete 不支持启用了 Geo-Replication 的注册表（互斥限制） | 移除 geo-replication 后才能使用 soft-delete 功能 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSoft+Delete) |
| 10 | 无法删除空 ACR 仓库，报 `NAME_UNKNOWN` | 镜像删除后遗留的孤立元数据 | 先推送一个 dummy 镜像到该仓库 → 再删除整个仓库 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
| 11 | acr purge 删除大量镜像后存储用量未下降 | ACR 层去重：多个 manifest 可引用相同层，删除镜像只移除 manifest 和独有层 | By design，共享层仍被其他 manifest 引用；要最大化释放空间需删除共享 base layer 的所有镜像 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |
| 12 | 删除 repo/image 失败 `The operation is disallowed on this registry, repository or image` | changeableAttributes.writeEnabled = false，锁阻止删除 | 检查并移除锁：`az acr repository show` → `az acr repository update --write-enabled true`（repo/manifest/tag 三层分别检查） | 🟢 8 — MS Learn+ADO Wiki 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/delete-operation-issues) |

## 快速排查路径

1. **区分场景** → 注册表被删 vs 镜像被删 vs 无法删除？`[来源: OneNote + ADO Wiki]`
2. **如果注册表被删** → 重建同名同配置 ACR（关闭 geo-replication + AZ）→ 联系 TA/PG 恢复 `[来源: OneNote + ADO Wiki]`
3. **如果镜像被删** → 检查 soft delete 是否启用 → 启用则 `az acr manifest restore` 恢复 `[来源: ADO Wiki]`
4. **如果 soft delete 未启用/超期** → Kusto 查询 RegistryManifestEvent 确认删除详情 → 联系 TA 协助恢复 `[来源: ADO Wiki]`
5. **如果无法删除** → 检查三层锁（Repo/Tag/Digest）逐层解锁 `[来源: ADO Wiki + MS Learn]`
6. **如果 soft delete 报错** → 区分 METADATA_CONFLICT（加 `-f`）/ geo-replication 不兼容 / digest 冲突 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-deletion-recovery.md#排查流程)
