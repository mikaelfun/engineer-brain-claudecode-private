# ACR 镜像保留与清理 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR retention policy 对 untagged manifests 不生效，策略已启用且设置了保留天数 | Retention policy 不支持 MediaType v1 manifests 和 OCI image indexes (`application/vnd.oci.image.index.v1+json`)，仅清理 v2 manifests；`az acr import` 推送的镜像使用不受支持的 media type | 1) Kusto 查询 RegistryManifestEvent 确认 manifest MediaType 2) 升级 Docker/BuildKit 确保推送 v2 manifests 3) 避免用 `az acr import` 导入需要 retention 的镜像 4) 手动删除 v1/OCI index manifests | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20retention%20policy%20for%20untagged%20manifests%20does%20not%20work%20as%20expected) |
| 2 | 网络受限 ACR 无法使用 ACR Tasks 执行 purge 清理镜像 | ACR purge 默认作为 ACR Task 运行，网络规则限制下需 network bypass；客户不想或无法启用 bypass | 下载 ACR CLI 二进制 (https://github.com/azure/acr-cli) 在本地执行 purge 命令，绕过 ACR Tasks 和 network bypass 依赖 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Network%20Bypass%20Policy) |
| 3 | 需要批量列出 ACR 中所有超过指定日期的镜像/manifests（跨数千 repositories） | 无内置单命令跨仓库列出旧镜像；`az acr manifest list-metadata` 仅支持单 repository 查询 | Shell 脚本：1) `az acr repository list` 导出全部 repo 2) 分批迭代 3) 每个 repo 执行 `az acr manifest list-metadata --orderby time_asc --query "[?lastUpdateTime < '<date>']"` | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FShell+script+to+list+images+older+than+a+year+from+repos+in+ACR) |

## 快速排查路径
1. 确认客户的清理需求类型 `[来源: ADO Wiki]`
   - Retention policy 不生效 → 检查 manifest MediaType（#1）
   - 无法执行 purge → 检查网络限制和 ACR Tasks 可用性（#2）
   - 需要批量识别旧镜像 → 使用脚本方案（#3）
2. 如果 retention policy 不生效 → Kusto 查询 `RegistryManifestEvent` 确认 MediaType，v1/OCI index 需手动删除 `[来源: ADO Wiki]`
3. 如果网络受限无法 purge → 下载 ACR CLI 本地执行，无需 network bypass `[来源: ADO Wiki]`
4. 如果需要大规模清理 → 先用脚本列出目标镜像，再批量删除 `[来源: ADO Wiki]`
