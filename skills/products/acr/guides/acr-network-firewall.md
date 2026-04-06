# ACR 网络与防火墙 — 排查速查

**来源数**: 8 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | `az acr build` 报 'client with IP x.x.x.x is not allowed access'，即使已启用 'Allow trusted services' | ACR Firewall 未放行 AzureContainerRegistry service tag IP 段（[已知问题](https://github.com/Azure/acr/issues/627)） | 获取 AzureContainerRegistry service tag IP 并加入 ACR 防火墙白名单：`Get-AzNetworkServiceTag` 取 IP 段 → 加入 ACR Firewall allowlist → 重试 build | 🟢 9 — OneNote 实证 | [MCVKB/ACR Firewall](../../known-issues.jsonl#acr-003) |
| 2 📋 | Container registry proxy server 问题（Azure China 拉取失败/慢） | Mooncake proxy 从 Global 拉取，高 CPU/高流量/客户网络问题 | 见融合排查指南 | 🟢 9 — OneNote+融合指南 | [MCVKB/proxy troubleshooting](drafts/onenote-acr-proxy-troubleshooting.md) |
| 3 | AKS 节点添加安全设备（Zscaler 等）后无法拉取 MCR 镜像 | 安全设备阻断了到 MCR proxy 的出站流量 | 收集客户出站 IP → 联系 AKS PG (Andy Zhang) 将 IP 加入 MCR proxy 白名单 | 🟢 9 — OneNote 实证 | [MCVKB/MCR proxy whitelist](../../known-issues.jsonl#acr-013) |
| 4 | Docker pull 超时/连接拒绝，ACR 开启了 vNET firewall | ACR vNET firewall 启用后流量经 data proxy (region-acr-dp.azurecr.io)，防火墙未放行该 FQDN | 放行：① ACR REST (myregistry.azurecr.io) ② Data endpoint (registry.region.data.azurecr.io 或 region-acr-dp.azurecr.io) ③ Geo-replicated 需放行所有 region 的 data endpoint | 🟢 8 — ADO Wiki+MS Learn 交叉 | [ADO Wiki/ACR Behind Firewall](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall) |
| 5 | 无法从 MCR 拉取 microsoft/* 镜像，连接超时 | 客户防火墙未放行 MCR 所需端点 | 放行 HTTPS：① mcr.microsoft.com (REST) ② *.data.mcr.microsoft.com (数据端点，替代旧 *.cdn.mscr.io) | 🔵 7 — ADO Wiki 单源 | [ADO Wiki/MCR Firewall Rules](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FMicrosoft%20Container%20Registry%20(MCR)%20Client%20Firewall%20Rules%20Configuration) |
| 6 | 跨订阅 VNET/Subnet 添加到 ACR 防火墙后刷新消失，无报错 | 第二个订阅未注册 Microsoft.ContainerRegistry RP | 在第二个订阅注册 RP：`az provider register --namespace Microsoft.ContainerRegistry` → 重新添加 VNET/Subnet | 🟢 8 — ADO Wiki 实证 | [ADO Wiki/Cross Subscription](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Virtual%20Network%20%26%20Firewall%20Configuration%20Cross%20Subscription) |
| 7 | AKS 拉取 ACR 报 403 Forbidden，已配 selected networks + AKS LB IP 白名单 + ACRPull 角色 | AKS subnet 上的 Microsoft.ContainerRegistry Service Endpoint 使流量走 Azure backbone（私有 IP），与 ACR selected-networks 公网 IP 白名单冲突 | 移除 AKS subnet 上的 Microsoft.ContainerRegistry Service Endpoint | 🟢 8 — ADO Wiki 实证 | [ADO Wiki/ServiceEndpoint Conflict](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20imagepull%20forbidden%20serviceendpoint) |
| 8 | ACR login/pull 报 403 DENIED 'client with IP not allowed access' | ACR 内置防火墙限制公网访问，客户 IP 不在允许列表 | 在 ACR Networking > Public access 中添加客户 IP，或使用 Azure Private Link 私有连接 | 🔵 6 — MS Learn 单源 | [MS Learn/ACR Auth Errors](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |

## 快速排查路径
1. 确认错误类型：403 Forbidden / 连接超时 / IP not allowed `[来源: 综合]`
2. 检查 ACR 网络配置：Networking blade → Public access / Selected networks / Private endpoint `[来源: MS Learn]`
3. 如果 403 + IP 被拒 → 检查客户出站 IP 是否在 ACR 防火墙白名单 `[来源: ADO Wiki]`
4. 如果 403 + AKS → 检查 AKS subnet 是否有 Microsoft.ContainerRegistry Service Endpoint（与 selected networks 冲突）`[来源: ADO Wiki]`
5. 如果超时 + vNET firewall → 检查是否放行了 data proxy FQDN (region-acr-dp.azurecr.io) `[来源: ADO Wiki]`
6. 如果 MCR 拉取失败 → 放行 mcr.microsoft.com + *.data.mcr.microsoft.com `[来源: ADO Wiki]`
7. 如果 Mooncake proxy 问题 → 走 proxy troubleshooting 融合指南 `[来源: OneNote]`
8. 跨订阅 VNET 规则不生效 → 检查目标订阅的 RP 注册 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-network-firewall.md#排查流程)
