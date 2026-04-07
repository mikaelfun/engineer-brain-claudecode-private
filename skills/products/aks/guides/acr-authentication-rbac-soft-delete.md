# AKS ACR 认证与 RBAC — soft-delete -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-05

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: 1) 使用 Kusto 查询 acr cluster 的 RegistryManifestEvent 表查找 DeleteRepository 操作获取 ArtifactType 和 Digest；2 `[source: ado-wiki]`
2. Check: 补全命令参数，例如 `az acr manifest list-deleted -r myRegistry -n hello-world:latest`，需要提供 -n 参数指定 repository `[source: ado-wiki]`
3. Check: 检查 tag 名称是否正确，使用 `az acr manifest list-deleted -r myRegistry -n hello-world` 列出所有已删除的 manifest 确认 ta `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/acr-authentication-rbac-soft-delete.md)
