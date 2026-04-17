# AKS ACR 认证与 RBAC — soft-delete -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-acr-soft-delete.md
**Generated**: 2026-04-07

---

## Phase 1: 客户意外删除了 ACR 中的 image/repository，且未启用 soft-delete 或

### aks-361: ACR image or repository accidentally deleted, need to recover images that are be...

**Root Cause**: 客户意外删除了 ACR 中的 image/repository，且未启用 soft-delete 或 image 已超过 soft-delete 保留期（默认7天）。

**Solution**:
1) 使用 Kusto 查询 acr cluster 的 RegistryManifestEvent 表查找 DeleteRepository 操作获取 ArtifactType 和 Digest；2) 如 repository 创建时间不超过30天，可通过 WorkerServiceActivity 表查询 Tag 信息；3) 与客户确认需要恢复的 tag；4) 联系 TA 执行 image 恢复操作。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Image%20or%20Repository%20Recovery)]`

## Phase 2: 用户运行 az acr manifest 相关命令时未指定完整的仓库名或 tag/digest

### aks-412: ACR 命令报错 'You must provide either a fully qualified repository specifier' 或 'ful...

**Root Cause**: 用户运行 az acr manifest 相关命令时未指定完整的仓库名或 tag/digest

**Solution**:
补全命令参数，例如 `az acr manifest list-deleted -r myRegistry -n hello-world:latest`，需要提供 -n 参数指定 repository:tag

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 3: 用户运行 az acr manifest list-deleted-tags 命令时指定的 tag 

### aks-413: ACR soft-delete 查询报错 'No deleted manifests found for tag'

**Root Cause**: 用户运行 az acr manifest list-deleted-tags 命令时指定的 tag 名称有误（拼写错误或 tag 不存在于回收站中）

**Solution**:
检查 tag 名称是否正确，使用 `az acr manifest list-deleted -r myRegistry -n hello-world` 列出所有已删除的 manifest 确认 tag 名

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 4: 客户尝试推送的镜像（相同 digest）已存在于 ACR 回收站中，处于 soft-deleted 

### aks-414: 推送镜像到 ACR 报错 'manifest sha256:xxx was soft-deleted, and can be restored if neede...

**Root Cause**: 客户尝试推送的镜像（相同 digest）已存在于 ACR 回收站中，处于 soft-deleted 状态，ACR 阻止推送

**Solution**:
先恢复已删除的镜像：`az acr manifest restore -r myRegistry -n hello-world:latest`，恢复后镜像回到 live repository

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 5: 客户尝试 import 的镜像 digest 与回收站中已有的 soft-deleted 镜像相同

### aks-415: 导入镜像到 ACR 报错 'Import failed: A soft-deleted image with digest sha256:xxx already...

**Root Cause**: 客户尝试 import 的镜像 digest 与回收站中已有的 soft-deleted 镜像相同

**Solution**:
先恢复回收站中的镜像：`az acr manifest restore -r myRegistry -n hello-world:latest`，再进行 import 操作

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 6: 尝试恢复的 tag 名称已被 live repository 中另一个不同 digest 的镜像使用

### aks-416: 恢复 ACR soft-deleted 镜像报错 'METADATA_CONFLICT: Tag already exists linked to a diff...

**Root Cause**: 尝试恢复的 tag 名称已被 live repository 中另一个不同 digest 的镜像使用

**Solution**:
使用 force restore 覆盖现有 tag：`az acr manifest restore -r MyRegistry -n hello-world:latest -d sha256:abc123 -f`，-f 标志会用回收站中的镜像覆盖 live repository 中的 tag

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 7: 用户尝试恢复的 tag 或 digest 在回收站中不存在（可能已过保留期被永久删除，或名称有误）

### aks-417: 恢复 ACR soft-deleted 镜像报错 'NOT_FOUND: soft-deleted artifact was not found'

**Root Cause**: 用户尝试恢复的 tag 或 digest 在回收站中不存在（可能已过保留期被永久删除，或名称有误）

**Solution**:
让客户确认要恢复的 tag 或 digest 名称是否正确；使用 `az acr manifest list-deleted` 查看回收站中实际存在的 artifact；如已过保留期则无法恢复

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 8: ACR 启用了 Geo-Replication，而 Soft Delete 功能不支持 Geo-Re

### aks-418: ACR soft-delete 操作报错 'repository is not found'

**Root Cause**: ACR 启用了 Geo-Replication，而 Soft Delete 功能不支持 Geo-Replication 的 registry

**Solution**:
如需使用 Soft Delete，需移除 Geo-Replication 配置；或告知客户当前 Soft Delete 不支持 Geo-Replicated registry

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

## Phase 9: ACR Soft Delete 不支持启用了 Geo-Replication 的 registry，

### aks-419: ACR Soft Delete: Error repository not found (Geo-Replication enabled registry)

**Root Cause**: ACR Soft Delete 不支持启用了 Geo-Replication 的 registry，操作 soft delete 会报 repository not found。

**Solution**:
如需使用 Soft Delete，需先移除 Geo-Replication 配置。两者目前互斥。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR image or repository accidentally deleted, need to recover images that are be... | 客户意外删除了 ACR 中的 image/repository，且未启用 soft-delete 或 image 已超过... | 1) 使用 Kusto 查询 acr cluster 的 RegistryManifestEvent 表查找 Delet... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Image%20or%20Repository%20Recovery) |
| 2 | ACR 命令报错 'You must provide either a fully qualified repository specifier' 或 'ful... | 用户运行 az acr manifest 相关命令时未指定完整的仓库名或 tag/digest | 补全命令参数，例如 `az acr manifest list-deleted -r myRegistry -n hel... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 3 | ACR soft-delete 查询报错 'No deleted manifests found for tag' | 用户运行 az acr manifest list-deleted-tags 命令时指定的 tag 名称有误（拼写错误或... | 检查 tag 名称是否正确，使用 `az acr manifest list-deleted -r myRegistry... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 4 | 推送镜像到 ACR 报错 'manifest sha256:xxx was soft-deleted, and can be restored if neede... | 客户尝试推送的镜像（相同 digest）已存在于 ACR 回收站中，处于 soft-deleted 状态，ACR 阻止推... | 先恢复已删除的镜像：`az acr manifest restore -r myRegistry -n hello-wo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 5 | 导入镜像到 ACR 报错 'Import failed: A soft-deleted image with digest sha256:xxx already... | 客户尝试 import 的镜像 digest 与回收站中已有的 soft-deleted 镜像相同 | 先恢复回收站中的镜像：`az acr manifest restore -r myRegistry -n hello-w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 6 | 恢复 ACR soft-deleted 镜像报错 'METADATA_CONFLICT: Tag already exists linked to a diff... | 尝试恢复的 tag 名称已被 live repository 中另一个不同 digest 的镜像使用 | 使用 force restore 覆盖现有 tag：`az acr manifest restore -r MyRegi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 7 | 恢复 ACR soft-deleted 镜像报错 'NOT_FOUND: soft-deleted artifact was not found' | 用户尝试恢复的 tag 或 digest 在回收站中不存在（可能已过保留期被永久删除，或名称有误） | 让客户确认要恢复的 tag 或 digest 名称是否正确；使用 `az acr manifest list-delet... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 8 | ACR soft-delete 操作报错 'repository is not found' | ACR 启用了 Geo-Replication，而 Soft Delete 功能不支持 Geo-Replication ... | 如需使用 Soft Delete，需移除 Geo-Replication 配置；或告知客户当前 Soft Delete ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
| 9 | ACR Soft Delete: Error repository not found (Geo-Replication enabled registry) | ACR Soft Delete 不支持启用了 Geo-Replication 的 registry，操作 soft de... | 如需使用 Soft Delete，需先移除 Geo-Replication 配置。两者目前互斥。 | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FSoft%20Delete) |
