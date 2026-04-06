# ACR 服务集成 — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS MI 拉取 ACR 镜像失败 `unauthorized: authentication required`，Pod 未配 imagePullSecrets | Kubelet MI 缺少 AcrPull 角色，attach-acr 时权限不足导致角色未创建 | detach+reattach ACR 或手动给 Kubelet MI 分配 AcrPull 角色 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20authentication%20with%20AKS%20deployed%20using%20Managed%20Identity) |
| 2 | AKS Service Connector 拉取 SC operator 镜像失败 `not found`，sc-extension 持续 failed | SC 扩展不自动更新，已安装版本硬锁定到已删除的 image tag | 删除 SC 扩展 → 重建 Service Connection 以安装新版本 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20image%20pulls%20fail%20service%20connector%20extension%20not%20auto%20updating) |
| 3 | Function App 从私有 ACR 拉取镜像失败（启用 Pull Over VNet），`manifest invalid` / `unknown blob` | VNET 拉取仅支持 Docker v2 manifest 格式，不支持 OCI image index 格式 | 确保镜像使用 Docker v2 格式 (`application/vnd.docker.distribution.manifest.v2+json`) 推送 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20image%20pulls%20fail%20unknown%20blob) |
| 4 | AKS 节点拉取 ACR 镜像失败，Kusto 可见认证错误 | Service Principal 凭据过期，或 AKS 配置的 SP 与 ACR IAM 中授权的 SP 不匹配 | 检查 SP 过期 → 重置凭据 → 验证 SP 匹配 → 必要时添加 AcrPull 角色 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FAKS+Nodes+Failing+To+Pull+Images+From+Azure+Container+Registry) |
| 5 | AKS attach-acr 后拉取失败：`EOF` / `Forbidden` / `401 Unauthorized`，check-acr 报 token exchange Forbidden | AKS 节点通过代理/防火墙出站，未放行 ACR 端点 | 防火墙放行：`<acr>.azurecr.io` + `<acr>.<region>.data.azurecr.io` + `*.blob.core.windows.net` | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FAKS+is+unable+to+pull+ACR+images) |
| 6 | Web App 拉取 ACR 镜像失败 `unauthorized` — admin user 或 MI 认证 | Admin: 凭据配置错误；MI: 缺少 AcrPull 角色或被 Azure Policy 阻止 | 验证 Admin 凭据匹配 / 验证 MI 的 AcrPull 角色分配 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/pull-image-to-web-app-fail) |
| 7 | Web App 拉取 ACR 失败 `client IP not allowed` — 出站 IP 被 ACR 防火墙拦截 | ACR 防火墙未包含 Web App 出站 IP | 添加 Web App 出站 IP 到 ACR 防火墙，或配置 VNet 集成 + ACR 私有终结点 | 🔵 6 — MS Learn 文档 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/pull-image-to-web-app-fail) |

## 快速排查路径

1. **确认认证方式** → MI / SP / Admin User？`[来源: ADO Wiki]`
2. **检查 RBAC** → Kubelet MI 或 SP 是否有 AcrPull 角色？`az role assignment list --assignee <identity-id> --scope <acr-id>` `[来源: ADO Wiki]`
3. **如果 SP** → 检查凭据是否过期：`az ad sp credential list --id <SP-ID>` `[来源: ADO Wiki]`
4. **如果网络受限** → 防火墙/代理是否放行 ACR REST + data + blob 端点？`[来源: ADO Wiki + MS Learn]`
5. **如果 Function App + VNet 拉取** → 确认镜像格式为 Docker v2（非 OCI）`[来源: ADO Wiki]`
6. **如果 Service Connector** → 检查 sc-extension 版本，必要时删除重建 `[来源: ADO Wiki]`
